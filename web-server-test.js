const http = require('http');

const port = process.argv[2] ? parseInt(process.argv[2]) : 9000;

console.log(`Iniciando servidor na porta ${port}`);

http.createServer(function (req, res) {
    console.log(`Nova requisição: ${req.url} - ${req.headers['x-serverid']}`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify({timeInMilis: new Date().getFullYear()}));
    res.end();
}).listen(port);