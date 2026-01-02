<?php
require 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$host = $_ENV['DB_HOST'];
$dbname = $_ENV['DB_NAME'];
$user = $_ENV['DB_USER'];
$pass = $_ENV['DB_PASS'];

echo "Connecting to MySQL...\n";

try {
    // Connect to MySQL server (without DB selected) to check/create DB
    $pdo = new PDO("mysql:host=$host", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Creating database if not exists...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname`");
    $pdo->exec("USE `$dbname`");

    echo "Importing schema...\n";
    $sql = file_get_contents('schema.sql');
    
    // Split by semicolon to execute statements
    $statements = array_filter(array_map('trim', explode(';', $sql)));

    foreach ($statements as $stmt) {
        if (!empty($stmt)) {
            $pdo->exec($stmt);
        }
    }

    echo "Database setup complete.\n";

} catch (PDOException $e) {
    die("DB Error: " . $e->getMessage() . "\n");
}
