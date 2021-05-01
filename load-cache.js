const fetch = require('node-fetch');
const async = require('async');

const createRoute = (i) => (next) => {
    return fetch('http://localhost:5050/_set', {
        method: 'post',
        body: JSON.stringify({ key: `/rota-${i}/`, value: true }),
        headers: { 'Content-Type': 'application/json' },
    }).then(() => next())
    .catch(err => next(err));
}


function* makeRoutes() {
    let i = 0;

    while (i < 100000) {
        i++;
        yield createRoute(i);
        console.log(i);
    }
};


async.parallelLimit(makeRoutes(), 500, () => {
    console.log('FIM');
});