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
});

User.associate = models => {
    User.hasMany(models.Post);

    User.belongsToMany(
        models.Community,
        { through: 'UsersCommunities' }
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

module.exports = User;
