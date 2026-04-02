//lib/chat/signalR.ts
import * as signalR from '@microsoft/signalr';

let connection: signalR.HubConnection | null = null;

export function createConnection(token: string) {
    connection = new signalR.HubConnectionBuilder()
        .withUrl('/hubs/chat', {
            accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

    return connection;
}

export function getConnection() {
    return connection;
}