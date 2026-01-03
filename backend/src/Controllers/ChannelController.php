<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Container\ContainerInterface;

class ChannelController
{
    private $container;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    public function index(Request $request, Response $response)
    {
        $db = $this->container->get('db');
        
        $params = $request->getQueryParams();
        $type = $params['type'] ?? null;
        $status = $params['status'] ?? null;
        $search = $params['search'] ?? null;

        $sql = "SELECT * FROM channels WHERE 1=1";
        $values = [];

        if ($type) {
            $sql .= " AND stream_type = ?";
            $values[] = $type;
        }

        if ($status) {
            $sql .= " AND status = ?";
            $values[] = $status;
        } else {
            // Default: Hide deleted unless explicitly asked
            $sql .= " AND status != 'deleted'";
        }

        if ($search) {
            $sql .= " AND name LIKE ?";
            $values[] = "%$search%";
        }

        $sql .= " ORDER BY name ASC";

        $stmt = $db->prepare($sql);
        $stmt->execute($values);
        $channels = $stmt->fetchAll();

        $response->getBody()->write(json_encode(['channels' => $channels]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function show(Request $request, Response $response, $args)
    {
        $id = $args['id'];
        $db = $this->container->get('db');
        
        $stmt = $db->prepare("SELECT * FROM channels WHERE id = ?");
        $stmt->execute([$id]);
        $channel = $stmt->fetch();

        if (!$channel) {
            $response->getBody()->write(json_encode(['error' => 'Channel not found']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode($channel));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function create(Request $request, Response $response)
    {
        $data = $request->getParsedBody();
        $uploadedFiles = $request->getUploadedFiles();

        $name = $data['name'] ?? '';
        $stream_url = $data['stream_url'] ?? '';
        $stream_type = $data['stream_type'] ?? 'HLS';
        $status = $data['status'] ?? 'active';

        if (empty($name) || empty($stream_url)) {
             $response->getBody()->write(json_encode(['error' => 'Name and Stream URL are required']));
             return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        // Handle Logo Upload
        $logoPath = null;
        if (isset($uploadedFiles['logo']) && $uploadedFiles['logo']->getError() === UPLOAD_ERR_OK) {
            if ($uploadedFiles['logo']->getSize() > 1024 * 1024) {
                 $response->getBody()->write(json_encode(['error' => 'Logo size exceeds 1MB limit']));
                 return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }
            $logoPath = $this->moveUploadedFile(__DIR__ . '/../../public/uploads', $uploadedFiles['logo']);
        }

        $db = $this->container->get('db');
        
        try {
            // Generate UUID
        $uuid = \App\Helpers\IdGenerator::generate($db, 'channels');

        $stmt = $db->prepare("INSERT INTO channels (uuid, name, stream_type, stream_url, logo_path, status) VALUES (?, ?, ?, ?, ?, ?)");
        
            $stmt->execute([
                $uuid,
                $name, 
                $stream_type, 
                $stream_url, 
                $logoPath, 
                $status
            ]);
            $response->getBody()->write(json_encode(['message' => 'Channel created', 'id' => $db->lastInsertId()]));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function update(Request $request, Response $response, $args)
    {
        $id = $args['id'];
        $data = $request->getParsedBody();
        $uploadedFiles = $request->getUploadedFiles();
        
        $db = $this->container->get('db');
        
        $fields = [];
        $values = [];
        
        $updatable = ['name', 'stream_type', 'stream_url', 'status'];
        foreach ($updatable as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }

        if (isset($uploadedFiles['logo']) && $uploadedFiles['logo']->getError() === UPLOAD_ERR_OK) {
             if ($uploadedFiles['logo']->getSize() > 1024 * 1024) {
                 $response->getBody()->write(json_encode(['error' => 'Logo size exceeds 1MB limit']));
                 return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }
            $logoPath = $this->moveUploadedFile(__DIR__ . '/../../public/uploads', $uploadedFiles['logo']);
            $fields[] = "logo_path = ?";
            $values[] = $logoPath;
        }

        if (empty($fields)) {
             $response->getBody()->write(json_encode(['message' => 'No changes']));
             return $response->withHeader('Content-Type', 'application/json');
        }

        $values[] = $id;
        $sql = "UPDATE channels SET " . implode(', ', $fields) . " WHERE id = ?";
        
        try {
            $stmt = $db->prepare($sql);
            $stmt->execute($values);
            $response->getBody()->write(json_encode(['message' => 'Channel updated']));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
             $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function delete(Request $request, Response $response, $args)
    {
        $id = $args['id'];
        $db = $this->container->get('db');
        
        $stmt = $db->prepare("UPDATE channels SET status = 'deleted', deleted_at = NOW() WHERE id = ?");
        $stmt->execute([$id]);

        $response->getBody()->write(json_encode(['message' => 'Channel deleted']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    private function moveUploadedFile($directory, $uploadedFile)
    {
        $extension = pathinfo($uploadedFile->getClientFilename(), PATHINFO_EXTENSION);
        $basename = bin2hex(random_bytes(8));
        $filename = sprintf('%s.%0.8s', $basename, $extension);

        $uploadedFile->moveTo($directory . DIRECTORY_SEPARATOR . $filename);

        return 'uploads/' . $filename;
    }
}
