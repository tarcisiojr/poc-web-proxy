const httpProxy = require('http-proxy');

const { SERVER_ID } = require('./utils');

const create = (proxyOpts, customEvents) => {
    const proxyServer = httpProxy.createProxyServer(proxyOpts);
    const events = customEvents || {};

    proxyServer.on('proxyReq', function (proxyReq, req, res, options) {
        proxyReq.setHeader('X-ServerId', SERVER_ID);
        if (events['request']) {
            events['request'](proxyReq, req, res, options);
        }
    });

    proxyServer.on('proxyRes', function (proxyRes, req, res, options) {
        res.setHeader('X-ServerId', SERVER_ID);
        if (events['response']) {
            events['response'](proxyRes, req, res, options);
        }
    });

    proxyServer.on('error', function (err, req, res) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Não possível acessar o recurso solicitado.');
    });

    return {
        proxyServer,
    }
}

module.exports = {
    create
}