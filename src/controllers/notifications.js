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
