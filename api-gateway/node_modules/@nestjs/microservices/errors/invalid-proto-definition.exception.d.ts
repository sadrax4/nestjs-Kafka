import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
/**
 * @publicApi
 */
export declare class InvalidProtoDefinitionException extends RuntimeException {
    constructor(path: string);
}
