const sgMail = require('@sendgrid/mail')

const sendgridAPIKey = process.env.SENDGRID_API_KEY
sgMail.setApiKey(sendgridAPIKey)

const fs = require("fs");



const mailSend = (email, subject, message) => {
pathToAttachment = `${__dirname}/../../sellingReport.xlsx`;
attachment = fs.readFileSync(pathToAttachment).toString("base64");
console.log('SEND TO ', email, subject, message)
sgMail.send({
    to: email,
    from: process.env.EMAIL_SENDER,
    subject: subject,
    //text: message + "\n\n" + "This message was automatically created by the ticket-system.",
    text: message + "\n\n" + "Diese Meldung wurde vom Ticket-System automatisch erzeugt.",
    attachments: [
        {
        content: attachment,
        filename: "sellingReport.xlsx",
        type: "application/xlsx",
        disposition: "attachment"
        }
    ]
    })
}


module.exports = mailSend
