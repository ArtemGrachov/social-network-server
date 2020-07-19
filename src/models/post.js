const Sequelize = require('sequelize');
const sequelize = require('./');

const Post = sequelize.define('Post', {
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    }
}, {
    tableName: 'posts'
});

Post.associate = models => {
    Post.belongsTo(
        models.User,
        { foreignKey: 'authorId', as: 'author' }
    );
    Post.belongsTo(
        models.Community,
        { foreignKey: 'communityId', as: 'community' }
    )
}

module.exports = Post;
