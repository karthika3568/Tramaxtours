<?php
$passwords = ['', 'root', 'Mysql@1234', 'Admin@123', 'admin', 'password', 'Mysql@12345'];
foreach ($passwords as $pwd) {
    try {
        $p = new PDO('mysql:host=127.0.0.1;port=3306;dbname=tramaxtours', 'root', $pwd);
        echo "SUCCESS WITH PASSWORD: [$pwd]\n";
        exit(0);
    } catch (Exception $e) {
        echo "Failed with [$pwd]: " . $e->getMessage() . "\n";
    }
}
