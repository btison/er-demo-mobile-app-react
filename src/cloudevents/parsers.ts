import { ValidationError, CONSTANTS } from 'cloudevents';
import { isDefinedOrThrow, isBufferOrStringOrObjectOrThrow, isBuffer, isString } from './event/validation'

abstract class Parser {
    abstract parse(payload: Buffer | string): unknown;
}

export class JSONParser implements Parser {

    parse(payload: string | Buffer): unknown {
        isDefinedOrThrow(payload, new ValidationError("null or undefined payload"));
        isBufferOrStringOrObjectOrThrow(payload, new ValidationError("invalid payload type, allowed are: uffer, string or object"));
        const parseJSON = (v: Buffer | string) => (isBuffer(v) ? JSON.parse(v.toString()) : isString(v) ? JSON.parse(v as string) : v);
        return parseJSON(payload);
    }

}

export class PassThroughParser extends Parser {
    parse(payload: unknown): unknown {
        return payload;
    }
}

export interface MappedParser {
    name: string;
    parser: Parser;
}

export class DateParser extends Parser {
    parse(payload: string): string {
        let date = new Date(Date.parse(payload));
        if (date.toString() === "Invalid Date") {
            date = new Date();
        }
        return date.toISOString();
    }
}

const jsonParser = new JSONParser();
export const parserByContentType: { [key: string]: Parser } = {
    [CONSTANTS.MIME_JSON]: jsonParser,
    [CONSTANTS.MIME_CE_JSON]: jsonParser,
    [CONSTANTS.DEFAULT_CONTENT_TYPE]: jsonParser,
    [CONSTANTS.DEFAULT_CE_CONTENT_TYPE]: jsonParser,
    [CONSTANTS.MIME_OCTET_STREAM]: new PassThroughParser(),
};