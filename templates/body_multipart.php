// multipart body
$body = [
{{#params}}
  {{{name}}} => {{{value}}},
{{/params}}
];

// set body
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
