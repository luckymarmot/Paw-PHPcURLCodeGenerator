require('./polyfills.js')
import Mustache from 'mustache'

import template_request from '../templates/request.php'

const addslashes = str => str.replace(/[\\"]/g, '\\$&')

const escapeSimpleQuotes = str => str.replace(/[\\']/g, '\\$&')
const escapeDoubleQuotes = str => str.replace(/[\\"]/g, '\\$&')

const genStr = str => {
    // if contains $, use simple quotes to prevent variable interpolation
    // if does not contain ' or contains ", use simple quotes too
    if (str.indexOf('\'') < 0 || str.indexOf('"') >= 0 || str.indexOf('$') >= 0) {
        return `'${escapeSimpleQuotes(str)}'`
    }
    // otherwise, use double quotes
    return `"${escapeDoubleQuotes(str)}"`
}

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

const getJsonBodyString = jsonBody => {
    return Mustache.render(require('../templates/body_json.php'), {
        json_body_object: getJsonBodyObject(jsonBody)
    })
}

const getJsonBodyObject = (object, indent = 0) => {
    // null
    if (object === null) {
        return null
    }
    // string
    else if ('string' === typeof object) {
        return genStr(object)
    }
    // number
    else if ('number' === typeof object) {
        return object
    }
    // boolean
    else if ('boolean' === typeof object) {
        return object ? 'true' : 'false'
    }
    // array
    else if ('object' === typeof object && object.length != null) {
        const indent_str = Array(indent + 1).join('  ')
        const indent_str_children = Array(indent + 2).join('  ')
        const lines = object.map(value => `${ indent_str_children }${ getJsonBodyObject(value, indent+1) }`)
        return `[\n${ lines.join(',\n') }\n${ indent_str }]`
    }
    // object
    else if ('object' === typeof object) {
        const indent_str = Array(indent + 1).join('  ')
        const indent_str_children = Array(indent + 2).join('  ')
        const lines = Object.keys(object).map(key => `${ indent_str_children }${ getJsonBodyObject(key) } => ${ getJsonBodyObject(object[key], indent+1) }`)
        return `[\n${ lines.join(',\n') }\n${ indent_str }]`
    }
    return null
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
