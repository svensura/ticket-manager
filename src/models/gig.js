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
            trim: true,
        },
        email: {
            type: String,
            trim: true,

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
        default: 0
    },
})

module.exports = Gig