<?php

// Get cURL resource
$ch = curl_init();

// Set url
curl_setopt($ch, CURLOPT_URL, '{{{url.fullpath}}}');

// Set method
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '{{{request.method}}}');

// Set options
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

{{{headers}}}

{{{body}}}

// Send the request & save response to $resp
$resp = curl_exec($ch);

if(!$resp) {
  die('Error: "' . curl_error($ch) . '" - Code: ' . curl_errno($ch));
} else {
  echo "Response HTTP Status Code : " . curl_getinfo($ch, CURLINFO_HTTP_CODE);
  echo "\nResponse HTTP Body : " . $resp;
}

// Close request to clear up some resources
curl_close($ch);
