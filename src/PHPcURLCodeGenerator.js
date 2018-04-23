import Mustache from 'mustache'

import template from './php.mustache'

const addslashes = str => (`${str}`).replace(/[\\"]/g, '\\$&')

@registerCodeGenerator
class PHPcURLCodeGenerator {
    static identifier = "com.luckymarmot.PawExtensions.PHPcURLCodeGenerator";
    static title = "PHP (cURL)";
    static fileExtension = "php";
    static languageHighlighter = "php";

    getUrl(request) {
        return {
            "fullpath" : request.url
        }
    }

    getHeaders(request) {
        const { headers } = request;
        return {
            "has_headers": Object.keys(headers).length > 0,
            "header_list": ((() => {
                const result = [];
                for (let header_name in headers) {
                    const header_value = headers[header_name];
                    result.push({
                        "header_name": addslashes(header_name),
                        "header_value": addslashes(header_value)
                    });
                }
                return result;
            })())
        };
    }

    getBody(request) {
        let name, value;
        const json_body = request.jsonBody;
        if (json_body) {
            return {
                "has_body":true,
                "has_json_body":true,
                "json_body_object":this.getJsonBodyObject(json_body, 2)
            };
        }

        const url_encoded_body = request.urlEncodedBody;
        if (url_encoded_body) {
            return {
                "has_body":true,
                "has_url_encoded_body":true,
                "url_encoded_body": ((() => {
                    const result = [];
                    for (name in url_encoded_body) {
                        value = url_encoded_body[name];
                        result.push({
                            "name": addslashes(name),
                            "value": addslashes(value)
                        });
                    }
                    return result;
                })())
            };
        }

        const multipart_body = request.multipartBody;
        if (multipart_body) {
            return {
                "has_body":true,
                "has_multipart_body":true,
                "multipart_body": ((() => {
                    const result1 = [];
                    for (name in multipart_body) {
                        value = multipart_body[name];
                        result1.push({
                            "name": addslashes(name),
                            "value": addslashes(value)
                        });
                    }
                    return result1;
                })())
            };
        }

        const raw_body = request.body;
        if (raw_body) {
            if (raw_body.length < 5000) {
                return {
                    "has_body":true,
                    "has_raw_body":true,
                    "raw_body": addslashes(raw_body)
                };
            } else {
                return {
                    "has_body":true,
                    "has_long_body":true
                };
            }
        }
    }

    getJsonBodyObject(object, indent = 0) {
        let s;
        let value;
        if (object === null) {
            s = "null";
        } else if (typeof(object) === 'string') {
            s = `\"${addslashes(object)}\"`;
        } else if (typeof(object) === 'number') {
            s = `${object}`;
        } else if (typeof(object) === 'boolean') {
            s = `${object ? "true" : "false"}`;
        } else if (typeof(object) === 'object') {
            const indent_str = Array(indent + 1).join('    ');
            const indent_str_children = Array(indent + 2).join('    ');
            if (object.length != null) {
                s = "[\n" +
                    ((() => {
                        const result = [];
                        for (value of Array.from(object)) {                             result.push(`${indent_str_children}${this.getJsonBodyObject(value, indent+1)}`);
                        }
                        return result;
                    })()).join(',\n') +
                    `\n${indent_str}]`;
            } else {
                s = "[\n" +
                    ((() => {
                        const result1 = [];
                        for (let key in object) {
                            value = object[key];
                            result1.push(`${indent_str_children}\"${addslashes(key)}\" => ${this.getJsonBodyObject(value, indent+1)}`);
                        }
                        return result1;
                    })()).join(',\n') +
                    `\n${indent_str}]`;
            }
        }

        return s;
    }

    generate(context, requests, options) {
        const request = context.getCurrentRequest();

        const view = {
            "request": context.getCurrentRequest(),
            "method": request.method.toUpperCase(),
            "url": this.getUrl(request),
            "headers": this.getHeaders(request),
            "body": this.getBody(request)
        };

        return Mustache.render(template, view);
    }
}
