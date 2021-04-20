const express = require('express')
const Student = require('../models/student')
const authUser = require('../middleware/authUser')
const actionLog = require('../helper/actionLog')
const router = new express.Router()


router.post('/students', authUser, async (req, res) => {
    const student = new Student(req.body)
    console.log('STUDENTpre: ',student)
    console.log('NEGATIVE TESTED: ',student.negativeTested)
    try {
        await student.save()
        console.log('STUDENT: ',student)
        res.status(201).send({student})
    } catch (e) {
        res.status(400).send(e)
    
    }
})

router.get('/students', authUser, async (req, res) => {
    try {
        const students = await Student.find({})
        res.send(students)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/students/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const student = await Student.findById(_id)

        if (!student) {
            return res.status(404).send()
        }

        res.send(student)
    } catch (e) {
        res.status(500).send()
    }
})



router.patch('/students/:id', authUser, async (req, res) => {
    const updates = Object.keys(req.body)
    console.log('UPDATES: ',updates)
    const allowedUpdates = ['prename', 'surname', 'class', 'negativeTested']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        
        return res.status(400).send({ error: 'Invalid updates! - Ungültige Eingaben' })
    }

    try {
        const student = await Student.findById(req.params.id)

        updates.forEach((update) => student[update] = req.body[update])
        actionLog('Student edited', req.headers.authorization, student, process.env.JWT_SECRET)
        await student.save()

        if (!student) {
            return res.status(404).send()
        }

        res.send(student)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/students/:id', authUser, async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id)
        actionLog('student deleted', req.headers.authorization, student, process.env.JWT_SECRET)
        if (!student) {
            res.status(404).send()
        }

        res.send(student)
    } catch (e) {
        res.status(500).send()
    }
})



module.exports = router