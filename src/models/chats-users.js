const Sequelize = require('sequelize');

const sequelize = require('./');

const ChatsUsers = sequelize.define('ChatsUsers', {
    userId: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    chatId: {
        type: Sequelize.INTEGER,
        primaryKey: true
    }
}, {
    tableName: 'chatsUsers'
});

module.exports = ChatsUsers;
