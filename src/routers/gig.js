const express = require('express')
const mongoose = require('mongoose')
const Gig = require('../models/gig')
const Venue = require('../models/venue')
const User = require('../models/user')
const authUser = require('../middleware/authUser')
const authVendor = require('../middleware/authVendor')
const actionLog = require('../helper/actionLog')
const mailSend = require('../helper/mailSend')
const email = require('../helper/email')
const mailAttachSend = require('../helper/mailAttachSend')
const router = new express.Router()
const validator = require('validator')
const excel = require('excel4node')
const util = require('util')




router.post('/gigs', authUser, async (req, res) => {
    console.log("GET GIGS AUTH HIT!")
    const gig = new Gig(req.body)
    const venue = await Venue.findById(req.body.venue)
    const seats = venue.seats
    if (seats > 0) {
        gig.startSeats = seats
    } else {
        return res.status(400).send({ error: 'No seats available! - Keine freien Plätze mehr!' })
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
    console.log("GET GIGS HIT!")
    try {
        const gigs = await Gig.find({}).populate('venue').exec()
        res.send(gigs)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/gigs_ticketsLeft/:houseNo', async (req, res) => {
    try {
        const houseNo = req.params.houseNo
        const gigs = await Gig.find({ houseNo: houseNo }).exec()
        const amount = { 
                        "amount": gigs[0].cancelled ? 0 : ((gigs[0].startSeats) - (gigs[0].soldSeats)).toString()
                    }
        res.send(JSON.stringify(amount))
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/gigs_cancelled/:houseNo', async (req, res) => {
    try {
        const houseNo = req.params.houseNo
        const gigs = await Gig.find({ houseNo: houseNo }).exec()
        const cancelled = { 
                        "cancelled": gigs[0].cancelled
                    }
        res.send(JSON.stringify(cancelled))
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/gigs_feeEur/:houseNo', async (req, res) => {
    try {
        const houseNo = req.params.houseNo
        const gigs = await Gig.find({ houseNo: houseNo }).exec()
        const feeEur = { "feeEur": gigs[0].feeEur.toString()}
        res.send(JSON.stringify(feeEur))
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/gigs_feePPEur/:houseNo', async (req, res) => {
    try {
        const houseNo = req.params.houseNo
        const gigs = await Gig.find({ houseNo: houseNo }).exec()
        const feePPEur = { "feePPEur": gigs[0].feePPEur.toString()}
        res.send(JSON.stringify(feePPEur))
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

// Purchase by vendor or paypal
router.patch('/gigs_buy/:id', async (req, res) => {
    const _id = req.params.id
    
   try {
        const gig = await Gig.findById(_id)
        const amount = parseInt(req.body.amount)
        if (!gig || (gig.startSeats - gig.soldSeats - amount < 0) || (gig.cancelled)) {
            return res.status(406).send('No or not enough tickets available! - Keine oder zu wenig TIckets erhältlich!')
        }  
        if (!gig) {
            return res.status(404).send()
        }
        
        await gig.generateVendorTicket(req.headers.authorization, amount, process.env.JWT_SECRET + "VENDOR")
        await gig.save()
        if (req.headers.authorization){
            actionLog(`${Math.abs(amount)} Ticket(s) ${amount > 0 ? "sold" : "refunded"} by Vendor`, req.headers.authorization, gig, process.env.JWT_SECRET + "VENDOR")
        } else {
            actionLog(`${req.body.amount} Ticket(s) paypalled by ${req.body.buyer}`, undefined, gig, undefined)
        }
        
        if (gig.Venue && gig.startSeats - gig.soldSeats == 0) {
            const venue = await Venue.findById(gig.venue)
            mailSend(venue.contact.email, 'AUSVERKAUFT!', `Hallo ${venue.contact.name}, die Grosse-Kiesau-Literaturnacht-Veranstaltung "${gig.title}" ist ausverkauft!`)
       }

        res.send(gig)

    } catch (e) {
        res.status(500).send()
    }
})






router.patch('/gigs/:id', authUser, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['houseNo', 'title', 'performer', 'venue', 'feeEur', 'feePPEur', 'startSeats', 'cancelled']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send('Invalid updates! - Ungültige Eingaben')
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
            return res.status(400).send('No seats available! - Keine freien Plätze mehr!')
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

// Purchase by PayPal, check for avoiding multiple sellings with one purchase
router.patch('/gigs_ticket/:id',  async (req, res) => {
    const buyer = req.body.buyer
    const amount = parseInt(req.body.amount)
    const check = req.body.check
    try {
        const gig = await Gig.findById(req.params.id)
        for (var i = 0; i < amount; i++ ){
            await gig.generatePaypalTicket(buyer, check + i.toString())
            res.status(201).send()
        }
        if (validator.isEmail(buyer)) {
            await mailSend(buyer, 'Tickets für Große Kiesau Literaturnacht', `Hallo, Sie haben ${amount} Ticket(s) für Haus Nr. ${gig.houseNo} gekauft. Mehr aktuelle Informationen zu dieser Veranstaltung auf www.grosse-kiesau.de. Bitte vergewissern Sie sich auf www.große-kiesau.de, dass die Veranstaltung planmässig stattfindet.`)
        }  
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/gigs_paypal_list_email/:id',  authUser, async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id)
        console.log('GIG: ', gig)
        const venue = await Venue.findById(gig.venue)
        console.log('VENUE: ', venue)
        const email = await venue.contact.email
        console.log('EMAIL: ', email)
        var ticketList = await gig.paypalTickets
        console.log('TICKET_LIST: ', ticketList)
        if (ticketList.length == 0) {
            ticketList = ["Keine paypal Tickets verkauft!"]
        }
        if (email) {
            await mailSend(email, `Große-Kiesau-Literaturnacht`, `Lieber Gastgeber, die folgende email enthält eine Liste der mit PayPal verkauften Tickets für Ihr Haus. Jeder Eintrag steht für ein Ticket. Der Gast identifiziert sich anhand des im Eintrag buyer: genannten (email-)Namens`)
            console.log('JOINED TICKET LIST: ', ticketList)
            await mailSend(email, `Tickets verkauft mit Paypal für Haus Nr. ${gig.houseNo}, ${venue.address}:`, ticketList.join("\n"))
       }  res.status(201).send(`List sent to / Liste gesendet an ${email}`)
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
            await mailSend(email, `Tickets verkauft mit Paypal für Haus Nr. ${gig.houseNo}, ${venue.address}`, ticketList.join("\n"))
       }  res.status(201).send(`List sent to / Liste gesendet an ${email}`)
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

//  router.post('/gigs_list_email',  authVendor, async (req, res) => {
//     try {
//         buildEmailExcelList(req.user.email, req.user._id, req.user.name)
//        res.status(201).send(`List sent to / Liste gesendet an ${req.user.email}`)
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })

router.post('/gigs_list_email_total',  authUser, async (req, res) => {
    console.log('EXCELLISTE WIRD ANGEFORDERT FÜR: ', req.user.email)
    var users
    try {
        users = await User.find({ "vendor" : true})
        console.log('ALLE VERKAEUFER: ', users)
        users.forEach(user => {
            buildEmailExcelList(req.user.email, `${user.name}`)
        })
        buildEmailExcelList(req.user.email, `PayPal`)
        res.status(201).send(`Lists sent to / Listen gesendet an ${req.user.email}`)
    } catch (e) {
        console.log('FEHLER! ')
        res.status(500).send()
    }
})

router.post('/gigs_list_email_me',  authVendor, async (req, res) => {
    console.log('LISTE WIRD ANGEFORDERT FÜR: ', req.user.email)
    try {
        const vendor = await User.findById(req.user.id)
        if (!vendor) {
            console.log('VENDOR! ')
            return res.status(404).send()
        }
        console.log('EXCELLISTE ERSTELLEN: ', vendor.name)
        buildEmailExcelList(req.user.email, vendor.name)
       res.status(201).send(`List sent to / Liste gesendet an ${req.user.email}`)
    } catch (e) {
        console.log('FEHLER! ')
        res.status(400).send(e)
    }
})

const buildEmailExcelList =  async (email, vendorName)  => {
    console.log('BUILD LIST AND PREPARE To SEND TO:'. email)
    var workbook = new excel.Workbook();
    workbook.writeP = util.promisify(workbook.write)
    var worksheet = workbook.addWorksheet('Tickets sold by / verkauft von ' + vendorName);

    var style = workbook.createStyle({
        font: {
          color: '#000000',
          size: 12
        },
        numberFormat: '€#,##0.00; (€#,##0.00); -'
    });


    worksheet.cell(1,1).string('Haus Nr.')
    worksheet.cell(1,2).string('Lesung')
    worksheet.cell(1,3).string('verkaufte Tickets')
    worksheet.cell(1,4).string('Ticket-Preis')
    worksheet.cell(1,5).string('Gesamt')
    const gigs = await Gig.find({})



    var i = 2
    gigs.forEach(gig => {
        worksheet.cell(i,1).number(gig.houseNo);
        worksheet.cell(i,2).string(gig.title)
        var amount = 0
        if (vendorName == "PayPal") {
            amount = gig.paypalTickets.length
        } else {
            var tickets = gig.vendorTickets
            tickets.forEach(ticket => {
                if (ticket.vendorName == vendorName) {
                     amount += ticket.amount
                 }
            })
        }

        worksheet.cell(i,3).number(amount)
        if (vendorName == "PayPal") {
            worksheet.cell(i,4).number(parseFloat(gig.feePPEur)).style(style);
            worksheet.cell(i,5).number(parseFloat(gig.feePPEur) * amount).style(style);
        } else {
            worksheet.cell(i,4).number(parseFloat(gig.feeEur)).style(style);
            worksheet.cell(i,5).number(parseFloat(gig.feeEur) * amount).style(style);
        }
        i++
    });
    await workbook.writeP(`sellingReport${vendorName}.xlsx`)
    if (email) {
       mailAttachSend(email, `Tickets sold by ${vendorName}`, "LG", `sellingReport${vendorName}.xlsx`)
    }  
}


router.post('/gigs_email',  authUser, async (req, res) => {
    console.log('EMPFAENGER: ', req.body.contact.email)
    try {
        const user = await User.findById(req.user.id)
        if (user) {
            console.log('ABSENDER: ', user.email)
            res.status(200).send('success')
            email(req.body.contact.email, user, "TEST_TEST","sellingReportLangenkamp.xlsx")
        }
    } catch (e) {
        console.log('FEHLER! ')
        res.status(400).send(e)
    }
})


module.exports = router