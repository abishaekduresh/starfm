<?php
use Psr\Container\ContainerInterface;

$container->set('db', function(ContainerInterface $c) {
    $host = $_ENV['DB_HOST'];
    $dbname = $_ENV['DB_NAME'];
    $user = $_ENV['DB_USER'];
    $pass = $_ENV['DB_PASS'];

    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (\PDOException $e) {
        die("Connection failed: " . $e->getMessage());
    }
});

$container->set('settings', function() {
    return [
        'jwt_secret' => $_ENV['JWT_SECRET']
    ];
});
