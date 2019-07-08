const mongoose = require('mongoose')
const validator = require('validator')

const Gig = mongoose.model('Gig', {

    houseNo: {
        type: Number,
        unique: true,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    performer: {
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
    venue: {
        type: mongoose.Schema.Types.ObjectId,
        unique: true,
        ref: 'Venue'
    },
    startSeats: {
        type: Number,
    },
    soldSeats: {
        type: Number,
    },
})

module.exports = Gig