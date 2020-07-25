const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');

const sequelize = require('./');

const constants = require('../constants');

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
    User.hasMany(models.Post, { foreignKey: 'postId', as: 'post' });

    User.belongsToMany(
        models.Community,
        { through: 'usersCommunities', foreignKey: 'userId', otherKey: 'communityId' }
    );

    User.belongsToMany(
        models.User,
        {
            through: 'usersSubscriptions',
            foreignKey: 'subscriptionId',
            otherKey: 'subscriberId',
            as: {
                singular: 'subscriber',
                plural: 'subscribers'
            }
        }
    );

    User.belongsToMany(
        models.User,
        {
            through: 'usersSubscriptions',
            foreignKey: 'subscriberId',
            otherKey: 'subscriptionId',
            as: {
                singular: 'subscription',
                plural:  'subscriptions'
            }
        }
    );
};

User.prototype.getAuthTokens = function() {
    const token = jwt.sign(
        { userId: this.id },
        constants.JWT_KEY,
        { expiresIn: constants.JWT_LIFE }
    );

    const refreshToken = jwt.sign(
        { userId: this.id },
        constants.JWT_REFRESH_KEY,
        { expiresIn: constants.JWT_REFRESH_LIFE }
    );

    return { token, refreshToken };
}

User.prototype.getResetPasswordToken = function() {
    const resetPasswordToken = jwt.sign(
        { userId: this.id },
        constants.RESET_PASSWORD_TOKEN,
        { expiresIn: constants.RESET_PASSWORD_TOKEN_LIFE }
    );

    return resetPasswordToken;
}

User.prototype.serialize = function() {
    const { firstname, lastname, country, city, phone, avatarURL, status } = this;
    return { firstname, lastname, country, city, phone, avatarURL, status };
}

module.exports = User;
