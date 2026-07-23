import Pusher from 'pusher-js';
import Echo from 'laravel-echo'
import { env } from '@/utils/env';

declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}

window.Pusher = Pusher;

let echoInstance: Echo<any> | null = null;

export function createEcho(getToken: () => string | null): Echo<any> {
    return new Echo({
        broadcaster: 'reverb',
        key: env.WS_KEY,
        wsHost: env.WS_HOST,
        wsPort: env.WS_PORT,
        wssPort: env.WSS_PORT,
        forceTLS: env.WS_FORCE_TLS,
        enabledTransports: ['ws', 'wss'],

        authorizer: (channel: any) => {
            return {
                authorize: (socketId: string, callback: Function) => {
                fetch(env.WS_AUTH_ENDPOINT ?? 'http://localhost:8000/api/broadcasting/auth', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                    },
                    body: JSON.stringify({
                    socket_id: socketId,
                    channel_name: channel.name,
                    }),
                })
                    .then((res) => res.json())
                    .then((data) => callback(false, data))
                    .catch((error) => callback(true, error));
                },
            };
        },
    });
} 

export function getEcho(getToken: () => string | null): Echo<any> {
    if (!echoInstance) {
        echoInstance = createEcho(getToken);
    }
    
    return echoInstance;
}

export function disconnectEcho() {
    echoInstance?.disconnect();
    echoInstance = null;
}