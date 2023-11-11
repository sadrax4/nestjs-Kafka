import { IncomingResponse } from '../interfaces';
import { IncomingResponseDeserializer } from './incoming-response.deserializer';
/**
 * @publicApi
 */
export declare class NatsResponseJSONDeserializer extends IncomingResponseDeserializer {
    private readonly jsonCodec;
    constructor();
    deserialize(value: Uint8Array, options?: Record<string, any>): IncomingResponse;
}
