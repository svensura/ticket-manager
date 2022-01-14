const mongoose = require('mongoose')
const validator = require('validator')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

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
    feePPEur: {
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
    vendorTickets: [{
        vendorName: {
            type: String,
            required: true
        },
        amount: Number,
        date: Date
    }],
    paypalTickets: [{
        buyer: {
            type: String,
            required: true
        },
        date: Date,
        check: String
    }]
    
})

gigSchema.methods.generatePaypalTicket = async function (buyer, check) {
    const gig = this
    const date = new Date
    var dublette = false
    console.log('CHECK: ',check)
    console.log('Length: ',gig.paypalTickets.length)


    gig.paypalTickets.forEach(ticket => {
        console.log('TICKET: ',ticket)
        //console.log('TICKETCHECK: ',ticket.check)
        if (ticket.check.valueOf() == check.valueOf()) {
            dublette = true
            console.log('DUBLETTE: ',dublette)
        }
    });

    if (!dublette){
        gig.paypalTickets = gig.paypalTickets.concat({ buyer, date, check })
        gig.soldSeats ++
    }
    try {
        await gig.save()
    } catch (e) {
        throw new Error(e)
    }
    return buyer
}

gigSchema.methods.generateVendorTicket = async function (authorization, amount, secret) {
    try {
        const vendorToken = authorization.split(' ');
        const decoded = jwt.verify(vendorToken[1], secret);
        const vendor = await User.findById(decoded)
        const vendorName = vendor.name
        const gig = this
        const date = new Date
        gig.vendorTickets = gig.vendorTickets.concat({ vendorName, date, amount })
        gig.soldSeats += amount
        try {
            await gig.save()
        } catch (e) {
            throw new Error(e)
        }
    } catch (e) {
        throw new Error(e)
    }
    return
}

const Gig = mongoose.model('Gig', gigSchema)

module.exports = Gig