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
    Comment.belongsTo(
        models.Post,
        {
            foreignKey: 'postId',
            as: 'post',
            allowNull: false
        }
    );
    Comment.belongsTo(
        models.User,
        {
            foreignKey: 'authorId',
            as: 'author',
            allowNull: false
        }
    );

    Comment.belongsTo(
        models.Comment,
        {
            foreignKey: 'referenceId',
            as: 'reference',
            allowNull: false
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


    const likesCount = await this.countLikedUser();

    if (!userInstance) {
        return {
            ...result,
            likesCount
        };
    }

    const liked = await userInstance.hasLikedComment(this);

    return {
        ...result,
        liked,
        likesCount
    };
}

module.exports = Comment;
