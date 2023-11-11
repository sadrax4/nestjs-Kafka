/**
 * @publicApi
 */
export declare class RpcException extends Error {
    private readonly error;
    constructor(error: string | object);
    initMessage(): void;
    getError(): string | object;
}
