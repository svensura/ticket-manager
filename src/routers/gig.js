const express = require('express')
const mongoose = require('mongoose')
const Gig = require('../models/gig')
const Venue = require('../models/venue')
const auth = require('../middleware/auth')
const actionLog = require('../helper/actionLog')
const mailSend = require('../helper/mailSend')
const router = new express.Router()
const validator = require('validator')




router.post('/gigs', auth, async (req, res) => {
    const gig = new Gig(req.body)
    const venue = await Venue.findById(req.body.venue)
    const seats = venue.seats
    if (seats > 0) {
        gig.startSeats = seats
    } else {
        return res.status(400).send({ error: 'No seats available!' })
    }
     
   try {
        await gig.save()
        actionLog('Gig created', req.headers.authorization, gig)
        res.status(201).send(gig)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/gigs', async (req, res) => {
    try {
        const gigs = await Gig.find({}).populate('venue').exec()
        res.send(gigs)
    } catch (e) {
        res.status(500).send()
    }
})



router.get('/gigs/:id',  async (req, res) => {
   const _id = req.params.id

    try {
        const gig = await Gig.findById(_id)

        if (!gig) {
            return res.status(404).send()
        }

        res.send(gig)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/gigs_buy/:id', async (req, res) => {
    const _id = req.params.id

   try {
        const gig = await Gig.findById(_id)

        if (!gig || (gig.startSeats - gig.soldSeats - parseInt(req.body.amount) < 0)) {
            return res.status(406).send('No or not enough tickets available')
        }  
        if (!gig) {
            return res.status(404).send()
        }
        
        gig['soldSeats'] += parseInt(req.body.amount)
        await gig.save()
        //console.log('number of seats decreased by: ', req.body.amount)
        if (req.headers.authorization){
            actionLog(`${req.body.amount} Tickets bought/refunded by Reseller`, req.headers.authorization, gig)
        } else {
            actionLog(`${req.body.amount} Tickets paypalled by ${req.body.buyer}`, undefined, gig)
        }
        const venue = await Venue.findById(gig.venue)
        if (gig.Venue && gig.startSeats - gig.soldSeats == 0) {
            mailSend(venue.contact.email, 'Fully Booked', `Hi ${venue.contact.name}, the Grosse-Kiesau-Literaturnacht-gig "${gig.title}" is fully booked!`)
       }

        res.send(gig)

    } catch (e) {
        res.status(500).send()
    }
})






router.patch('/gigs/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['houseNo', 'title', 'performer', 'venue', 'feeEur', 'startSeats']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send('Invalid updates!')
    }

    try {
        const gig = await Gig.findById(req.params.id)

        updates.forEach((update) => {
            // to catch an venue update coming as string must be an ID
            if(update == "venue") {
                 gig[update] = mongoose.Types.ObjectId(req.body[update])
            } else 
            {
                gig[update] = req.body[update]
            }
        })
        const venue = await Venue.findById(req.body.venue)
        const seats = venue.seats
        if (seats > 0) {
            gig.startSeats = seats
        } else {
            return res.status(400).send('No seats available!')
        }
        await gig.save()
        actionLog('Gig edited', req.headers.authorization, gig)

        if (!gig) {
            return res.status(404).send()
        }

        res.send(gig)
    } catch (e) {
        res.status(400).send(e)
    }
    
})

router.delete('/gigs/:id', auth, async (req, res) => {
    try {
        const gig = await Gig.findByIdAndDelete(req.params.id)
        actionLog('Gig deleted', req.headers.authorization, gig)
        if (!gig) {
            res.status(404).send()
        }

        res.send(gig)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/gigs_ticket/:id',  async (req, res) => {
    const buyer = req.body.buyer
    const amount = parseInt(req.body.amount)
    try {
        const gig = await Gig.findById(req.params.id)
        for (var i = 0; i < amount; i++ ){
            await gig.generateTicket(buyer)
            res.status(201).send()
        }
        if (validator.isEmail(buyer)) {
            await mailSend(buyer, 'Tickets for Große Kiesau Literaturnacht', `Hi, you have purchased ${amount} ticket(s) for House No. ${gig.houseNo}. More information at www.grosse-kiesau.de.`)
        }  
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/gigs_list/:id',  async (req, res) => {
    const _id = req.params.id
    try {
        const gig = await Gig.findById(req.params.id)
        const venue = await Venue.findById(gig.venue)
        const email = await venue.contact.email
        const ticketList = await gig.tickets
        if (ticketList == []) {
            ticketList = ['No tickets sold']
        }
        if (email) {
            await mailSend(email, 'Tickets sold with Paypal', ticketList.join("\n"))
       }  res.status(201).send(`List sent to ${email}`)
    } catch (e) {
        res.status(400).send(e)
    }
})


module.exports = router