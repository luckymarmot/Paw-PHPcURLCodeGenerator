// Create body
$body = [
{{#params}}
  "{{{name}}}" => "{{{value}}}",
{{/params}}
  ];

// Set body
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);