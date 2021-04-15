import fastify, { FastifyInstance } from 'fastify';
import fastifyStatic from 'fastify-static'
import fastifyHttpProxy from 'fastify-http-proxy';
import path from 'path';
import { Kafka, logLevel } from 'kafkajs';
import { KafkaMessage } from './cloudevents';
import { ResponderService } from './services/responder-service';
import { MissionService } from './services/mission-service';
import { Mission, Route } from './services/mission-service/mission-service';
import { DISASTER_SERVICE, DISASTER_SIMULATOR, HTTP_PORT, KAFKA_GROUP_ID, KAFKA_HOST, KAFKA_TOPICS, NODE_ENV, RESPONDER_SERVICE } from './config';
import log from './log';

interface IParams {
    name?: string,
    id?: string
}

const app: FastifyInstance = fastify({ logger: NODE_ENV === 'dev', disableRequestLogging: true });

app.register(fastifyStatic, {
    root: path.join(__dirname, 'client/build')
});

//Provides a health endpoint to check
app.register(require('./plugins/health'), {
    options: {}
});

const responderServiceUrl = RESPONDER_SERVICE;
app.register(fastifyHttpProxy, {
    upstream: responderServiceUrl!,
    prefix: '/responder-service'
});

const disasterSimulatorServiceUrl = DISASTER_SIMULATOR;
app.register(fastifyHttpProxy, {
    upstream: disasterSimulatorServiceUrl!,
    prefix: '/disaster-simulator-service'
});

const disasterServiceUrl = DISASTER_SERVICE;
app.register(fastifyHttpProxy, {
    upstream: disasterServiceUrl!,
    prefix: '/disaster-service'
});

app.get<{ Params: IParams }>('/mission-service/mission/:id', (request, reply) => {
    let mission: Mission | null = MissionService.get(request.params.id!);
    if (mission === null) {
        reply.status(404).send('Mission not found');
    } else {
        reply.status(200).send(mission)
    }
});

app.post<{ Params: IParams }>('/mission-service/mission/:id', (req, res) => {
    const responderLocation: Route = req.body as Route;
    MissionService.update(req.params.id!, responderLocation);
    res.status(204).send();
});

app.get('/mission', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

// setup kafka connection
const kafka = new Kafka({
    logLevel: logLevel.INFO,
    brokers: KAFKA_HOST,
    connectionTimeout: 3000
});
const consumer = kafka.consumer({ groupId: KAFKA_GROUP_ID });

const run = async () => {
    log.info(`Setting up Kafka client for ${KAFKA_HOST}`);
    await consumer.connect();

    KAFKA_TOPICS.forEach((t: string) => {
        const run2 = async () => {
            log.info(`Setting up Kafka client on topic ${t}`);
            await consumer.subscribe({ topic: t });
        }
        run2().catch(e => log.error(`[server.js] ${e.message}`, e));
    });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            try {
                const event = KafkaMessage.toEvent({ headers: message.headers!, body: message.value });
                if (event.type === 'MissionStartedEvent') {
                    let mission: Mission = event.data as Mission;
                    let responderId = mission.responderId as string;
                    ResponderService.isPerson(responderId).then((bool) => {
                        if (bool) {
                            log.debug(`Responder with id ${responderId} is a person`);
                            MissionService.put(mission);
                        }
                    });
                }
            } catch (err) {
                log.error(`Error when transforming incoming message to CloudEvent. ${err.message}`, err);
                log.error('    Topic: ', topic);
                log.error('    Message:', message);
            }
        },
    })
};

run().catch(e => log.error(`[server.js] ${e.message}`, e));

const start = async () => {
    log.info(`starting server on port ${HTTP_PORT}`);
    try {
        await app.listen(HTTP_PORT, '0.0.0.0');
    } catch (err) {
        log.error(err);
        process.exit(1);
    }
}
start();