const express = require('express')
const Gig = require('../models/gig')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/gigs', auth, async (req, res) => {
    const gig = new Gig(req.body)
    try {
        await gig.save()
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

// router.get('/gigs', auth, async (req, res) => {
//     console.log('getGigs')
//     try {
//         const collectGigData = async () => {
//             const gigs = await Gig.find({})

//             const popGigs = async (gigs) => { 
//                 await gigs.forEach( async (gig) => {
//                     console.log('ID', gig.venue)  
//                     await gig.populate('venue').execPopulate()
//                     console.log('Venue and Address', gig)
//             })
//             popGigs(gigs).then((result => {
//                 return result
//             }))
// 8       }
//     } catch (e) {
//         res.status(500).send()
//     }
// })

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

router.patch('/gigs/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['houseNo', 'title', 'performer', 'venue', 'startSeats']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const gig = await Gig.findById(req.params.id)

        updates.forEach((update) => gig[update] = req.body[update])
        await gig.save()

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

        if (!gig) {
            res.status(404).send()
        }

        res.send(gig)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router