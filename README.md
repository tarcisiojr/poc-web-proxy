# POC de uso de um Web Proxy

## Uso

### Proxy
```shell
npm install
npm start
```

### Web Server de Teste
Servidor A
```shell
node web-server-test.js 9001
```

Servidor B
```shell
node web-server-test.js 9000
```

### Adicionando Valor no Cache
```shell
curl --location --request POST 'http://localhost:5050/_set' \
--header 'Content-Type: application/json' \
--data-raw '{
    "key": "/rota-d/",
    "value": true
}'
```

### Obtendo Valor do Cache
```shell
curl --location --request GET 'http://localhost:5050/_get?key=/rota-d/' \
--header 'Content-Type: application/json' \
```
