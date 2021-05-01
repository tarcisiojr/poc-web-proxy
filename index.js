const http = require('http');
const httpProxy = require('http-proxy');
const { URL } = require('url');

const cache = require('./cache');
const { SERVER_ID } = require('./utils');

const proxy = httpProxy.createProxyServer({});
const port = 5050;


const readJSON = (req) => {
    let buffer = '';
    return new Promise((resolve, reject) => {
        req.on('data', (chunk) => {
            buffer += chunk;
        })
        req.on('end', () => {
            try {
                resolve(JSON.parse(buffer));
            } catch (err) {
                reject(err);
            }
        });
    });
}

const setKeyValue = (command) => {
    if (!command.key || !command.value) {
        return Promise.reject('Comando inválido!');
    }

    return cache.set(command.key, command.value)
}

const setValueHandler = (req, res) => {
    let json = null;

    return readJSON(req)
        .then(value => {
            console.log('Read JSON:', value);
            json = value;
            return value;
        })
        .then(setKeyValue)
        .then((ret) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(ret));
        })
        .catch(err => {
            console.error(err);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(err));
        });
}

const getValueHandler = (req, res) => {
    const searchParams = new URL(`http://nop${req.url}`).searchParams;
    console.log('search', searchParams);

    const key = searchParams.get('key');
    const ret = {
        serverId: SERVER_ID,
        [key]: null
    };

    if (!key) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(ret));
        return;
    }

    return cache.get(key)
        .then(value => {
            console.log('Get value:', value);
            res.writeHead(value !== null && value !== undefined ? 200 : 404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({...ret, [key]: value}));
        })
}


proxy.on('proxyReq', function(proxyReq, req, res, options) {
    proxyReq.setHeader('X-ServerId', SERVER_ID);
});

const server = http.createServer(function(req, res) {
    if (req.url.startsWith('/_set') && req.method == 'POST') {
        return setValueHandler(req, res);

    }
    
    if (req.url.startsWith('/_get') && req.method == 'GET') {
        return getValueHandler(req, res);
    }
    
    if (req.url.startsWith('/_purge') && req.method == 'DELETE') {
        res.writeHead(404);
        res.end();
        return;
    }

    return cache.get(req.url)
        .then(value => {
            if (value) {
                proxy.web(req, res, { target: 'http://127.0.0.1:9000' });
            } else {
                proxy.web(req, res, { target: 'http://127.0.0.1:9001' });
            }
        });
});
 
cache.init();
console.log(`Iniciando proxy (${SERVER_ID}) na porta ${port}.`);
server.listen(5050);