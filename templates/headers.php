// set headers
curl_setopt($ch, CURLOPT_HTTPHEADER, [
{{#headers}}
  {{{line}}},
{{/headers}}
]);