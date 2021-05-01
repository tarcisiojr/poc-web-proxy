const Redis = require("ioredis");

module.exports = {
    redis: new Redis(),
    pub: new Redis(),
    sub: new Redis(),
}