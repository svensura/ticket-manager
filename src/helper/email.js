
const sgMail = require('@sendgrid/mail')


const apiKey = process.env.SENDGRID_API_KEY;

const emailSend = (email, subject, message)  => {

    console.log('EMAIL ROUTE TOUCHED')



    sgMail.setApiKey(apiKey)
    const msg = {
        to: email,
        from: 'kiesau.test@gmx.de',
        subject: subject,
        text: message
    }
    sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(errors)
                errors.forEach(error => {
                console.log(error)
            })
        })

}

module.exports = emailSend