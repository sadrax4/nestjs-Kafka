import { Observable } from 'rxjs';
import { RpcExceptionsHandler } from '../exceptions/rpc-exceptions-handler';
export declare class RpcProxy {
    create(targetCallback: (...args: unknown[]) => Promise<Observable<any>>, exceptionsHandler: RpcExceptionsHandler): (...args: unknown[]) => Promise<Observable<unknown>>;
    handleError<T>(exceptionsHandler: RpcExceptionsHandler, args: unknown[], error: T): Observable<unknown>;
}
