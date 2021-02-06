const Notification = require('../models/notification');

const success = require('../success');

exports.getNotifications = async (req, res, next) => {
    try {
        const { user } = req;

        const notificationInstances = await user.getNotifications();
        const notifications = await Promise.all(
            notificationInstances.map(n => n.serialize(user))
        );

        res.json({ notifications });
    } catch (err) {
        next(err);
    }
}

exports.deleteNotification = async (req, res, next) => {
    try {
        let { notificationId } = req.params;
        notificationId = +notificationId;

        const notificationInstance = await Notification.findByPk(notificationId);

        if (!notificationInstance) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        if (req.user.id !== notificationInstance.ownerId) {
            throw errorFactory(403, errors.NOT_AUTHORIZED);
        }

        await notificationInstance.destroy();

        res
            .status(200)
            .json({
                message: success.NOTIFICATION_DELETED_SUCCESSFULLY,
                notificationId
            });
    } catch (err) {
        next(err);
    }
}
