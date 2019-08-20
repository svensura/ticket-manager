const mongoose = require('mongoose')
const validator = require('validator')

const gigSchema = new mongoose.Schema({

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
        ref: 'Venue'
    },
    feeEur: {
        type: String,
        validate(value) {
            if (!validator.isCurrency(value, {
                symbol: '€',
                require_symbol: false,
                allow_space_after_symbol: false,
                symbol_after_digits: false,
                allow_negatives: false,
                parens_for_negatives: false,
                negative_sign_before_digits: false,
                negative_sign_after_digits: false,
                allow_negative_sign_placeholder: false,
                thousands_separator: ',', decimal_separator: '.',
                allow_decimal: true,
                require_decimal: false,
                digits_after_decimal: [2],
                allow_space_after_digits: false
            })) {
                throw new Error('Wrong Format')
            }
        }
    },
    startSeats: {
        type: Number,
    },
    soldSeats: {
        type: Number,
        default: 0
    },
    tickets: [{
        buyer: {
            type: String,
            required: true
        },
        date: Date
    }]
})

gigSchema.methods.generateTicket = async function (buyer) {
    const gig = this
    const date = new Date
    gig.tickets = gig.tickets.concat({ buyer, date })
    await gig.save()

    return buyer
}

const Gig = mongoose.model('Gig', gigSchema)

module.exports = Gig