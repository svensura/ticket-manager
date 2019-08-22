const mongoose = require('mongoose')
const validator = require('validator')

const Venue = mongoose.model('Venue', {

    address: {
        type: String,
        required: true,
        trim: true
    },
    contact: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            default: 0,
            validate(value) {
                if (value.length > 20) {
                    throw new Error('Too long')
                }
            }
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Email is invalid')
                }
            }
        }
    },
    seats: {
        type: Number,
        required: true,
    },
    active: {
        type: Boolean,
        default: true
    },
    coords: {
        type: Array
        }

})

module.exports = Venue