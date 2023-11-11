import { BaseRpcContext } from './base-rpc.context';
type RmqContextArgs = [Record<string, any>, any, string];
export declare class RmqContext extends BaseRpcContext<RmqContextArgs> {
    constructor(args: RmqContextArgs);
    /**
     * Returns the original message (with properties, fields, and content).
     */
    getMessage(): Record<string, any>;
    /**
     * Returns the reference to the original RMQ channel.
     */
    getChannelRef(): any;
    /**
     * Returns the name of the pattern.
     */
    getPattern(): string;
}
export {};
