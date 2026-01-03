<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Container\ContainerInterface;

class PublicController
{
    private $container;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    public function index(Request $request, Response $response)
    {
        if (!$this->validateAccess($request)) {
            $response->getBody()->write(json_encode(['status' => false, 'message' => 'Unauthorized Access. Missing X-API-KEY']));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }

        $deviceType = $this->getDeviceType($request);
        if (!$deviceType) {
            $response->getBody()->write(json_encode([
                'status' => false, 
                'message' => 'Missing or Invalid X-Device-Platform Header. Allowed: android, ios, web'
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $db = $this->container->get('db');

        // Determine Base URL
        $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? "https" : "http";
        $host = $_SERVER['HTTP_HOST'];
        $basePath = dirname($_SERVER['SCRIPT_NAME']);
        $basePath = rtrim($basePath, '/\\');
        $baseUrl = "$protocol://$host$basePath";

        // Fetch Settings
        $stmtSettings = $db->query("SELECT setting_key, setting_value FROM settings");
        $settingsRaw = $stmtSettings->fetchAll(\PDO::FETCH_ASSOC);
        $settings = [];
        foreach ($settingsRaw as $s) {
            $settings[$s['setting_key']] = $s['setting_value'];
        }

        // Fetch Query Params
        $params = $request->getQueryParams();
        $typeFilter = $params['type'] ?? null;
        $searchFilter = $params['search'] ?? null;

        // Fetch Active Channels (Filtered)
        $sql = "SELECT * FROM channels WHERE status = 'active'";
        $values = [];

        if ($typeFilter) {
            $sql .= " AND stream_type = ?";
            $values[] = $typeFilter;
        }

        if ($searchFilter) {
            $sql .= " AND name LIKE ?";
            $values[] = "%$searchFilter%";
        }

        $sql .= " ORDER BY name ASC";

        $stmtChannels = $db->prepare($sql);
        $stmtChannels->execute($values);
        $channels = $stmtChannels->fetchAll(\PDO::FETCH_ASSOC);

        // Process Channels URLs
        foreach ($channels as &$channel) {
            unset($channel['id']);
            unset($channel['category_id']);
            if (!empty($channel['logo_path'])) {
                $channel['logo_url'] = $baseUrl . '/' . ltrim($channel['logo_path'], '/');
            } else {
                $channel['logo_url'] = null;
            }
        }

        // Fetch Active Ads (Filtered by Device Type)
        $sql = "SELECT * FROM ads WHERE status = 'active' 
                AND (expiry_time IS NULL OR expiry_time > NOW()) 
                AND show_on IN (?, 'all')
                ORDER BY type ASC, id DESC";
        
        $stmtAds = $db->prepare($sql);
        $stmtAds->execute([$deviceType]);
        $ads = $stmtAds->fetchAll(\PDO::FETCH_ASSOC);

        // Process Ads URLs and Group by Type
        $adsByType = [];
        foreach ($ads as &$ad) {
            unset($ad['id']);
            if (!empty($ad['file_path'])) {
                $ad['file_url'] = $baseUrl . '/' . ltrim($ad['file_path'], '/');
            } else {
                $ad['file_url'] = null;
            }
            
            $type = $ad['type'] ?? 'other';
            if (!isset($adsByType[$type])) {
                $adsByType[$type] = [];
            }
            $adsByType[$type][] = $ad;
        }

        // Standard Response Format
        $responseData = [
            'status' => true,
            'message' => 'Data fetched successfully',
            'data' => [
                'settings' => $settings,
                'channels' => $channels,
                'ads' => $adsByType 
            ]
        ];

        $response->getBody()->write(json_encode($responseData));
        return $response->withHeader('Content-Type', 'application/json')
                        ->withHeader('Access-Control-Allow-Origin', '*'); 
    }

    public function trackClick(Request $request, Response $response, $args)
    {
        if (!$this->validateAccess($request)) {
             $response->getBody()->write(json_encode(['status' => false, 'message' => 'Unauthorized Access']));
             return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }

        $input = $request->getParsedBody();
        $id = $args['id'];
        $db = $this->container->get('db');
        
        // Use internal ID query
        $stmt = $db->prepare("SELECT id, click_tracking_enabled FROM ads WHERE id = ?");
        $stmt->execute([$id]);
        $ad = $stmt->fetch();

        if ($ad && $ad['click_tracking_enabled']) {
            $ip = $_SERVER['REMOTE_ADDR'];
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
            
            $insert = $db->prepare("INSERT INTO ad_click_logs (ad_id, ip_address, user_agent) VALUES (?, ?, ?)");
            $insert->execute([$ad['id'], $ip, $userAgent]);
        }

        $response->getBody()->write(json_encode(['message' => 'Click tracked']));
        return $response->withHeader('Content-Type', 'application/json')
                        ->withHeader('Access-Control-Allow-Origin', '*'); 
    }

    /**
     * Validate X-API-KEY
     */
    private function validateAccess(Request $request) {
        $apiKey = $_ENV['APP_API_KEY'] ?? '';
        $headerKey = $request->getHeaderLine('X-API-KEY');
        
        if (!empty($apiKey) && $headerKey === $apiKey) {
            return true;
        }
        
        return false;
    }

    /**
     * Parse X-Device-Platform header
     * Returns: 'app' (for android/ios), 'website' (for web), or null (invalid)
     */
    private function getDeviceType(Request $request) {
        $platform = strtolower($request->getHeaderLine('X-Device-Platform'));
        
        if (in_array($platform, ['android', 'ios'])) {
            return 'app';
        }
        
        if ($platform === 'web') {
            return 'website';
        }

        return null;
    }
}
