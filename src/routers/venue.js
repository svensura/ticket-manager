const express = require('express')
const Venue = require('../models/venue')
const auth = require('../middleware/auth')
const actionLog = require('../helper/actionLog')
const geocode = require('../helper/geocode');
const router = new express.Router()


router.post('/venues', auth, async (req, res) => {
    const venue = new Venue(req.body)
    
    await geocode.geocodeAddress(venue.address, async (errorMessage, results) => {
        if (errorMessage){
            console.log(errorMessage);
        } else {
            venue.coords.length = 0
            venue.coords.push(results.latitude)
            venue.coords.push(results.longitude)
            try {
                venue.save()
                console.log(venue)
                actionLog('Venue created', req.headers.authorization, venue)
                res.status(201).send(venue)
            } catch (e) {
                res.status(400).send(e)
            }

            // weather.getWeather(results.latitude, results.latitude,(errorMessage, weatherResults) => {
            //     if (errorMessage){
            //         console.log(errorMessage);
            //     } else {
            //         console.log(`Current temperature is ${undefined, weatherResults.temperature} and feels like ${undefined, weatherResults.apparentTemperature}.`);
            //     }
            // })
        }
    })

    
})

router.get('/venues', auth, async (req, res) => {
    try {
        const venues = await Venue.find({})
        res.send(venues)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/venues/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const venue = await Venue.findById(_id)

        if (!venue) {
            return res.status(404).send()
        }

        res.send(venue)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/venues/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['address', 'contact', 'seats', 'active']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const venue = await Venue.findById(req.params.id)

        updates.forEach((update) => venue[update] = req.body[update])
        
        await geocode.geocodeAddress(venue.address, async (errorMessage, results) => {
            if (errorMessage){
                console.log(errorMessage);
            } else {
                venue.update({$set: {coords: [results.latitude, results.longitude]}})
                // venue.coords.push(results.latitude)
                // venue.coords.push(results.longitude)
                // venue.coords.push('456')
                // venue.coords.push('789')
                
                venue.save()
                console.log(venue)
                actionLog('Venue edited', req.headers.authorization, venue)
                res.status(201).send(venue)
            }
        }) 
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/venues/:id', auth, async (req, res) => {
    try {
        const venue = await Venue.findByIdAndDelete(req.params.id)
        actionLog('Venue deleted', req.headers.authorization, venue)
        if (!venue) {
            res.status(404).send()
        }

        res.send(venue)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/venues_geo/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const venue = await Venue.findById(_id)

        if (!venue) {
            return res.status(404).send()
        }
        if (venue.address){
            const address = await venue.address
            const city = 'Luebeck, Germany'
            const coord = geocodeAddress(address + ',' + city)
            console.log(coord)
        } else {
            res.send(null)
        }   
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router