import WebSocket from 'ws';
import log from '../log';
import { processSocketMessage } from './handlers';
import { WsIncomingPayload, WsOutgoingPayload } from './payloads';

export default class SocketDataContainer {

    private responderId: string;

    constructor(private ws: WebSocket) {
    }

    async processMessage(data: WebSocket.Data) {
        const json = JSON.parse(data.toString());
        processSocketMessage(this, json as WsIncomingPayload);
    }

    send(response: WsOutgoingPayload) {
        try {
            if (this.ws.readyState === WebSocket.OPEN) {
                const outgoingJson = JSON.stringify({
                    id: response!.id,
                    type: response.type,
                    data: response.data,
                });
                log.debug('sending JSON to client: ' + outgoingJson);
                this.ws.send(outgoingJson);
            } else {
                log.warn('Attempted to send message on closed socket for responder: %j', this.responderId);
            }
        } catch (error) {
            log.error('Failed to send ws message. Error: %j', error);
        }
    }

    close() {
        if (this.ws.readyState in [WebSocket.OPEN, WebSocket.CONNECTING]) {
            // Close with a "normal" 1000 close code
            this.ws.close(1000);
        }
    }

    setResponderId(id: string) {
        this.responderId = id;
    }

    getResponderId(): string {
        return this.responderId
    }

}