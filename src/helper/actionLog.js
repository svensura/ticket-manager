const User = require('../models/user')
const LogEntry = require('../models/logEntry')
const jwt = require('jsonwebtoken')

const actionLog = async (keyword, authorization, JSONcontent) => {
    try {
        const creatorToken = authorization.split(' ');
        const decoded = jwt.verify(creatorToken[1], process.env.JWT_SECRET);
        const creator = await User.findById(decoded)
        const logEntry = new LogEntry
        
        logEntry.action = keyword
        logEntry.creator = creator
        logEntry.content = JSON.stringify(JSONcontent)

        console.log(`${keyword} by ${creator.name} ${JSON.stringify(JSONcontent)}`)
        try {
            await logEntry.save()
        } catch (e) {
            throw new Error(e)
        }
    } catch (e) {
        throw new Error(e)
    }
}

module.exports = actionLog