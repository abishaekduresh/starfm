<?php
require __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$host = $_ENV['DB_HOST'] ?? 'localhost';
$dbname = $_ENV['DB_NAME'] ?? 'starfm_db';
$user = $_ENV['DB_USER'] ?? 'root';
$pass = $_ENV['DB_PASS'] ?? '';

echo "Connecting to MySQL ($dbname)...\n";

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Running Migration...\n";

    // 1. Create Settings Table
    $db->exec("CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uuid INT(6) UNIQUE,
        setting_key VARCHAR(50) NOT NULL UNIQUE,
        setting_value TEXT,
        type ENUM('text', 'boolean', 'number', 'json') DEFAULT 'text',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "- Settings table created/checked.\n";

    // 2. Create Categories Table
    $db->exec("CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uuid INT(6) UNIQUE,
        name VARCHAR(255) NOT NULL,
        order_index INT DEFAULT 0,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "- Categories table created/checked.\n";

    // 3. Add category_id to channels if not exists
    $cols = $db->query("SHOW COLUMNS FROM channels LIKE 'category_id'")->fetchAll();
    if (empty($cols)) {
        $db->exec("ALTER TABLE channels ADD COLUMN category_id INT DEFAULT NULL"); // Removed FK to avoid constraint issues if categories empty
        echo "- Added category_id to channels.\n";
    }

    // 4. Seed Settings
    $defaultSettings = [
        ['app_name', 'Star FM', 'text'],
        ['ticker_text', 'Welcome to Star FM - The best digital radio experience!', 'text'],
        ['maintenance_mode', 'false', 'boolean'],
        ['primary_color', '#007bff', 'text'],
        ['contact_email', 'support@starfm.com', 'text']
    ];

    foreach ($defaultSettings as $setting) {
        $stmt = $db->prepare("SELECT COUNT(*) FROM settings WHERE setting_key = ?");
        $stmt->execute([$setting[0]]);
        if ($stmt->fetchColumn() == 0) {
            $uuid = random_int(100000, 999999);
            $stmtInsert = $db->prepare("INSERT INTO settings (uuid, setting_key, setting_value, type) VALUES (?, ?, ?, ?)");
            $stmtInsert->execute([$uuid, $setting[0], $setting[1], $setting[2]]);
            echo "  + Seeded setting: {$setting[0]}\n";
        }
    }

    // 5. Seed Categories
    $defaultCategories = ['Live Events', 'Music', 'News', 'Sports'];
    foreach ($defaultCategories as $index => $catName) {
        $stmt = $db->prepare("SELECT COUNT(*) FROM categories WHERE name = ?");
        $stmt->execute([$catName]);
        if ($stmt->fetchColumn() == 0) {
            $uuid = random_int(100000, 999999);
            $stmtInsert = $db->prepare("INSERT INTO categories (uuid, name, order_index, status) VALUES (?, ?, ?, 'active')");
            $stmtInsert->execute([$uuid, $catName, $index]);
            echo "  + Seeded category: {$catName}\n";
        }
    }

    echo "Migration Complete.\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
