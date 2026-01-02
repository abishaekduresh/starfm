<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Firebase\JWT\JWT;
use PDO;

use Psr\Container\ContainerInterface;

class AuthController
{
    private $container;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    public function register(Request $request, Response $response)
    {
        $data = $request->getParsedBody();
        $name = $data['name'] ?? '';
        $email = $data['email'] ?? '';
        $phone = $data['phone'] ?? '';
        $password = $data['password'] ?? '';

        if (!$email || !$password) {
            $response->getBody()->write(json_encode(['error' => 'Email and password required']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $db = $this->container->get('db');
        
        // Check if user exists
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $response->getBody()->write(json_encode(['error' => 'Email already exists']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        
        // Generate UUID
        $uuid = \App\Helpers\IdGenerator::generate($db, 'users');

        $stmt = $db->prepare("INSERT INTO users (uuid, name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)");
        
        try {
            $stmt->execute([$uuid, $name, $email, $phone, $hash]);
            $response->getBody()->write(json_encode(['message' => 'User registered successfully']));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Registration failed']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function login(Request $request, Response $response)
    {
        $data = $request->getParsedBody();
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        $db = $this->container->get('db');
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            $key = $this->container->get('settings')['jwt_secret'];
            $payload = [
                'iss' => 'star-fm',
                'aud' => 'star-fm',
                'iat' => time(),
                'nbf' => time(),
                'exp' => time() + 3600 * 24, // 24 hours
                'data' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email']
                ]
            ];
            $jwt = JWT::encode($payload, $key, 'HS256');
            
            $response->getBody()->write(json_encode([
                'token' => $jwt,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email']
                ]
            ]));
            return $response->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['error' => 'Invalid credentials']));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
}
