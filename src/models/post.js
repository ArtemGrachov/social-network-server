const Sequelize = require('sequelize');
const sequelize = require('./');
const htmlToText = require('html-to-text');

const Post = sequelize.define('Post', {
    content: {
        type: Sequelize.TEXT,
        allowNull: false,
        set(value) {
            this.setDataValue('content', value);
            this.setDataValue(
                'textContent',
                htmlToText.fromString(value, {
                    wordwrap: false,
                    noLinkBrackets: true,
                    ignoreHref: true,
                    ignoreImage: true,
                    uppercaseHeadings: false
                })
            );
        }
    },
    textContent: {
        type: Sequelize.TEXT,
        allowNull: false,
        set() {
            throw new Error(`'textContent' column can not be set directly. Change 'content' column instead.`)
        }
    }
}, {
    tableName: 'posts'
});

Post.associate = models => {
    Post.belongsTo(models.User, { foreignKey: 'authorId', as: 'author' });

    Post.belongsToMany(models.User, {
        through: 'usersPostsLikes',
        foreignKey: 'likedPostId',
        otherKey: 'likedUserId',
        as: 'likedUser'
    });

    Post.hasMany(
        models.Comment,
        {
            foreignKey: 'postId'
        }
    );
}

Post.prototype.serialize = async function(userInstance) {
    const result = {
        id: this.id,
        content: this.content,
        createdAt: this.createdAt,
        authorId: this.authorId
    }

    const [commentsCount, likesCount] = await Promise.all([
        this.countComments(),
        this.countLikedUser()
    ]);

    if (!userInstance) {
        return {
            ...result,
            commentsCount,
            likesCount
        };
    }

    const liked = await userInstance.hasLikedPost(this);

    return {
        ...result,
        liked,
        commentsCount,
        likesCount
    };
}

module.exports = Post;
