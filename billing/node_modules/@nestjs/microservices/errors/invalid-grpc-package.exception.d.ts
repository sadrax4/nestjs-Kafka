import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
/**
 * @publicApi
 */
export declare class InvalidGrpcPackageException extends RuntimeException {
    constructor(name: string);
}
