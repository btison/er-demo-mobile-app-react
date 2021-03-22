import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Kafka, logLevel } from 'kafkajs';
import { KafkaMessage } from './cloudevents';
import { ResponderService } from './services/responder-service';
import { MissionService } from './services/mission-service';
import { Mission, Route } from './services/mission-service/mission-service';

const app = express();

app.set('port', process.env.PORT || 8080);
app.set('responder-service', process.env.RESPONDER_SERVICE);
app.set('disaster-simulator', process.env.DISASTER_SIMULATOR);
app.set('disaster-service', process.env.DISASTER_SERVICE);
if (process.env.KAFKA_HOST) {
    app.set('kafka-host', process.env.KAFKA_HOST.split(','));
}
app.set('kafka-groupid', process.env.KAFKA_GROUP_ID || 'emergency-response-app');
if (process.env.KAFKA_TOPIC) {
    app.set('kafka-message-topic', process.env.KAFKA_TOPIC.split(','));
}

app.use(express.static(path.join(__dirname, 'client/build')));

app.use(
    '/responder-service/*',
    createProxyMiddleware({
        target: app.get('responder-service'),
        secure: false,
        changeOrigin: true,
        logLevel: 'debug',
        pathRewrite: {
            '^/responder-service': ''
        }
    })
);

app.use(
    '/disaster-simulator-service/*',
    createProxyMiddleware({
        target: app.get('disaster-simulator'),
        secure: false,
        changeOrigin: true,
        logLevel: 'debug',
        pathRewrite: {
            '^/disaster-simulator-service': ''
        }
    })
);

app.use(
    '/disaster-service/*',
    createProxyMiddleware({
        target: app.get('disaster-service'),
        secure: false,
        changeOrigin: true,
        logLevel: 'debug',
        pathRewrite: {
            '^/disaster-service': ''
        }
    })
);

app.get('/mission-service/mission/:id', (req, res) => {
    let mission: Mission | null = MissionService.get(req.params.id);
    if (mission === null) {
        res.status(404).send('Mission not found');
    } else {
        res.status(200).json(mission)
    }
});

app.use(bodyParser.json());

app.post('/mission-service/mission/:id', (req, res) => {
    const responderLocation: Route = req.body;
    MissionService.update(req.params.id, responderLocation);
    res.status(204).send();
    // TODO: error handling?
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

// setup kafka connection
const kafka = new Kafka({
    logLevel: logLevel.INFO,
    brokers: app.get('kafka-host'),
    connectionTimeout: 3000
});
const consumer = kafka.consumer({ groupId: app.get('kafka-groupid') });

const run = async () => {
    console.log('Setting up Kafka client for ', app.get('kafka-host'));
    await consumer.connect();

    app.get('kafka-message-topic').forEach((t: string) => {
        const run2 = async () => {
            console.log('Setting up Kafka client for ', app.get('kafka-host'), 'on topic', t);
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

// start express server on port 8080
app.listen(app.get('port'), () => {
    console.log('server started on port ' + app.get('port'));
});