const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const constants = require('./constants');
const sequelize = require('./models/index');

require('./models/user');
require('./models/post');
require('./models/community');

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

const init = async () => {
    try {
        await sequelize.authenticate();
    } catch (err) {
        console.log('Database connection error');
        console.log(err);
    }

    const { models } = sequelize;

    Object.keys(models)
        .map(key => models[key])
        .filter(model => !!model.associate)
        .forEach(model => {
            model.associate(models);
        });

    try {
        await sequelize.sync({ force: true });
    } catch (err) {
        console.log('Database sync error');
        console.log(err);
    }

    const PORT = constants.PORT;

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

init();
