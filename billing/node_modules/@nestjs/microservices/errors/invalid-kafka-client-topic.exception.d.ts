import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
/**
 * @publicApi
 */
export declare class InvalidKafkaClientTopicException extends RuntimeException {
    constructor(topic?: string);
}
