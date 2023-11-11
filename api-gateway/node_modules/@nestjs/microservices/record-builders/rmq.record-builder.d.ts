export interface RmqRecordOptions {
    expiration?: string | number;
    userId?: string;
    CC?: string | string[];
    mandatory?: boolean;
    persistent?: boolean;
    deliveryMode?: boolean | number;
    BCC?: string | string[];
    contentType?: string;
    contentEncoding?: string;
    headers?: Record<string, string>;
    priority?: number;
    messageId?: string;
    timestamp?: number;
    type?: string;
    appId?: string;
}
export declare class RmqRecord<TData = any> {
    readonly data: TData;
    options?: RmqRecordOptions;
    constructor(data: TData, options?: RmqRecordOptions);
}
export declare class RmqRecordBuilder<TData> {
    private data?;
    private options?;
    constructor(data?: TData);
    setOptions(options: RmqRecordOptions): this;
    setData(data: TData): this;
    build(): RmqRecord;
}
