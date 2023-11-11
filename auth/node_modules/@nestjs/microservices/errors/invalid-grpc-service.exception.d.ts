import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
/**
 * @publicApi
 */
export declare class InvalidGrpcServiceException extends RuntimeException {
    constructor(name: string);
}
