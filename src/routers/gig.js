const express = require('express')
const mongoose = require('mongoose')
const Gig = require('../models/gig')
const Venue = require('../models/venue')
const authUser = require('../middleware/authUser')
const authVendor = require('../middleware/authVendor')
const actionLog = require('../helper/actionLog')
const mailSend = require('../helper/mailSend')
const mailAttachSend = require('../helper/mailAttachSend')
const router = new express.Router()
const validator = require('validator')
const excel = require('excel4node')
const util = require('util')





router.post('/gigs', authUser, async (req, res) => {
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
        actionLog('Gig created', req.headers.authorization, gig, process.env.JWT_SECRET)
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

// Purchase by vendor
router.patch('/gigs_buy/:id', authVendor, async (req, res) => {
    const _id = req.params.id

   try {
        const gig = await Gig.findById(_id)
        const amount = parseInt(req.body.amount)
        if (!gig || (gig.startSeats - gig.soldSeats - amount < 0)) {
            return res.status(406).send('No or not enough tickets available')
        }  
        if (!gig) {
            return res.status(404).send()
        }
        
        gig['soldSeats'] += amount
        await gig.generateVendorTicket(req.headers.authorization, amount, process.env.JWT_SECRET + "VENDOR")
        await gig.save()
        if (req.headers.authorization){
            actionLog(`${Math.abs(amount)} Ticket(s) ${amount > 0 ? "sold" : "refunded"} by Vendor`, req.headers.authorization, gig, process.env.JWT_SECRET + "VENDOR")
        } else {
            actionLog(`${req.body.amount} Ticket(s) paypalled by ${req.body.buyer}`, undefined, gig, undefined)
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






router.patch('/gigs/:id', authUser, async (req, res) => {
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
        actionLog('Gig edited', req.headers.authorization, gig, process.env.JWT_SECRET)

        if (!gig) {
            return res.status(404).send()
        }

        res.send(gig)
    } catch (e) {
        res.status(400).send(e)
    }
    
})

router.delete('/gigs/:id', authUser, async (req, res) => {
    try {
        const gig = await Gig.findByIdAndDelete(req.params.id)
        actionLog('Gig deleted', req.headers.authorization, gig, process.env.JWT_SECRET)
        if (!gig) {
            return res.status(404).send()
        }

        res.send(gig)
    } catch (e) {
        res.status(500).send()
    }
})

// Purchase by PayPal
router.patch('/gigs_ticket/:id',  async (req, res) => {
    const buyer = req.body.buyer
    const amount = parseInt(req.body.amount)
    try {
        const gig = await Gig.findById(req.params.id)
        for (var i = 0; i < amount; i++ ){
            await gig.generatePaypalTicket(buyer)
            res.status(201).send()
        }
        if (validator.isEmail(buyer)) {
            await mailSend(buyer, 'Tickets for Große Kiesau Literaturnacht', `Hi, you have purchased ${amount} ticket(s) for House No. ${gig.houseNo}. More information at www.grosse-kiesau.de.`)
        }  
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/gigs_paypal_list_email/:id',  authUser, async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id)
        const venue = await Venue.findById(gig.venue)
        const email = await venue.contact.email
        const ticketList = await gig.paypalTickets
        if (ticketList == []) {
            ticketList = ['No tickets sold']
        }
        if (email) {
            await mailSend(email, `Tickets sold with Paypal for House No. ${gig.houseNo}, ${venue.address}`, ticketList.join("\n"))
       }  res.status(201).send(`List sent to ${email}`)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/dashboard_paypal_list_email/:id',  authUser, async (req, res) => {
   try {
        const gig = await Gig.findById(req.params.id)
        const venue = await Venue.findById(gig.venue)
        const email = await req.user.email
        const ticketList = await gig.paypalTickets
        if (ticketList == []) {
            ticketList = ['No tickets sold']
        }
        if (email) {
            await mailSend(email, `Tickets sold with Paypal for House No. ${gig.houseNo}, ${venue.address}`, ticketList.join("\n"))
       }  res.status(201).send(`List sent to ${email}`)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/gigs_paypal_list_dashboard/:id', authUser, async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id)
 
        if (!gig) {
            return res.status(404).send()
        }
        res.send(gig.paypalTickets)
     } catch (e) {
        res.status(500).send()
     }
 })

 router.post('/gigs_list_email',  authVendor, async (req, res) => {
    try {
        const email = await req.user.email
        const VendorId = await req.user._id
        const gigs = await Gig.find({})
        var workbook = new excel.Workbook();
        workbook.writeP = util.promisify(workbook.write)
        var worksheet = workbook.addWorksheet('Tickets sold by ', req.user.name);

        var style = workbook.createStyle({
            font: {
              color: '#000000',
              size: 12
            },
            numberFormat: '€#,##0.00; (€#,##0.00); -'
          });


        worksheet.cell(1,1).string('House No.')
        worksheet.cell(1,2).string('Gig')
        worksheet.cell(1,3).string('Sold tickets')
        worksheet.cell(1,4).string('Ticket fee')
        worksheet.cell(1,5).string('Total')
        
        var i = 2
        gigs.forEach(gig => {
            worksheet.cell(i,1).number(gig.houseNo);
            worksheet.cell(i,2).string(gig.title)
            var amount = 0
            gig.vendorTickets.forEach(vendorTicket => {
               if (vendorTicket.vendor._id = VendorId) {
                    amount += vendorTicket.amount
                }
            })
            worksheet.cell(i,3).number(amount)
            worksheet.cell(i,4).number(parseFloat(gig.feeEur)).style(style);
            worksheet.cell(i,5).number(parseFloat(gig.feeEur) * amount).style(style);
            i++
        });
        await workbook.writeP('sellingReport.xlsx')
        if (email) {
           mailAttachSend(email, `Tickets sold by ${req.user.name}`,"")
        }  
        res.status(201).send(`List sent to ${email}`)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router