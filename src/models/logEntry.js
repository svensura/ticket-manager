const mongoose = require('mongoose')
const validator = require('validator')


const logEntrySchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        trim: true
    },
    creator: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    }

},{
    timestamps: true
})



const LogEntry = mongoose.model('LogEntry', logEntrySchema)

module.exports = LogEntry