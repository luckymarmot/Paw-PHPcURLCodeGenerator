// Create body
$body = [
{{#params}}
  {{{name}}} => {{{value}}},
{{/params}}
];
$body = http_build_query($body);

// Set body
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);