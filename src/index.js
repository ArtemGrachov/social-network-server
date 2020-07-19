const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const constants = require('./constants');

const PORT = constants.PORT;

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/', (req, res) => {
    res
        .status(200)
        .json({ message: 'Hello, world' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});