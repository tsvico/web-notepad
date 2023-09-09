<?php
set_time_limit(0);
header('X-Accel-Buffering: no');
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
ob_end_clean();
ob_implicit_flush(1);

if (!isset($_GET['note'])) {
    header('HTTP/1.0 404 Not Found');
    die;
}

$save_path = '_tmp';
$path = $save_path . '/' . $_GET['note'];

while (1) {

    if (file_exists($path)) {
        $data = base64_encode(gzencode(file_get_contents($path)));
    } else {
        $data = "";
    }


    if ($data) {
        returnEventData($data, "content", 1, 3000);
    } else {
        echo 1;
    }
    sleep(5);
}

function returnEventData($returnData, $event = 'message', $id = 0, $retry = 0)
{

    $str = '';
    if ($id > 0) {
        $str .= "id: {$id}" . PHP_EOL;
    }
    if ($event) {
        $str .= "event: {$event}" . PHP_EOL;
    }
    if ($retry > 0) {
        $str .= "retry: {$retry}" . PHP_EOL;
    }
    if (is_array($returnData)) {
        $returnData = json_encode($returnData);
    }
    $str .= "data: $returnData" . PHP_EOL;
    $str .= PHP_EOL;
    echo $str;
}
