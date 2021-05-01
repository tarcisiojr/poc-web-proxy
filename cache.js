const { redis, sub, pub } = require('./redis');
const { SERVER_ID } = require('./utils');
const CACHE = {};

const loadCache = () => {
    return redis.keys('cache:*') // alterar para scan
        .then(keys => {
            if (!keys.length) {
                console.log('Nenhum chave carregada no cache!');
                return;
            }
            return redis.mget(keys)
                .then(values => {
                    values.forEach((val, idx) => {
                        CACHE[keys[idx].split(':')[1]] = val
                    });
                    console.log(`Foram carregadas ${values.length} chave(s).`);
                    console.log(CACHE);
                })
        })
}

const registerCacheChanges = () => {
    console.log('Canal subscrito:', `update-cache:${SERVER_ID}`);

    return new Promise((resolve, reject) => {
        sub.subscribe(`update-cache:${SERVER_ID}`)
            .then(() => {
                console.log(`Subscrição OK: ${SERVER_ID}`);

                resolve();
            })
            .catch(reject);
    
        sub.on('message', (channel, message) => {
            console.log('Cache changed: ', message);
            const obj = JSON.parse(message);
            CACHE[obj.key] = obj.value;
        });
    });
}

const replyMessage = (message) => (server) => {
    console.log('Reply message', message, 'on', server);
    return pub.publish(`update-cache:${server.split(':')[1]}`, message);
}

const broadcastMessage = (message) => {
    console.log('Broadcasiting messages');
    return redis.keys('server:*')
        .then(keys => Promise.all(keys.map(replyMessage(message))))
        .then(() => console.log('Mensagens replicadas com sucesso!'));
}



module.exports = {
    get: (key, defaultValue = null) => {
        return Promise.resolve(CACHE[key] === undefined || CACHE[key] === null ? defaultValue  : CACHE[key]);
    },
    set: (key, value) => {
        CACHE[key] = value;
        const cachedValue = {[key]: value};
        return redis.set(`cache:${key}`, value)
            .then(() => broadcastMessage(JSON.stringify({key, value})))
            .then(() => cachedValue);
    },
    init: () => loadCache()
        .then(registerCacheChanges)
}