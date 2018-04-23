// form body
$body = [
{{#params}}
  {{{name}}} => {{{value}}},
{{/params}}
];
$body = http_build_query($body);

// set body
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);