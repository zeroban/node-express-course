const jwt = require('jsonwebtoken')
const { UnathenticatedError } = require('../errors')

const authenticationMiddleware = async (req, res, next) => {

    // checks to see if request has auth header with Bearer
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnathenticatedError('No token provided')
    }

    // will split the token from the bearer
    const token = authHeader.split(' ')[1]


    try {
        // verifies the token with the JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const { id, username } = decoded
        req.user = { id, username }
        next()
    }

    catch (error) {
        throw new UnathenticatedError('Not authorized to access this route')

    }
}

module.exports = authenticationMiddleware