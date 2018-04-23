// Set headers
curl_setopt($ch, CURLOPT_HTTPHEADER, [
{{#headers}}
  "{{{name}}}: {{{value}}}",
{{/headers}} ]
);