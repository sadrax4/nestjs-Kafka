export declare class BaseRpcContext<T = unknown[]> {
    protected readonly args: T;
    constructor(args: T);
    /**
     * Returns the array of arguments being passed to the handler.
     */
    getArgs(): T;
    /**
     * Returns a particular argument by index.
     * @param index index of argument to retrieve
     */
    getArgByIndex(index: number): any;
}
