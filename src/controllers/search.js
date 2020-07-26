const { Sequelize } = require('sequelize');
const validator = require('validator');

const User = require('../models/user');
const Post = require('../models/post');

const errorFactory = require('../utils/error-factory');
const paginationFactory = require('../utils/pagination-factory');
const textSearchQuery = require('../utils/text-search-query');
const errors = require('../errors');

exports.searchUser = async (req, res, next) => {
    try {
        const {
            firstname,
            lastname,
            country,
            city,
            phone
        } = req.body;

        let { page, count } = req.query;

        page = +page;
        count = +count;

        if (!page) {
            throw errorFactory(422, errors.PAGE_REQUIRED);
        }

        if (!count) {
            throw errorFactory(422, errors.RECORDS_COUNT_REQUIRED);
        }

        if (!firstname && !lastname && !country && !city && !phone) {
            throw errorFactory(422, errors.INVALID_INPUT);
        }

        const validationErrors = [];

        if (firstname) {
            if (!validator.isLength(firstname, { min: 3 })) {
                validationErrors.push(errors.INVALID_LENGTH);
            }
        }

        if (lastname) {
            if (!validator.isLength(lastname, { min: 3 })) {
                validationErrors.push(errors.INVALID_LENGTH);
            }
        }

        if (country) {
            if (!validator.isLength(country, { min: 3 })) {
                validationErrors.push(errors.INVALID_LENGTH);
            }
        }

        if (city) {
            if (!validator.isLength(city, { min: 3 })) {
                validationErrors.push(errors.INVALID_LENGTH);
            }
        }

        if (phone) {
            if (!validator.isLength(city, { min: 5 })) {
                validationErrors.push(errors.INVALID_LENGTH);
            }
        }

        if (validationErrors.length) {
            throw errorFactory(422, errors.INVALID_INPUT, validationErrors);
        }

        const queries = [];

        if (firstname) {
            queries.push(textSearchQuery('firstname', firstname));
        }

        if (lastname) {
            queries.push(textSearchQuery('lastname', lastname));
        }

        if (country) {
            queries.push(textSearchQuery('country', country));
        }

        if (city) {
            queries.push(textSearchQuery('city', city));
        }

        if (phone) {
            queries.push(textSearchQuery('phone', phone));
        }

        const { rows, count: total } = await User.findAndCountAll({
            where: {
                [Sequelize.Op.and]: queries
            },
            limit: page * count,
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

        if (content) {
            if (!validator.isLength(content, { min: 3 })) {
                validationErrors.push(errors.INVALID_LENGTH);
            }
        }

        const { rows, count: total } = await Post.findAndCountAll({
            where: textSearchQuery('textContent', content),
            limit: page * count,
            offset: (page - 1) * count
        });

        const posts = rows.map(post => post.serialize());

        res
            .status(200)
            .json({
                posts,
                pagination: paginationFactory(page, count, total)
            });
    } catch (err) {
        next(err);
    }
}
