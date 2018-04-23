require('./polyfills.js')
import Mustache from 'mustache'


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

const removeExtraLines = str => str.replace(/\n{2,}/g, '\n\n')

// 
// Headers
// 

const getHeadersString = request => {
    const headers = request.headers
    if (0 === Object.keys(headers).length) {
        return null
    }
    const header_strings = Object.keys(headers).map(name => ({
        line: genStr(`${name}: ${headers[name]}`),
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
        name: genStr(name),
        value: genStr(urlEncodedParams[name]),
    }))
    return Mustache.render(require('../templates/body_url_encode.php'), {
        params: params_strings
    })
}

const getMultipartBodyString = multipartParams => {
    const params_strings = Object.keys(multipartParams).map(name => ({
        name: genStr(name),
        value: genStr(multipartParams[name]),
    }))
    return Mustache.render(require('../templates/body_multipart.php'), {
        params: params_strings
    })
}

const getRawBodyString = rawBody => {
    return Mustache.render(require('../templates/body_raw.php'), {
        body: genStr(rawBody)
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
// Timeout
// 

const getTimeout = request => {
    const timeout = request.timeout
    if (request.timeout === 0) {
        return null
    }
    return Mustache.render(require('../templates/timeout.php'), {
        timeout: (request.timeout / 1000)
    })
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

    generate(context) {
        const request = context.getCurrentRequest()
        const str = Mustache.render(require('../templates/request.php'), {
            url: genStr(request.url),
            method: genStr(request.method.toUpperCase()),
            timeout: getTimeout(request),
            headers: getHeadersString(request),
            body: getBodyString(request),
        })
        return removeExtraLines(str)
    }
}
