<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

$dir = __DIR__;
$entries = @scandir($dir);
if ($entries === false) {
    echo json_encode(['files' => []], JSON_UNESCAPED_UNICODE);
    exit;
}

$files = [];
foreach ($entries as $entry) {
    if ($entry === '.' || $entry === '..') {
        continue;
    }
    $path = $dir . DIRECTORY_SEPARATOR . $entry;
    if (!is_file($path)) {
        continue;
    }
    if (strtolower(pathinfo($entry, PATHINFO_EXTENSION)) !== 'json') {
        continue;
    }
    $files[] = $entry;
}

natcasesort($files);
$files = array_values($files);

echo json_encode(['files' => $files], JSON_UNESCAPED_UNICODE);
