//const sgMail = require('@sendgrid/mail')

const apiKey = process.env.SENDGRID_API_KEY;

const mailSend = (email, subject, message)  => {

    // console.log('MAIL_SEND ROUTE TOUCHED, KEY: ', apiKey)



    // sgMail.setApiKey(apiKey)
    // const msg = {
    //     to: email,
    //     from: 'kiesau.test@gmx.de',
    //     subject: subject,
    //     text: message
    // }
    // sgMail
    //     .send(msg)
    //     .then(() => {
    //         console.log('Email sent')
    //     })
    //     .catch((error) => {
    //         console.error(error)
    //     })

}


module.exports = mailSend
