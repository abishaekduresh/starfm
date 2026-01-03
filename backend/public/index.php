<?php
use DI\Container;
use Slim\Factory\AppFactory;
use Slim\Exception\HttpNotFoundException;
use App\Middleware\CorsMiddleware;

// Disable Cache Globally
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

require __DIR__ . '/../vendor/autoload.php';

// Load .env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Create Container
$container = new Container();

// Set Container to AppFactory
AppFactory::setContainer($container);
$app = AppFactory::create();

// Auto-detect Base Path
$scriptName = $_SERVER['SCRIPT_NAME']; // e.g., /backend/public/index.php
$basePath = dirname($scriptName);      // e.g., /backend/public
$app->setBasePath(rtrim($basePath, '/\\')); // Remove trailing slash

// Add Middleware
$app->addBodyParsingMiddleware();
$app->addRoutingMiddleware();



// Error Middleware
$errorMiddleware = $app->addErrorMiddleware(true, true, true);

// CORS Middleware (Must be added last to run first and wrap errors)
$app->add(new CorsMiddleware());

// Dependencies
require __DIR__ . '/../src/Config/Dependencies.php';

// Routes
require __DIR__ . '/../src/Routes/api.php';

$app->run();
