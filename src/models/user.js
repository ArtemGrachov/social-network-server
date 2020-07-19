const Sequelize = require('sequelize');
const sequelize = require('./');

const User = sequelize.define('User', {
    firstname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lastname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: Sequelize.STRING,
    country: Sequelize.STRING,
    city: Sequelize.STRING,
    phone: Sequelize.STRING,
    avatarURL: Sequelize.STRING,
    status: Sequelize.STRING
}, {
    tableName: 'users'
});

User.associate = models => {
    User.hasMany(
        models.Post,
        { foreignKey: 'authorId', as: 'author' }
    );
    User.hasMany(
        models.Community,
        { foreignKey: 'communityId', as: 'community' }
    );
};

module.exports = User;
