import { BaseRpcContext } from '../ctx-host/base-rpc.context';
import { RequestContext } from '../interfaces';
/**
 * @publicApi
 */
export declare class RequestContextHost<TData = any, TContext extends BaseRpcContext = any> implements RequestContext<TData> {
    readonly pattern: string | Record<string, any>;
    readonly data: TData;
    readonly context: TContext;
    constructor(pattern: string | Record<string, any>, data: TData, context: TContext);
    static create<TData, TContext extends BaseRpcContext>(pattern: string | Record<string, any>, data: TData, context: TContext): RequestContext<TData, TContext>;
    getData(): TData;
    getPattern(): string | Record<string, any>;
    getContext(): TContext;
}
