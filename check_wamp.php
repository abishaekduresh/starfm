<?php
$url = 'http://localhost/starfm.dureshtech.com/backend/public/api/ads';
$headers = @get_headers($url);

if ($headers && strpos($headers[0], '401') !== false) {
    echo "WAMP Backend is working (Got 401 Unauthorized as expected).\n";
    echo "URL: $url";
} elseif ($headers && strpos($headers[0], '200') !== false) {
    echo "WAMP Backend is working (Got 200 OK).\n";
} else {
    echo "WAMP Backend failed. Headers: " . print_r($headers, true) . "\n";
    // Check purely localhost just in case port is different or virtual host
}
