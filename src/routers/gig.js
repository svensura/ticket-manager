const express = require('express')
const mongoose = require('mongoose')
const Gig = require('../models/gig')
const Venue = require('../models/venue')
const auth = require('../middleware/auth')
const actionLog = require('../helper/actionLog')
const mailSend = require('../helper/mailSend')
const paypal = require('paypal-rest-sdk');
const router = new express.Router()


// configure paypal with the credentials you got when you created your paypal app
paypal.configure({
    'mode': 'sandbox', //sandbox or live 
    'client_id': 'AblAraG-7OvD-xecbqFX6JzsOyIRoX0jll-96KDZe0inobJvb3IfPEzYjTpm_GB-IHOT_YrvsPVWjS_p', // please provide your client id here 
    'client_secret': 'EBLpSeURLONVjzATT_xTG59fJuZ94CHDyJvaE8fz5MLq6YtGWpfiVfJgf2jCAQ2BVASk4Z_IX6sLI2AE' // provide your client secret here 
  });

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
        console.log('number of seats decreased by: ', req.body.amount)
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
    } catch (e) {
        res.status(400).send()
    }
})


module.exports = router