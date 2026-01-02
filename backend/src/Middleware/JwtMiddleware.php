<?php
namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Psr7\Response as SlimResponse;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtMiddleware
{
    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        $header = $request->getHeaderLine('Authorization');
        if (empty($header) || !preg_match('/Bearer\s(\S+)/', $header, $matches)) {
            return $this->errorResponse('Token not found', 401);
        }

        $token = $matches[1];
        $key = $_ENV['JWT_SECRET'];

        try {
            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            $request = $request->withAttribute('user', $decoded);
        } catch (\Exception $e) {
            return $this->errorResponse('Invalid token: ' . $e->getMessage(), 401);
        }

        return $handler->handle($request);
    }

    private function errorResponse($message, $status)
    {
        $response = new SlimResponse();
        $response->getBody()->write(json_encode(['error' => $message]));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}
