const express = require('express')
const Venue = require('../models/venue')
const router = new express.Router()

router.post('/venues', async (req, res) => {
    const task = new Venue(req.body)

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/venues', async (req, res) => {
    try {
        const venues = await Venue.find({})
        res.send(venues)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/venues/:id', async (req, res) => {
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

router.patch('/venues/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['address', 'contact', 'seats']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const venue = await Venue.findById(req.params.id)

        updates.forEach((update) => venue[update] = req.body[update])
        await venue.save()

        if (!venue) {
            return res.status(404).send()
        }

        res.send(venue)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/venues/:id', async (req, res) => {
    try {
        const venue = await Venue.findByIdAndDelete(req.params.id)

        if (!venue) {
            res.status(404).send()
        }

        res.send(venue)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router