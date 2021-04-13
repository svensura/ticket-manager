const sgMail = require('@sendgrid/mail')

const sendgridAPIKey = process.env.SENDGRID_API_KEY
sgMail.setApiKey(sendgridAPIKey)

const mailSend = (email, subject, message) => {
    console.log(sendgridAPIKey)
    console.log('SEND', email, subject, message)
    sgMail.send({
        to: email,
        from: 'kiesau.test@gmx.de',
        subject: subject,
        //text: message + "\n\n" + "This message was automatically created by the ticket-system.",
        text: message + "\n\n" + "Diese Meldung wurde vom Ticket-System automatisch erzeugt." 
    })
}


module.exports = mailSend
