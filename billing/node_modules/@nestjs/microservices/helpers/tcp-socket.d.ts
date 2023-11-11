/// <reference types="node" />
/// <reference types="node" />
import { Buffer } from 'buffer';
import { Socket } from 'net';
export declare abstract class TcpSocket {
    readonly socket: Socket;
    private isClosed;
    get netSocket(): Socket;
    constructor(socket: Socket);
    connect(port: number, host: string): this;
    on(event: string, callback: (err?: any) => void): this;
    once(event: string, callback: (err?: any) => void): this;
    end(): this;
    sendMessage(message: any, callback?: (err?: any) => void): void;
    protected abstract handleSend(message: any, callback?: (err?: any) => void): any;
    private onData;
    protected abstract handleData(data: Buffer | string): any;
    protected emitMessage(data: string): void;
}
