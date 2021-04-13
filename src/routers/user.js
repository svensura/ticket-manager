const express = require('express')
const User = require('../models/user')
const authUser = require('../middleware/authUser')
const authVendor = require('../middleware/authVendor')
const actionLog = require('../helper/actionLog')
const router = new express.Router()

router.post('/users',  async (req, res) => {
    console.log('POST USER HIT')
    const user = new User(req.body)
    try {

        await user.save()
        console.log(user)
        //actionLog(`${user.vendor?"Vendor":"User"} created`, req.headers.authorization, user, 'thisisasecretformyapp')
        const token = await user.generateAuthToken()
        console.log(token)
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

// router.post('/users', authUser, async (req, res) => {
//     console.log('HIT')
//     const user = new User(req.body)
//     try {

//         await user.save()
//         actionLog(`${user.vendor?"Vendor":"User"} created`, req.headers.authorization, user, 'thisisasecretformyapp')
//         const token = await user.generateAuthToken()
//         res.status(201).send({ user, token })
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })



router.post('/users/login', async (req, res) => {
    console.log('POST LOGIN HIT')
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logoutUser', authUser, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutVendor', authVendor, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', authUser, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// router.get('/users',  async (req, res) => {
//     console.log('GET USERS HIT')
//     try {
//         const users = await User.find({})
//         res.send(users)
//     } catch (e) {
//         res.status(500).send()
  
  
//     }
// })

router.get('/users', authUser, async (req, res) => {
    console.log('GET USERS AUTH HIT')
    try {
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send()
  
  
    }
})

router.get('/users/me', authVendor, async (req, res) => {
    res.send(req.user)
})

// router.patch('/users/me', auth, async (req, res) => {
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['name', 'email', 'password', 'phone']
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

//     if (!isValidOperation) {
//         return res.status(400).send({ error: 'Invalid updates!' })
//     }

//     try {
//         updates.forEach((update) => req.user[update] = req.body[update])
//         await req.user.save()
//         actionLog('User edited', req.headers.authorization, user)
//         res.send(req.user)
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })

// router.delete('/users/me', auth, async (req, res) => {
//     try {
//         await req.user.remove()
//         actionLog('User deleted', req.headers.authorization, user)
//         res.send(req.user)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findById(_id)

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/users/:id', authUser, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'phone',]
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates! - Ungültige Eingaben' })
    }

    try {
        const user = await User.findById(req.params.id)

        updates.forEach((update) => user[update] = req.body[update])
        actionLog('User edited', req.headers.authorization, user, process.env.JWT_SECRET)
        await user.save()

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/:id', authUser, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)

        actionLog('All users deleted', req.headers.authorization, user, process.env.JWT_SECRET)

        if (!user || authUser == user )
        {
            res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router