const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET + "VENDOR")
        const vendor = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!vendor) {
            throw new Error()
        }

        req.token = token
        req.user = vendor
        next()
        return vendor
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate! - Bitte authentifizieren Sie sich!' })
    }
}

module.exports = auth