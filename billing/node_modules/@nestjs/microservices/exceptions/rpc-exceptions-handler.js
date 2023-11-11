"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpcExceptionsHandler = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const select_exception_filter_metadata_util_1 = require("@nestjs/common/utils/select-exception-filter-metadata.util");
const invalid_exception_filter_exception_1 = require("@nestjs/core/errors/exceptions/invalid-exception-filter.exception");
const base_rpc_exception_filter_1 = require("./base-rpc-exception-filter");
/**
 * @publicApi
 */
class RpcExceptionsHandler extends base_rpc_exception_filter_1.BaseRpcExceptionFilter {
    constructor() {
        super(...arguments);
        this.filters = [];
    }
    handle(exception, host) {
        const filterResult$ = this.invokeCustomFilters(exception, host);
        if (filterResult$) {
            return filterResult$;
        }
        return super.catch(exception, host);
    }
    setCustomFilters(filters) {
        if (!Array.isArray(filters)) {
            throw new invalid_exception_filter_exception_1.InvalidExceptionFilterException();
        }
        this.filters = filters;
    }
    invokeCustomFilters(exception, host) {
        if ((0, shared_utils_1.isEmpty)(this.filters)) {
            return null;
        }
        const filter = (0, select_exception_filter_metadata_util_1.selectExceptionFilterMetadata)(this.filters, exception);
        return filter ? filter.func(exception, host) : null;
    }
}
exports.RpcExceptionsHandler = RpcExceptionsHandler;
