import { CloudEvent, CloudEventV03, CloudEventV1, CONSTANTS, Mode, ValidationError, Version } from 'cloudevents';
import { Message, Headers } from '..';
import log from '../../../log';
import { isBufferOrStringOrObjectOrThrow } from '../../event/validation';
import { JSONParser, MappedParser, parserByContentType } from '../../parsers';
import { sanitize, v1binaryParsers, v03structuredParsers, v1structuredParsers } from './headers';

export function deserialize(message: Message): CloudEvent {
    const cleanHeaders: Headers = sanitize(message.headers!);
    const mode = getMode(cleanHeaders);
    let version = getVersion(mode, cleanHeaders, message.body as Buffer);
    if (version !== Version.V03 && version !== Version.V1) {
        log.error(`Unknown spec version ${version}. Default to ${Version.V1}`);
        version = Version.V1;
    }
    switch (mode) {
        case Mode.BINARY:
            return parseBinary(message, version);
        case Mode.STRUCTURED:
            return parseStructured(message, version);
        default:
            throw new ValidationError("Unknown Message mode");
    }
}

/**
 * Determines the transport mode (binary or structured) based
 * on the incoming headers.
 */
function getMode(headers: Headers) {
    const contentType = headers[CONSTANTS.HEADER_CONTENT_TYPE] as string;
    if (contentType && contentType.startsWith(CONSTANTS.MIME_CE)) {
        return Mode.STRUCTURED;
    }
    if (headers[CONSTANTS.CE_HEADERS.ID]) {
        return Mode.BINARY;
    }
    throw new ValidationError("no cloud event detected");
}

function getVersion(mode: Mode, headers: Headers, body: Buffer | null) {
    if (mode === Mode.BINARY) {
        // Check the headers for the version
        const versionHeader = headers[CONSTANTS.CE_HEADERS.SPEC_VERSION];
        if (versionHeader) {
            return versionHeader;
        }
    } else {
        // structured mode - the version is in the body
        let bodyValue = null;
        if (!body) {
            bodyValue = "";
        } else {
            bodyValue = body.toString();
        }
        return JSON.parse(bodyValue).specversion;
    }
    return Version.V1;
}

function parseBinary(message: Message, version: Version) {
    let body = message.body;
    const headers = sanitize(message.headers);
    if (!headers)
        throw new ValidationError("headers is null or undefined");
    if (body) {
        isBufferOrStringOrObjectOrThrow(body, new ValidationError("payload must be a buffer, an object or a string"));
    }
    if (headers[CONSTANTS.CE_HEADERS.SPEC_VERSION] &&
        headers[CONSTANTS.CE_HEADERS.SPEC_VERSION] !== Version.V03 &&
        headers[CONSTANTS.CE_HEADERS.SPEC_VERSION] !== Version.V1) {
        throw new ValidationError(`invalid spec version ${headers[CONSTANTS.CE_HEADERS.SPEC_VERSION]}`);
    }
    const eventObj: { [key: string]: unknown | string | Record<string, unknown> } = {};
    const parserMap = version === Version.V1 ? v1binaryParsers : v1binaryParsers;
    for (const header in parserMap) {
        if (headers[header]) {
            const mappedParser = parserMap[header];
            eventObj[mappedParser.name] = mappedParser.parser.parse(headers[header]!);
            delete headers[header];
        }
    }
    // Every unprocessed header can be an extension
    for (const header in headers) {
        if (header.startsWith(CONSTANTS.EXTENSIONS_PREFIX.replace(/_/g, "-"))) {
            eventObj[header.substring(CONSTANTS.EXTENSIONS_PREFIX.length)] = headers[header];
        }
    }
    const parser = parserByContentType[eventObj.datacontenttype as string];
    if (parser && body) {
        body = parser.parse(body as Buffer);
    }
    // At this point, if the datacontenttype is application/json and the datacontentencoding is base64
    // then the data has already been decoded as a string, then parsed as JSON. We don't need to have
    // the datacontentencoding property set - in fact, it's incorrect to do so.
    if (eventObj.datacontenttype === CONSTANTS.MIME_JSON && eventObj.datacontentencoding === CONSTANTS.ENCODING_BASE64) {
        delete eventObj.datacontentencoding;
    }
    return new CloudEvent({ ...eventObj, data: body } as CloudEventV1 | CloudEventV03, false);
}

function parseStructured(message: Message, version: Version) {
    const payload = message.body;
    const headers = message.headers;
    if (!payload)
        throw new ValidationError("payload is null or undefined");
    if (!headers)
        throw new ValidationError("headers is null or undefined");
    isBufferOrStringOrObjectOrThrow(payload, new ValidationError("payload must be a buffer, an object or a string"));
    if (headers[CONSTANTS.CE_HEADERS.SPEC_VERSION] &&
        headers[CONSTANTS.CE_HEADERS.SPEC_VERSION] != Version.V03 &&
        headers[CONSTANTS.CE_HEADERS.SPEC_VERSION] != Version.V1) {
        throw new ValidationError(`invalid spec version ${headers[CONSTANTS.CE_HEADERS.SPEC_VERSION]}`);
    }
    // Clone and low case all headers names
    const sanitizedHeaders = sanitize(headers);
    const contentType = sanitizedHeaders[CONSTANTS.HEADER_CONTENT_TYPE];
    const parser = contentType ? parserByContentType[contentType as string] : new JSONParser();
    if (!parser)
        throw new ValidationError(`invalid content type ${sanitizedHeaders[CONSTANTS.HEADER_CONTENT_TYPE]}`);
    const incoming = { ...(parser.parse(payload as Buffer) as Record<string, unknown>) };
    const eventObj: { [key: string]: unknown } = {};
    const parserMap: Record<string, MappedParser> = version === Version.V1 ? v1structuredParsers : v03structuredParsers;
    for (const key in parserMap) {
        const property = incoming[key];
        if (property) {
            const parser: MappedParser = parserMap[key];
            eventObj[parser.name] = parser.parser.parse(property as string);
        }
        delete incoming[key];
    }
    // extensions are what we have left after processing all other properties
    for (const key in incoming) {
        eventObj[key] = incoming[key];
    }
    // data_base64 is a property that only exists on V1 events. For V03 events,
    // there will be a .datacontentencoding property, and the .data property
    // itself will be encoded as base64
    if (eventObj.data_base64 || eventObj.datacontentencoding === CONSTANTS.ENCODING_BASE64) {
        const data = eventObj.data_base64 || eventObj.data;
        eventObj.data = new Uint32Array(Buffer.from(data as string, "base64"));
        delete eventObj.data_base64;
        delete eventObj.datacontentencoding;
    }
    return new CloudEvent(eventObj as CloudEventV1 | CloudEventV03, false);
}