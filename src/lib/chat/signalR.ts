// src/lib/chat/signalR.ts
import * as signalR from '@microsoft/signalr';

let currentToken = '';

export function setToken(token: string) {
    currentToken = token;
}

async function fetchNewToken(): Promise<string> {
    try {
        const res = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include'
        });
        if (!res.ok) {
            // Refresh thất bại → redirect login
            window.location.href = '/login';
            return '';
        }
        const data = await res.json();
        currentToken = data.accessToken;
        return currentToken;
    } catch {
        window.location.href = '/login';
        return '';
    }
}

export function createConnection() {
    return new signalR.HubConnectionBuilder()
        .withUrl('/hubs/chat', {
            accessTokenFactory: async () => {
                // SignalR tự gọi hàm này mỗi khi cần token
                // kể cả khi reconnect sau 401
                return currentToken;
            },
            transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: (retryContext) => {
                // Nếu lỗi 401 → refresh token trước khi reconnect
                if (retryContext.retryReason?.message?.includes('401') ||
                    retryContext.retryReason?.message?.includes('Unauthorized')) {
                    fetchNewToken(); // không cần await, SignalR sẽ gọi lại accessTokenFactory
                }
                return Math.min(1000 * retryContext.previousRetryCount, 5000);
            }
        })
        .configureLogging(signalR.LogLevel.Warning)
        .build();
}