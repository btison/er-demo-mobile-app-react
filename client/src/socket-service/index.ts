import { Responder } from "../models/responder";
import { v4 as uuid } from 'uuid';

export interface ISocketService {
    connect: IConnect;
}

export interface IConnect {
    (hostname: string, dispatcher: Dispatcher, responder: Responder): void
}

export const SocketService: ISocketService = {
    connect: connect as IConnect
}

export interface Dispatcher {
    dispatch: Dispatch
}

export interface Dispatch {
    (type: string, data: any): void
}

let socket: WebSocket;

function connect(hostname: string, dispatcher: Dispatcher, responder: Responder) {
    const url = 'wss://' + hostname + '/ws';
    socket = new WebSocket(url);

    socket.onopen = (event: Event) => {
        sendConnectionFrame(responder);
    }

    socket.onclose = (event: Event) => {
    }

    socket.onerror = (event: Event) => {
    }

    socket.onmessage = event => {
        const message = JSON.parse(event.data);
        const data = message.data;

        switch (message.type) {
            case 'connection-status':
                dispatcher.dispatch(message.type, data);
                break;
            case 'mission-assigned':
                dispatcher.dispatch(message.type, data);
                break;
        }
    }
}

function sendConnectionFrame(responder: Responder) {
    if (!socket) {
        return;
    }

    const message = {
        id: uuid(),
        type: 'connection',
        data: { responderId: responder.id }
    };

    socket.send(JSON.stringify(message));
}