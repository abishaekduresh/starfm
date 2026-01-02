<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

use Psr\Container\ContainerInterface;

class DashboardController
{
    private $container;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    public function stats(Request $request, Response $response)
    {
        $db = $this->container->get('db');
        
        // Total Ads (including deleted to match list)
        $stmt = $db->query("SELECT COUNT(*) as count FROM ads");
        $totalAds = $stmt->fetch()['count'];

        // Active Ads
        $stmt = $db->query("SELECT COUNT(*) as count FROM ads WHERE status = 'active' AND (expiry_time IS NULL OR expiry_time > NOW()) AND deleted_at IS NULL");
        $activeAds = $stmt->fetch()['count'];

        // Expired Ads
        $stmt = $db->query("SELECT COUNT(*) as count FROM ads WHERE expiry_time <= NOW() AND deleted_at IS NULL");
        $expiredAds = $stmt->fetch()['count'];

        $user = $request->getAttribute('user');

        $data = [
            'user' => $user->data,
            'stats' => [
                'total_ads' => $totalAds,
                'active_ads' => $activeAds,
                'expired_ads' => $expiredAds
            ]
        ];

        $response->getBody()->write(json_encode($data));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
