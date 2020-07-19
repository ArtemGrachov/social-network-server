module.exports = function(code, message, data) {
    const error = new Error(message);
    error.statusCode = code;
    if (data) {
        error.data = data
    }
    return error
}
