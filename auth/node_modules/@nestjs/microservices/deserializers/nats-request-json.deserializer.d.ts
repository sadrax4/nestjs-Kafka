import { IncomingEvent, IncomingRequest } from '../interfaces';
import { IncomingRequestDeserializer } from './incoming-request.deserializer';
/**
 * @publicApi
 */
export declare class NatsRequestJSONDeserializer extends IncomingRequestDeserializer {
    private readonly jsonCodec;
    constructor();
    deserialize(value: Uint8Array, options?: Record<string, any>): IncomingRequest | IncomingEvent;
}
