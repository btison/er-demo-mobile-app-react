import { Responder } from "../models/responder";
import { v4 as uuid } from 'uuid';
import { MissionStep, Route } from "../models/mission";

export interface ISocketService {
    connect: IConnect;
    available: IAvailable;
    updateLocation: IUpdateLocation;
}

export interface IConnect {
    (hostname: string, dispatcher: Dispatcher, responder: Responder): void
}

export interface IAvailable {
    (responder: Responder): void
}

export interface IUpdateLocation {
    (id: string, route: Route): void
}

export const SocketService: ISocketService = {
    connect: connect as IConnect,
    available: sendAvailable as IAvailable,
    updateLocation: updateLocation as IUpdateLocation
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
            case 'mission-assigned':
            case 'responder-updated':    
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

function sendAvailable(responder: Responder) {
    if (!socket) {
        return;
    }

    const message = {
        id: uuid(),
        type: 'responder-available',
        data: { responder: responder }
    };

    socket.send(JSON.stringify(message));
}

function updateLocation(id: string, route: Route) {
    if (!socket) {
        return;
    }

    const message = {
        id: uuid(),
        type: 'location-update',
        data: {
            currentLocation: { lat: route.currentLocation.lat, lon: route.currentLocation.lon },
            waiting: route.waiting, status: route.status,
            route: Array.from<MissionStep>(route.route.values()).map((m: MissionStep) => ({ destination: m.destination, waypoint: m.wayPoint, lat: m.lat, lon: m.lon }))
        }
    };

    socket.send(JSON.stringify(message));
}