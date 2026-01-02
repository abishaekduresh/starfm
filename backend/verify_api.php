<?php
// Function to make HTTP requests
function request($method, $url, $data = null, $token = null) {
    $opts = [
        'http' => [
            'method' => $method,
            'header' => "Content-Type: application/json\r\n" . 
                        ($token ? "Authorization: Bearer $token\r\n" : ""),
            'content' => $data ? json_encode($data) : null,
            'ignore_errors' => true
        ]
    ];
    $context = stream_context_create($opts);
    $response = file_get_contents($url, false, $context);
    if ($response === false) {
        echo "Request failed: $url\n";
        return null;
    }
    $decoded = json_decode($response, true);
    if ($decoded === null) {
        echo "Raw Response: " . $response . "\n";
    }
    return $decoded;
}

$baseUrl = 'http://localhost:8080/api';

echo "1. Registering User...\n";
$regData = [
    'name' => 'Test User',
    'email' => 'test' . time() . '@example.com',
    'phone' => '1234567890',
    'password' => 'password123',
    'cpassword' => 'password123'
];
$regRes = request('POST', "$baseUrl/register", $regData);
print_r($regRes);

echo "\n2. Logging In...\n";
$loginData = [
    'email' => $regData['email'],
    'password' => 'password123'
];
$loginRes = request('POST', "$baseUrl/login", $loginData);
print_r($loginRes);

if (isset($loginRes['token'])) {
    $token = $loginRes['token'];
    echo "\n3. Creating Ad...\n";
    $adData = [
        'name' => 'Test Ad',
        'type' => 'banner',
        'display_time' => 10
    ];
    $adRes = request('POST', "$baseUrl/ads", $adData, $token);
    print_r($adRes);

    echo "\n4. Listing Ads...\n";
    $adsRes = request('GET', "$baseUrl/ads", null, $token);
    print_r($adsRes);
} else {
    echo "\nLogin failed, skipping authorized tests.\n";
}
