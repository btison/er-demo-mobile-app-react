import fastify, { FastifyInstance } from 'fastify';
import fastifyStatic from 'fastify-static'
import fastifyHttpProxy from 'fastify-http-proxy';
import path from 'path';
import { Kafka, logLevel } from 'kafkajs';
import { KafkaMessage } from './cloudevents';
import { ResponderService } from './services/responder-service';
import { MissionService } from './services/mission-service';
import { Mission, Route } from './services/mission-service/mission-service';

interface IParams {
    name?: string,
    id?: string
}

const app: FastifyInstance = fastify({logger: true, disableRequestLogging: true});

const port: number = Number(process.env.PORT) || 8080;

const kafkaHost = process.env.KAFKA_HOST?.split(',');
const groupId = process.env.KAFKA_GROUP_ID || 'emergency-response-app';
const kafkaTopic = process.env.KAFKA_TOPIC?.split(',');

app.register(fastifyStatic, {
    root: path.join(__dirname, 'client/build')
});

//Provides a health endpoint to check
app.register(require('./plugins/health'), {
    options: {}
});

const responderServiceUrl = process.env.RESPONDER_SERVICE;
app.register(fastifyHttpProxy, {
    upstream: responderServiceUrl!,
    prefix: '/responder-service'
});

const disasterSimulatorServiceUrl = process.env.DISASTER_SIMULATOR;
app.register(fastifyHttpProxy, {
    upstream: disasterSimulatorServiceUrl!,
    prefix: '/disaster-simulator-service'
});

const disasterServiceUrl = process.env.DISASTER_SERVICE;
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
    brokers: kafkaHost!,
    connectionTimeout: 3000
});
const consumer = kafka.consumer({ groupId: groupId });

const run = async () => {
    console.log('Setting up Kafka client for ', kafkaHost);
    await consumer.connect();

    kafkaTopic?.forEach((t: string) => {
        const run2 = async () => {
            console.log('Setting up Kafka client for ', kafkaHost, 'on topic', t);
            await consumer.subscribe({ topic: t });
        }
        run2().catch(e => console.error(`[server.js] ${e.message}`, e))
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
                            console.log(`Responder with id ${responderId} is a person`);
                            MissionService.put(mission);
                        }
                    });
                }
            } catch (err) {
                console.error(`Error when transforming incoming message to CloudEvent. ${err.message}`, err);
                console.error('    Topic: ', topic);
                console.error('    Message:', message);
            }
        },
    })
};

run().catch(e => console.error(`[server.js] ${e.message}`, e))

const start = async () => {
    app.log.info('starting server on port ' + port);
    try {
        await app.listen(port, '0.0.0.0');
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}
start();