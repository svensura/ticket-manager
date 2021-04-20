const mongoose = require('mongoose')
const validator = require('validator')

const Student = mongoose.model('Student', {

    prename: {
        type: String,
        required: true,
        trim: true
        },
    surname: {
        type: String,
        required: true,
        trim: true
        },
    class: {
        type: String,
        required: true,
        trim: true
        },    
    negativeTested: {
        type: String,
        required: true
    }       
})

module.exports = Student