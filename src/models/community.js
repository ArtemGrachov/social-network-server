const Sequelize = require('sequelize');
const sequelize = require('./');

const Community = sequelize.define('Community', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT
    }
});

Community.associate = models => {
    Community.belongsToMany(
        models.User,
        { through: 'UsersCommunities' }
    );

    Community.hasMany(models.Post);
}

module.exports = Community;
