const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const sequelize = require('./models/index');
require('./models/user');
require('./models/post');
require('./models/community');

const authMiddleware = require('./middlewares/auth');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const usersRoutes = require('./routes/users');
const userRoutes = require('./routes/user');

const constants = require('./constants');
const errors = require('./errors');

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(authMiddleware);
app.use('/auth', authRoutes);
app.use('/posts', postsRoutes);
app.use('/users', usersRoutes);
app.use('/user', userRoutes);

app.use((err, req, res, next) => {
    console.log(err);

    const resError = { message: err.statusCode ? err.message : errors.SERVER_ERROR };

    if (err.data) {
        resError.data = err.data;
    };

    res
        .status(err.statusCode || 500)
        .json(resError);
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
        await sequelize.sync();
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
