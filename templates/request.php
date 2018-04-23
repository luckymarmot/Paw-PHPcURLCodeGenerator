<?php

// get cURL resource
$ch = curl_init();

// set url
curl_setopt($ch, CURLOPT_URL, '{{{url.fullpath}}}');

// set method
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '{{{request.method}}}');

// return the transfer as a string
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

{{{headers}}}

{{{body}}}

// send the request and save response to $response
$response = curl_exec($ch);

// stop if fails
if (!$response) {
  die('Error: "' . curl_error($ch) . '" - Code: ' . curl_errno($ch));
}

echo 'HTTP Status Code: ' . curl_getinfo($ch, CURLINFO_HTTP_CODE) . PHP_EOL;
echo 'Response Body: ' . $response . PHP_EOL;

// close curl resource to free up system resources 
curl_close($ch);
