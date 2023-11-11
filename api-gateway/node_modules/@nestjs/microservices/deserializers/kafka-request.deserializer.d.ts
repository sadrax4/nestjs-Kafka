import { IncomingEvent, IncomingRequest } from '../interfaces';
import { KafkaRequest } from '../serializers/kafka-request.serializer';
import { IncomingRequestDeserializer } from './incoming-request.deserializer';
/**
 * @publicApi
 */
export declare class KafkaRequestDeserializer extends IncomingRequestDeserializer {
    mapToSchema(data: KafkaRequest, options?: Record<string, any>): IncomingRequest | IncomingEvent;
}
