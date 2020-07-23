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
}, {
    tableName: 'communities'
});

Community.associate = models => {
    Community.belongsToMany(
        models.User,
        { through: 'usersCommunities', foreignKey: 'communityId', otherKey: 'userId' }
    );

    Community.hasMany(models.Post, { foreignKey: 'communityId' });
}

module.exports = Community;
