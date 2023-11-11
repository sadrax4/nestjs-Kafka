import { Observable } from 'rxjs';
import { ArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface';
import { RpcExceptionFilterMetadata } from '@nestjs/common/interfaces/exceptions';
import { RpcException } from './rpc-exception';
import { BaseRpcExceptionFilter } from './base-rpc-exception-filter';
/**
 * @publicApi
 */
export declare class RpcExceptionsHandler extends BaseRpcExceptionFilter {
    private filters;
    handle(exception: Error | RpcException | any, host: ArgumentsHost): Observable<any>;
    setCustomFilters(filters: RpcExceptionFilterMetadata[]): void;
    invokeCustomFilters<T = any>(exception: T, host: ArgumentsHost): Observable<any> | null;
}
