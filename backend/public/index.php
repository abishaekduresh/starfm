<?php
use DI\Container;
use Slim\Factory\AppFactory;
use Slim\Exception\HttpNotFoundException;
use App\Middleware\CorsMiddleware;

require __DIR__ . '/../vendor/autoload.php';

// Load .env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Create Container
$container = new Container();

// Set Container to AppFactory
AppFactory::setContainer($container);
$app = AppFactory::create();
$app->setBasePath('/starfm.dureshtech.com/backend/public');

// Add Middleware
$app->addBodyParsingMiddleware();
$app->addRoutingMiddleware();

// CORS Middleware (Manual implementation if class not ready yet, but we will create class)
$app->add(new CorsMiddleware());

// Error Middleware
$errorMiddleware = $app->addErrorMiddleware(true, true, true);

// Dependencies
require __DIR__ . '/../src/Config/Dependencies.php';

// Routes
require __DIR__ . '/../src/Routes/api.php';

$app->run();
