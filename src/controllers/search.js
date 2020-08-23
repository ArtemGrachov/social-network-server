const { Sequelize } = require('sequelize');
const validator = require('validator');

const User = require('../models/user');
const Post = require('../models/post');

const errorFactory = require('../utils/error-factory');
const paginationFactory = require('../utils/pagination-factory');
const textSearchQuery = require('../utils/text-search-query');
const errors = require('../errors');

const format = /(?!^%+$)^.+$/;

exports.searchUser = async (req, res, next) => {
    try {
        let { page, count } = req.query;

        page = +page;
        count = +count;

        if (!page) {
            throw errorFactory(422, errors.PAGE_REQUIRED);
        }

        if (!count) {
            throw errorFactory(422, errors.RECORDS_COUNT_REQUIRED);
        }

        const validationErrors = [];

        const fields = [
            { field: 'firstname', min: 3 },
            { field: 'lastname', min: 3 },
            { field: 'country', min: 3 },
            { field: 'city', min: 3 },
            { field: 'phone', min: 5 }
        ];

        if (!fields.find(({ field }) => req.body[field])) {
            throw errorFactory(422, errors.INVALID_INPUT);
        }

        fields.forEach(({ field, min }) => {
            const lengthValidation = { min };
            const value = req.body[field];

            if (!value) {
                return;
            }

            if (!validator.isLength(value, lengthValidation)) {
                validationErrors.push({
                    field,
                    error: errors.INVALID_LENGTH,
                    data: lengthValidation
                });
            }

            if (!validator.matches(value, format)) {
                validationErrors.push({
                    field,
                    error: errors.INVALID_FORMAT,
                    data: format.toString()
                });
            }
        });

        if (validationErrors.length) {
            throw errorFactory(422, errors.INVALID_INPUT, validationErrors);
        }

        const queries = [];

        fields.forEach(({ field }) => {
            const value = req.body[field];

            if (!value) {
                return;
            }

            queries.push(textSearchQuery(field, value));
        });

        const { rows, count: total } = await User.findAndCountAll({
            where: {
                [Sequelize.Op.and]: queries
            },
            limit: count,
            offset: (page - 1) * count
        });

        const users = rows.map(user => user.serializeMin());

        res
            .status(200)
            .json({
                users,
                pagination: paginationFactory(page, count, total)
            });
    } catch (err) {
        next(err);
    }
}

exports.searchPost = async (req, res, next) => {
    try {
        const { content } = req.body;

        let { page, count } = req.query;

        page = +page;
        count = +count;

        if (!page) {
            throw errorFactory(422, errors.PAGE_REQUIRED);
        }

        if (!count) {
            throw errorFactory(422, errors.RECORDS_COUNT_REQUIRED);
        }

        if (!content) {
            throw errorFactory(422, errors.INVALID_INPUT);
        }

        const validationErrors = [];
        const lengthValidation = { min: 3 };

        if (content) {
            if (!validator.isLength(content, lengthValidation)) {
                validationErrors.push({
                    field: 'content',
                    error: errors.INVALID_LENGTH,
                    data: lengthValidation
                });
            }

            if (!validator.matches(content, format)) {
                validationErrors.push({
                    field: 'content',
                    error: errors.INVALID_FORMAT,
                    data: format.toString()
                });
            }
        }

        const { rows, count: total } = await Post.findAndCountAll({
            where: textSearchQuery('textContent', content),
            limit: count,
            offset: (page - 1) * count
        });

        const posts = await Promise.all(rows.map(post => post.serialize(req.user)));

        const postsAuthors = new Set(rows.map(post => post.authorId));
        const authorsInstances = await User.findAll({
            where: { id: Array.from(postsAuthors) }
        });

        const authors = authorsInstances.map(author => author.serializeMin());

        res
            .status(200)
            .json({
                posts,
                authors,
                pagination: paginationFactory(page, count, total)
            });
    } catch (err) {
        next(err);
    }
}
