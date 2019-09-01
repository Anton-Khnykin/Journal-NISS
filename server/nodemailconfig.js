module.exports = {
  host: process.env.PRODUCTION_MAIL_HOST || process.env.DEV_MAIL_HOST,
  port: process.env.PRODUCTION_MAIL_PORT || process.env.DEV_MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.PRODUCTION_MAIL_USER || process.env.DEV_MAIL_USER,
    pass: process.env.PRODUCTION_MAIL_PASS || process.env.DEV_MAIL_PASS
  }
}
