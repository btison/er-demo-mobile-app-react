'use strict'

const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require('http-proxy-middleware');
const generatePassword = require('password-generator');

const app = express(); // create express app

app.set('port', process.env.PORT || 8080);
app.set('responder-service', process.env.RESPONDER_SERVICE);

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

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

// start express server on port 8080
app.listen(app.get('port'), () => {
    console.log('server started on port ' + app.get('port'));
});