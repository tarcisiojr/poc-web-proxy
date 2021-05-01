const { redis } = require('./redis');
const { v4: uuidv4 } = require('uuid');

const TTL_KEEP_ALIVE = 60;
const serverId = uuidv4();

const keepAlive = () => {
    console.log(`Keep Alive: ${serverId}`);
    redis.set(`server:${serverId}`, true, 'EX', TTL_KEEP_ALIVE + 5);
}

keepAlive();
setInterval(keepAlive, 1000 * TTL_KEEP_ALIVE);

module.exports = {
    SERVER_ID: serverId,
}