
const mailgun = require("mailgun-js");


const apiKey = process.env.MAILGUN_API_KEY;
const DOMAIN = 'https://api.eu.mailgun.net/v3/mg.germanscreens.de';

const emailSend = ()  => {

    console.log('EMAIL ROUTE TOUCHED')



    
    
    const mg = mailgun({apiKey: apiKey, domain: DOMAIN});
    const data = {
        from: 'Excited User <me@samples.mailgun.org>',
        to: 'svensura@germanscreens.de',
        subject: 'Hello',
        text: 'Testing some Mailgun awesomness!'
    };
    mg.messages().send(data, function (error, body) {
        console.log(body);
    });

}

module.exports = emailSend