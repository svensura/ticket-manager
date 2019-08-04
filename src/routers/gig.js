const express = require('express')
const mongoose = require('mongoose')
const Gig = require('../models/gig')
const Venue = require('../models/venue')
const auth = require('../middleware/auth')
const actionLog = require('../helper/actionLog')
const mailSend = require('../helper/mailSend')
const router = new express.Router()

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

router.get('/gigs', auth, async (req, res) => {
    try {
        const gigs = await Gig.find({}).populate('venue').exec()
        res.send(gigs)
    } catch (e) {
        res.status(500).send()
    }
})



router.get('/gigs/:id', auth, async (req, res) => {
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

router.patch('/gigs_buy/:id', auth, async (req, res) => {
    const _id = req.params.id
   try {
        const gig = await Gig.findById(_id)

        if (!gig || (gig.startSeats - gig.soldSeats - parseInt(req.body.amount) < 0)) {
            return res.status(406).send({ error: 'No or not enough tickets available' })
        }
        console.log('GIG: ',gig)
        const venue = await Venue.findById(gig.venue)
        console.log('VENUE: ',venue)
        gig['soldSeats'] += parseInt(req.body.amount)
        await gig.save()
        actionLog(`${req.body.amount} Tickets bought/refunded`, req.headers.authorization, gig)
        if (!gig) {
            return res.status(404).send()
        }
        if (gig.startSeats - gig.soldSeats == 0) {
            mailSend(venue.contact.email, 'Fully Booked', `Hi ${venue.contact.name}, the Grosse-Kiesau-Literaturnacht-gig "${gig.title}" is fully booked!`)
       }

        res.send(gig)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/gigs/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['houseNo', 'title', 'performer', 'venue', 'startSeats']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
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
            return res.status(400).send({ error: 'No seats available!' })
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

module.exports = router