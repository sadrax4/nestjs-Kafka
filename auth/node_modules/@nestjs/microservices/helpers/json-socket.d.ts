/// <reference types="node" />
import { Buffer } from 'buffer';
import { TcpSocket } from './tcp-socket';
export declare class JsonSocket extends TcpSocket {
    private contentLength;
    private buffer;
    private readonly stringDecoder;
    private readonly delimiter;
    protected handleSend(message: any, callback?: (err?: any) => void): void;
    protected handleData(dataRaw: Buffer | string): void;
    private handleMessage;
    private formatMessageData;
}
