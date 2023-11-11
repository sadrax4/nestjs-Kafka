import { Deserializer, IncomingResponse } from '../interfaces';
/**
 * @publicApi
 */
export declare class KafkaResponseDeserializer implements Deserializer<any, IncomingResponse> {
    deserialize(message: any, options?: Record<string, any>): IncomingResponse;
}
