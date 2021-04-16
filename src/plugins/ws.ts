import { FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";
import { configureSocket } from "../sockets";

const wsPlugin: FastifyPluginCallback = (server, options, done) => {
    server.get('/ws', { websocket: true }, (conn) => {
        conn.on('error', (err) => {
            server.log.error(
                `error generated. Websocket client will be disconnected due to: ${err}`
            );
        });
        conn.on('close', () => {
            server.log.info(`Websocket client connection closed`);
        });

        configureSocket(conn.socket);
    });

    done();
};

export default fp(wsPlugin);