const express = require('express')
const router = express.Router()

const { login, dashboard } = require('../controllers/main')

// calls the auth middleware
const authMiddleware = require('../middleware/auth')




// dashboard should be a get route
// anytime they navigate to the dashboard it will pass them through the middleware first then to the dashboard using next()
router.route('/dashboard').get(authMiddleware, dashboard)

// login should be a post route
router.route('/login').post(login)

module.exports = router