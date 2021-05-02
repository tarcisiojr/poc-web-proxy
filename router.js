const { URL } = require('url');

const cache = require('./cache');
const { SERVER_ID } = require('./utils');


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

const writeJSON = (res, statusCode, value) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(value));
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
            writeJSON(res, 200, ret);
        })
        .catch(err => {
            console.error(err);
            writeJSON(res, 400, err);
        });
}

const getValueHandler = (req, res) => {
    const searchParams = new URL(`http://nop${req.url}`).searchParams;
    const key = searchParams.get('key');
    const ret = {
        serverId: SERVER_ID,
        [key]: null
    };

    if (!key) {
        writeJSON(res, 404, ret);
        return;
    }

    return cache.get(key)
        .then(value => {
            const statusCode = (value !== null && value !== undefined) ? 200 : 400;
            writeJSON(res, statusCode, {...ret, [key]: value});
        })
}

const purgeCacheHandler = (req, res) => {
    res.writeHead(404);
    res.end();
}

const ROUTES = {
    '/_set:POST': setValueHandler,
    '/_get:GET': getValueHandler,
    '/_purge:DELETE': purgeCacheHandler,
}

const handle = (req, res) => {
    const routeKey = `${req.url}:${req.method}`;

    if (ROUTES[routeKey]) {
        ROUTES[routeKey](req, res);
        return true;
    }

    return false;
}


module.exports = {
    handle
}