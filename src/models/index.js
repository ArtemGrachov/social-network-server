const { Sequelize } = require('sequelize');
const constants = require('../constants');

const sequelize = new Sequelize(
    constants.DB_NAME,
    constants.DB_USER,
    constants.DB_PASSWORD,
    {
        dialect: constants.DB_DIALECT,
        host: constants.DB_HOST
    }
);

module.exports = sequelize;
