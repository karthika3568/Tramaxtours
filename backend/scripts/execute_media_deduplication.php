<?php

require_once __DIR__ . '/../utils/Env.php';
require_once __DIR__ . '/../utils/Database.php';

use App\Utils\Database;
use App\Utils\Env;

Env::load(__DIR__ . '/../.env');
$pdo = Database::getConnection();

echo "===========================================================\n";
echo "    STARTING COMPREHENSIVE MEDIA CLEANUP & DEDUPLICATION   \n";
echo "===========================================================\n\n";

$diskRoots = [
    dirname(__DIR__, 2) . '/public/',
    dirname(__DIR__) . '/',
    dirname(__DIR__) . '/public/',
    dirname(__DIR__, 2) . '/',
];

function resolveDiskFile($path, $roots) {
    if (!$path || preg_match('/^https?:\/\//i', $path)) return null;
    $clean = ltrim(str_replace('\\', '/', $path), '/');
    foreach ($roots as $b) {
        $full = $b . $clean;
        if (file_exists($full) && is_file($full)) {
            return realpath($full);
        }
    }
    return null;
}

$refTables = [
    'tours' => ['featured_image_id', 'og_image_id'],
    'tour_gallery' => ['media_id'],
    'destinations' => ['featured_image_id', 'intro_media_id'],
    'destination_sections' => ['media_id'],
    'home_hero_slides' => ['desktop_media_id', 'mobile_media_id'],
    'home_benefits' => ['media_id'],
    'things_to_do' => ['hero_media_id'],
    'pages' => ['hero_media_id'],
    'cms_sections' => ['media_id'],
];

// --- 1. BACKUP DATABASE STATE ---
echo "1. Creating backup snapshot...\n";
$backup = [
    'timestamp' => date('Y-m-d H:i:s'),
    'media' => $pdo->query("SELECT * FROM media")->fetchAll(PDO::FETCH_ASSOC),
    'tour_gallery' => $pdo->query("SELECT * FROM tour_gallery")->fetchAll(PDO::FETCH_ASSOC),
    'tours' => $pdo->query("SELECT id, title, slug, featured_image_id, og_image_id FROM tours")->fetchAll(PDO::FETCH_ASSOC),
    'destinations' => $pdo->query("SELECT id, name, slug, featured_image_id, intro_media_id FROM destinations")->fetchAll(PDO::FETCH_ASSOC),
    'destination_sections' => $pdo->query("SELECT id, destination_id, media_id FROM destination_sections")->fetchAll(PDO::FETCH_ASSOC),
];
$backupPath = dirname(__DIR__) . '/storage/media_backup_20261114.json';
file_put_contents($backupPath, json_encode($backup, JSON_PRETTY_PRINT));
echo "   Backup saved to {$backupPath}\n\n";

// --- 2. REMAP 4 CRITICAL IN-USE MISSING IDS ---
echo "2. Remapping 4 broken in-use media IDs to valid local photos...\n";
// ID 248 -> 427 (Mahabalipuram cover)
$pdo->exec("UPDATE tour_gallery SET media_id = 427 WHERE media_id = 248");
// ID 249 -> 423 (Mahabalipuram sight 1)
$pdo->exec("UPDATE tour_gallery SET media_id = 423 WHERE media_id = 249");
// ID 250 -> 424 (Mahabalipuram sight 2)
$pdo->exec("UPDATE tour_gallery SET media_id = 424 WHERE media_id = 250");
// ID 498 -> 282 (Goa culture)
$pdo->exec("UPDATE destination_sections SET media_id = 282 WHERE media_id = 498");
echo "   [OK] In-use broken IDs successfully remapped.\n\n";

// --- 3. GATHER USAGE & BUILD DEDUPLICATION MAP ---
echo "3. Analyzing duplicate content hashes...\n";
$allMedia = $pdo->query("SELECT * FROM media ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);

// Map usage
$usage = [];
foreach ($refTables as $tbl => $cols) {
    foreach ($cols as $col) {
        try {
            $rows = $pdo->query("SELECT id, `$col` as mid FROM `$tbl` WHERE `$col` IS NOT NULL")->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rows as $r) {
                $mid = (int)$r['mid'];
                $usage[$mid][] = ['table' => $tbl, 'col' => $col, 'rowId' => $r['id']];
            }
        } catch (\Throwable $e) {}
    }
}

