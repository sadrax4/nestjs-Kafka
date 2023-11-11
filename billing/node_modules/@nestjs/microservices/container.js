"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsContainer = void 0;
class ClientsContainer {
    constructor() {
        this.clients = [];
    }
    getAllClients() {
        return this.clients;
    }
    addClient(client) {
        this.clients.push(client);
    }
    clear() {
        this.clients = [];
    }
}
exports.ClientsContainer = ClientsContainer;
