require('./polyfills.js')
import Mustache from 'mustache'

import template_request from '../templates/request.php'

const addslashes = str => (`${str}`).replace(/[\\"]/g, '\\$&')

// 
// URL
// 

const getUrl = request => ({
    fullpath: request.url
})

// 
// Headers
// 

const getHeadersString = request => {
    const headers = request.headers
    if (0 === Object.keys(headers).length) {
        return null
    }
    const header_strings = Object.keys(headers).map(name => ({
        name: addslashes(name),
        value: addslashes(headers[name]),
    }))
    return Mustache.render(require('../templates/headers.php'), {
        headers: header_strings
    })
}

// 
// Body
// 

const getJsonBodyObject = (object, indent = 0) => {
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
                    for (value of Array.from(object)) {                             result.push(`${indent_str_children}${getJsonBodyObject(value, indent+1)}`);
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
                        result1.push(`${indent_str_children}\"${addslashes(key)}\" => ${getJsonBodyObject(value, indent+1)}`);
                    }
                    return result1;
                })()).join(',\n') +
                `\n${indent_str}]`;
        }
    }

    return s;
}

const getJsonBodyString = jsonBody => {
    return Mustache.render(require('../templates/body_json.php'), {
        json_body_object: getJsonBodyObject(jsonBody, 2)
    })
}

const getUrlEncodedBodyString = urlEncodedParams => {
    const params_strings = Object.keys(urlEncodedParams).map(name => ({
        name: addslashes(name),
        value: addslashes(urlEncodedParams[name]),
    }))
    return Mustache.render(require('../templates/body_url_encode.php'), {
        params: params_strings
    })
}

const getMultipartBodyString = multipartParams => {
    const params_strings = Object.keys(multipartParams).map(name => ({
        name: addslashes(name),
        value: addslashes(multipartParams[name]),
    }))
    return Mustache.render(require('../templates/body_multipart.php'), {
        params: params_strings
    })
}

const getRawBodyString = rawBody => {
    return Mustache.render(require('../templates/body_raw.php'), {
        raw_body: rawBody
    })
}

const getLongBodyString = () => {
    return Mustache.render(require('../templates/body_long.php'))
}

const getBodyString = request => {
    const jsonBody = request.jsonBody
    if (jsonBody) {
        return getJsonBodyString(jsonBody)
    }

    const urlEncodedBody = request.urlEncodedBody;
    if (urlEncodedBody) {
        return getUrlEncodedBodyString(urlEncodedBody)
    }

    const multipartBody = request.multipartBody;
    if (multipartBody) {
        return getMultipartBodyString(multipartBody)
    }

    const rawBody = request.body;
    if (rawBody) {
        if (rawBody.length < 5000) {
            return getRawBodyString(rawBody)
        } else {
            return getLongBodyString()
        }
    }

    return null
}

// 
// Code generator
// 

@registerCodeGenerator
class PHPcURLCodeGenerator {
    static identifier = 'com.luckymarmot.PawExtensions.PHPcURLCodeGenerator';
    static title = 'PHP (cURL)';
    static fileExtension = 'php';
    static languageHighlighter = 'php';

    generate(context, requests, options) {
        const request = context.getCurrentRequest()
        return Mustache.render(template_request, {
            request: context.getCurrentRequest(),
            method: request.method.toUpperCase(),
            url: getUrl(request),
            headers: getHeadersString(request),
            body: getBodyString(request),
        })
    }
}