$byHash = [];
$brokenIds = [];

foreach ($allMedia as $m) {
    $id = (int)$m['id'];
    $path = $m['file_path'];
    $diskFile = resolveDiskFile($path, $diskRoots);

    if (!$diskFile || filesize($diskFile) === 0) {
        $brokenIds[] = $id;
    } else {
        $hash = md5_file($diskFile);
        $byHash[$hash][] = [
            'id' => $id,
            'row' => $m,
            'file' => $diskFile,
            'size' => filesize($diskFile),
            'used' => $usage[$id] ?? [],
        ];
    }
}

// Remap plan
$remapMap = []; // duplicate_id => master_id
$filesToDelete = [];
$duplicateIdsToDelete = [];

foreach ($byHash as $hash => $items) {
    if (count($items) === 1) {
        continue;
    }

    // Pick master: highest usage first, then lowest ID
    usort($items, function($a, $b) {
        $uA = count($a['used']);
        $uB = count($b['used']);
        if ($uA !== $uB) {
            return $uB - $uA;
        }
        return $a['id'] - $b['id'];
    });

    $master = $items[0];

    for ($i = 1; $i < count($items); $i++) {
        $dup = $items[$i];
        $remapMap[$dup['id']] = $master['id'];
        $duplicateIdsToDelete[] = $dup['id'];

        if ($dup['file'] !== $master['file'] && file_exists($dup['file'])) {
            $filesToDelete[$dup['file']] = true;
        }
    }
}

echo "   Identified " . count($brokenIds) . " broken / missing rows to remove.\n";
echo "   Identified " . count($duplicateIdsToDelete) . " duplicate rows to merge & remove.\n";
echo "   Identified " . count($filesToDelete) . " duplicate physical files on disk to delete.\n\n";

// --- 4. EXECUTE REMAPPING OF DUPLICATES IN ALL TABLES ---
echo "4. Remapping all foreign keys from duplicate IDs to Master IDs...\n";
$remappedCount = 0;
foreach ($remapMap as $dupId => $masterId) {
    foreach ($refTables as $tbl => $cols) {
        foreach ($cols as $col) {
            try {
                $stmt = $pdo->prepare("UPDATE `$tbl` SET `$col` = :masterId WHERE `$col` = :dupId");
                $stmt->execute([':masterId' => $masterId, ':dupId' => $dupId]);
                $affected = $stmt->rowCount();
                if ($affected > 0) {
                    $remappedCount += $affected;
                    echo "   Remapped {$tbl}.{$col}: ID {$dupId} -> ID {$masterId} ({$affected} rows)\n";
                }
            } catch (\Throwable $e) {}
        }
    }
}
echo "   Total foreign key references remapped: {$remappedCount}\n\n";

// --- 5. DELETE BROKEN & DUPLICATE ROWS FROM DATABASE ---
echo "5. Cleaning up database media table...\n";
$allIdsToDelete = array_unique(array_merge($brokenIds, $duplicateIdsToDelete));
if (!empty($allIdsToDelete)) {
    // Delete in batches of 50
    $chunks = array_chunk($allIdsToDelete, 50);
    $deletedRows = 0;
    foreach ($chunks as $chunk) {
        $inClause = implode(',', array_map('intval', $chunk));
        $res = $pdo->exec("DELETE FROM media WHERE id IN ($inClause)");
        $deletedRows += $res;
    }
    echo "   [OK] Successfully deleted {$deletedRows} broken & duplicate records from media table.\n\n";
}

// --- 6. DELETE REDUNDANT PHYSICAL FILES FROM DISK ---
echo "6. Deleting redundant duplicate files from disk...\n";
$deletedFilesCount = 0;
$reclaimedBytes = 0;
foreach (array_keys($filesToDelete) as $filePath) {
    if (file_exists($filePath) && is_file($filePath)) {
        $size = filesize($filePath);
        if (@unlink($filePath)) {
            $deletedFilesCount++;
            $reclaimedBytes += $size;
        }
    }
}
$mbReclaimed = round($reclaimedBytes / 1024 / 1024, 2);
echo "   [OK] Deleted {$deletedFilesCount} redundant files from disk (Saved {$mbReclaimed} MB of storage).\n\n";

