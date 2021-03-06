module.exports = {
    PORT: process.env.PORT,
    DB_HOST: process.env.DB_HOST,
    DB_DIALECT: process.env.DB_DIALECT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    JWT_KEY: process.env.JWT_KEY,
    JWT_LIFE: process.env.JWT_LIFE,
    JWT_REFRESH_KEY: process.env.JWT_REFRESH_KEY,
    JWT_REFRESH_LIFE: process.env.JWT_REFRESH_LIFE,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
    RESET_PASSWORD_TOKEN: process.env.RESET_PASSWORD_TOKEN,
    RESET_PASSWORD_TOKEN_LIFE: process.env.RESET_PASSWORD_TOKEN_LIFE,
    PASSWORD_MIN_LENGTH: process.env.PASSWORD_MIN_LENGTH || 8,
    PASSWORD_MAX_LENGTH: process.env.PASSWORD_MAX_LENGTH || 18
};
