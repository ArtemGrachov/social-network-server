const Sequelize = require('sequelize');

const sequelize = require('./');

const Comment = sequelize.define('Comment', {
    content: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    tableName: 'comments'
});

Comment.associate = models => {
    Comment.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
    Comment.belongsTo(models.User, { foreignKey: 'authorId', as: 'author' });

    Comment.belongsTo(
        models.Comment,
        {
            foreignKey: 'referenceId',
            as: 'reference'
        }
    );

    Comment.hasOne(
        models.Comment,
        {
            foreignKey: 'referenceId',
            as: 'answer'
        }
    );

    Comment.belongsToMany(models.User, {
        through: 'usersCommentsLikes',
        foreignKey: 'likedCommentId',
        otherKey: 'likedUserId',
        as: 'likedUser'
    });
};

Comment.prototype.serialize = async function(userInstance) {
    const { id, content, postId, authorId, referenceId } = this;

    const result = { id, content, postId, authorId, referenceId };

    if (!userInstance) {
        return result;
    }

    const liked = await userInstance.hasLikedComment(this);

    return {
        ...result,
        liked
    };
}

module.exports = Comment;
