const http = require('http');

const cache = require('./cache');
const router = require('./router');
const { create: createProxy } = require('./proxy');
const { SERVER_ID } = require('./utils');

const port = 5050;

const proxyLegacy = createProxy({});
const proxyNewRoute = createProxy({}, {
    request: (proxyReq, req, res, options) => {
        console.log('options:', options.params);
        proxyReq.setHeader('Authorization', `Bearer ${options.params.token}`)
    }
});

const authenticate = (req, res) => {
    console.log('Req:Headers', req.headers);
    return Promise.resolve('token123');
}

const server = http.createServer(function(req, res) {
    if (router.handle(req, res)) {
        return;
    }

    return cache.get(req.url)
        .then(value => {
            if (!value) {
                proxyLegacy.proxyServer.web(req, res, { target: 'http://127.0.0.1:9000' });
                return;
            }

            authenticate(req, res)
                .then(token => {
                    if (!token) {
                        return;
                    }

                    proxyNewRoute.proxyServer.web(
                        req, 
                        res, 
                        { target: 'http://127.0.0.1:9001', params: { token }});
                });

        }).catch(err => {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Erro ao processar a requisição: ' + err);
        });
});
 
cache.init();
console.log(`Iniciando proxy (${SERVER_ID}) na porta ${port}.`);
server.listen(5050);