<?php
use Slim\Routing\RouteCollectorProxy;
use App\Controllers\AuthController;
use App\Controllers\AdController;
use App\Controllers\DashboardController;
use App\Middleware\JwtMiddleware;

$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});

$app->group('/api', function (RouteCollectorProxy $group) {
    
    // Auth Routes
    $group->post('/register', [AuthController::class, 'register']);
    $group->post('/login', [AuthController::class, 'login']);

    // Protected Routes
    $group->group('', function (RouteCollectorProxy $protected) {
        
        $protected->get('/dashboard', [DashboardController::class, 'stats']);
        
        // Ads CRUD
        $protected->get('/ads', [AdController::class, 'index']);
        $protected->post('/ads', [AdController::class, 'create']);
        $protected->post('/ads/{id}', [AdController::class, 'update']); 
        $protected->delete('/ads/{id}', [AdController::class, 'delete']);

        // Channels CRUD
        $protected->get('/channels', [App\Controllers\ChannelController::class, 'index']);
        $protected->get('/channels/{id}', [App\Controllers\ChannelController::class, 'show']);
        $protected->post('/channels', [App\Controllers\ChannelController::class, 'create']);
        $protected->post('/channels/{id}', [App\Controllers\ChannelController::class, 'update']);
        $protected->delete('/channels/{id}', [App\Controllers\ChannelController::class, 'delete']);
        
    })->add(new JwtMiddleware()); // We need to create this middleware

    // Public Ad Click Tracking
    $group->post('/ads/{id}/click', [AdController::class, 'trackClick']);

    // Public Aggregated Data (Channels + Ads)
    $group->get('/streams', [App\Controllers\PublicController::class, 'index']);
});
