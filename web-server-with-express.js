const express = require('express');

const app = express();


app.get('/', (req, res) => {
    res.json({timeInMilis: new Date().getTime()});
})

app.listen(9010, () => {
    console.log(`App listening on port ${9010}`);
})