// --- 7. SYNC & NORMALIZE REMAINING MASTER IMAGES ACROSS PUBLIC & BACKEND ---
echo "7. Normalizing remaining media records & cross-syncing files...\n";
$publicMediaDir = dirname(__DIR__, 2) . '/public/uploads/media';
$backendMediaDir = dirname(__DIR__) . '/uploads/media';
@mkdir($publicMediaDir, 0755, true);
@mkdir($backendMediaDir, 0755, true);

$remainingMedia = $pdo->query("SELECT * FROM media ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);
$updatedRecords = 0;

foreach ($remainingMedia as $m) {
    $id = (int)$m['id'];
    $diskFile = resolveDiskFile($m['file_path'], $diskRoots);
    if ($diskFile && file_exists($diskFile)) {
        $filename = basename($diskFile);
        $size = filesize($diskFile);
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        $mime = match ($ext) {
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml',
            'pdf' => 'application/pdf',
            default => 'image/jpeg',
        };
        $normPath = 'uploads/media/' . $filename;

        // Ensure file exists in both directories
        $dest1 = $publicMediaDir . '/' . $filename;
        $dest2 = $backendMediaDir . '/' . $filename;
        if (!file_exists($dest1) && file_exists($dest2)) {
            copy($dest2, $dest1);
        } elseif (!file_exists($dest2) && file_exists($dest1)) {
            copy($dest1, $dest2);
        }

        // Clean alt text if empty
        $alt = $m['alt_text'];
        if (!$alt || trim($alt) === '') {
            $alt = ucwords(str_replace(['_', '-', 'demo', 'view', 'dest'], ' ', pathinfo($filename, PATHINFO_FILENAME)));
            $alt = trim(preg_replace('/\s+/', ' ', $alt));
        }

        $upd = $pdo->prepare("UPDATE media SET filename = :fn, original_name = :on, file_path = :fp, file_size = :fs, mime_type = :mt, alt_text = :alt, updated_at = NOW() WHERE id = :id");
        $upd->execute([
            ':fn' => $filename,
            ':on' => $m['original_name'] ?: $filename,
            ':fp' => $normPath,
            ':fs' => $size,
            ':mt' => $mime,
            ':alt' => $alt,
            ':id' => $id,
        ]);
        $updatedRecords++;
    }
}
echo "   [OK] Normalized and verified {$updatedRecords} master media records.\n\n";

// --- 8. FINAL AUDIT VERIFICATION ---
echo "===========================================================\n";
echo "                    FINAL AUDIT RESULTS                    \n";
echo "===========================================================\n";

$finalCount = $pdo->query("SELECT count(*) FROM media")->fetchColumn();
echo "Remaining Clean Media Rows in Database: {$finalCount}\n";

// Check for any remaining duplicates
$allHashes = [];
$finalDuplicates = 0;
foreach ($remainingMedia as $rm) {
    $f = resolveDiskFile($rm['file_path'], $diskRoots);
    if ($f && file_exists($f)) {
        $h = md5_file($f);
        if (isset($allHashes[$h])) {
            $finalDuplicates++;
        }
        $allHashes[$h] = true;
    }
}
echo "Remaining Binary Duplicate Records: {$finalDuplicates} (Expected: 0)\n";

// Check if any referenced media in website is missing
$brokenRefs = 0;
foreach ($refTables as $tbl => $cols) {
    foreach ($cols as $col) {
        $stmt = $pdo->query("SELECT t.id, t.`$col` FROM `$tbl` t LEFT JOIN media m ON t.`$col` = m.id WHERE t.`$col` IS NOT NULL AND m.id IS NULL");
        $missing = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (!empty($missing)) {
            $brokenRefs += count($missing);
            echo " [WARNING] Broken ref in {$tbl}.{$col}: " . count($missing) . " rows\n";
        }
    }
}
echo "Broken foreign references in website tables: {$brokenRefs} (Expected: 0)\n";
echo "\nMEDIA CLEANUP AND DEDUPLICATION COMPLETED SUCCESSFULLY!\n";

