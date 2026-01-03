<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Psr7\Stream;

use Psr\Container\ContainerInterface;

class AdController
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
        $page = isset($params['page']) ? (int)$params['page'] : 1;
        $limit = 10;
        $offset = ($page - 1) * $limit;

        // Filters
        $type = $params['type'] ?? null;
        $status = $params['status'] ?? null;
        $search = $params['search'] ?? null;

        $where = [];
        $values = [];

        if ($type) {
            $where[] = "type = ?";
            $values[] = $type;
        }
        
        if ($status) {
            $where[] = "status = ?";
            $values[] = $status;
        } else {
            // Default: Hide deleted unless explicitly asked
            $where[] = "status != 'deleted'";
        }

        if ($search) {
            $where[] = "name LIKE ?";
            $values[] = "%$search%";
        }

        $whereSql = "";
        if (!empty($where)) {
            $whereSql = "WHERE " . implode(" AND ", $where);
        }

        // Fetch Ads
        $sql = "SELECT * FROM ads $whereSql ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
        $stmt = $db->prepare($sql);
        $stmt->execute($values);
        $ads = $stmt->fetchAll();

        // Count Total
        $countSql = "SELECT COUNT(*) as count FROM ads $whereSql";
        $stmtCount = $db->prepare($countSql);
        $stmtCount->execute($values);
        $total = $stmtCount->fetch()['count'];

        $response->getBody()->write(json_encode([
            'ads' => $ads,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => ceil($total / $limit),
                'total_records' => $total
            ]
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function create(Request $request, Response $response)
    {
        $data = $request->getParsedBody();
        $uploadedFiles = $request->getUploadedFiles();

        $name = $data['name'] ?? '';
        $type = $data['type'] ?? 'image';
        
        // Handle File Upload
        $filePath = null;
        if (isset($uploadedFiles['file']) && $uploadedFiles['file']->getError() === UPLOAD_ERR_OK) {
            if ($uploadedFiles['file']->getSize() > 1024 * 1024) {
                $response->getBody()->write(json_encode(['error' => 'File size exceeds 1MB limit']));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }
            $filePath = $this->moveUploadedFile($directory = __DIR__ . '/../../public/uploads', $uploadedFiles['file']);
        }

        $db = $this->container->get('db');
        
        // Generate UUID
        $uuid = \App\Helpers\IdGenerator::generate($db, 'ads');

        $stmt = $db->prepare("INSERT INTO ads (uuid, name, type, resolution, display_time, idle_time, redirect_url, show_on, status, expiry_time, click_tracking_enabled, file_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        try {
            $stmt->execute([
                $uuid,
                $name, 
                $type, 
                $data['resolution'] ?? null,
                $data['display_time'] ?? 10,
                $data['idle_time'] ?? 0,
                $data['redirect_url'] ?? null,
                $data['show_on'] ?? 'all',
                $data['status'] ?? 'active',
                !empty($data['expiry_time']) ? $data['expiry_time'] : null,
                isset($data['click_tracking_enabled']) ? 1 : 0,
                $filePath
            ]);
            
            $response->getBody()->write(json_encode(['message' => 'Ad created', 'id' => $db->lastInsertId()]));
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
        
        // Build query dynamically
        $fields = [];
        $values = [];
        
        $updatable = ['name', 'type', 'resolution', 'display_time', 'idle_time', 'redirect_url', 'show_on', 'status', 'expiry_time', 'click_tracking_enabled'];
        foreach ($updatable as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }

        if (isset($uploadedFiles['file']) && $uploadedFiles['file']->getError() === UPLOAD_ERR_OK) {
            if ($uploadedFiles['file']->getSize() > 1024 * 1024) {
                $response->getBody()->write(json_encode(['error' => 'File size exceeds 1MB limit']));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }
            $filePath = $this->moveUploadedFile($directory = __DIR__ . '/../../public/uploads', $uploadedFiles['file']);
            $fields[] = "file_path = ?";
            $values[] = $filePath;
        }

        if (empty($fields)) {
             $response->getBody()->write(json_encode(['message' => 'No changes']));
             return $response->withHeader('Content-Type', 'application/json');
        }

        $values[] = $id;
        $sql = "UPDATE ads SET " . implode(', ', $fields) . " WHERE id = ?";
        
        try {
            $stmt = $db->prepare($sql);
            $stmt->execute($values);
            $response->getBody()->write(json_encode(['message' => 'Ad updated']));
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
        
        $stmt = $db->prepare("UPDATE ads SET status = 'deleted', deleted_at = NOW() WHERE id = ?");
        $stmt->execute([$id]);

        $response->getBody()->write(json_encode(['message' => 'Ad deleted']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function trackClick(Request $request, Response $response, $args)
    {
        $id = $args['id'];
        $db = $this->container->get('db');
        
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $agent = $_SERVER['HTTP_USER_AGENT'] ?? null;
        
        $stmt = $db->prepare("INSERT INTO ad_click_logs (ad_id, ip_address, user_agent, location) VALUES (?, ?, ?, ?)");
        // Location is placeholder for now
        $stmt->execute([$id, $ip, $agent, 'Unknown']);

        $response->getBody()->write(json_encode(['message' => 'Click tracked']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    private function moveUploadedFile($directory, $uploadedFile)
    {
        $extension = pathinfo($uploadedFile->getClientFilename(), PATHINFO_EXTENSION);
        $basename = bin2hex(random_bytes(8));
        $filename = sprintf('%s.%0.8s', $basename, $extension);

        $uploadedFile->moveTo($directory . DIRECTORY_SEPARATOR . $filename);

        return 'uploads/' . $filename; // Relative path for DB
    }
}
