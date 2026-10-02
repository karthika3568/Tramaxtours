<?php
$pdo = new PDO('mysql:host=127.0.0.1;port=3306', 'root', '');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "Creating database tramaxtours...\n";
$pdo->exec("CREATE DATABASE IF NOT EXISTS tramaxtours CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
$pdo->exec("USE tramaxtours");

echo "Importing schema.sql...\n";
$schemaSql = file_get_contents(__DIR__ . '/../database/schema.sql');
$pdo->exec($schemaSql);

echo "Importing seeds.sql...\n";
$seedsSql = file_get_contents(__DIR__ . '/../database/seeds.sql');
$pdo->exec($seedsSql);

echo "Database initialized successfully.\n";
