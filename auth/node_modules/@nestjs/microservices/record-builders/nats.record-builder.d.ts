export declare class NatsRecord<TData = any, THeaders = any> {
    readonly data: TData;
    readonly headers?: THeaders;
    constructor(data: TData, headers?: THeaders);
}
export declare class NatsRecordBuilder<TData> {
    private data?;
    private headers?;
    constructor(data?: TData);
    setHeaders<THeaders = any>(headers: THeaders): this;
    setData(data: TData): this;
    build(): NatsRecord;
}
