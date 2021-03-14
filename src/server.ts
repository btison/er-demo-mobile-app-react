import express from 'express';
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';

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

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

// start express server on port 8080
app.listen(app.get('port'), () => {
    console.log('server started on port ' + app.get('port'));
});