const BadRequestError = require('./bad-request')
const UnathenticatedError = require('./unathenticated')
const CustomAPIError = require('./custom-error')



module.exports = {
    BadRequestError, // 400
    UnathenticatedError, // 401
    CustomAPIError,
}