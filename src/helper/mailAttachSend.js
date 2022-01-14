//const sgMail = require('@sendgrid/mail')
const fs = require("fs");
const path = require('path')

const apiKey = process.env.SENDGRID_API_KEY;




const mailAttachSend = (email, subject, message, attachmentFile) => {

//   console.log('EMAIL_ATTACH_SEND ROUTE TOUCHED KEY: ', apiKey)


//     sgMail.setApiKey(apiKey)

    
//     pathToAttachment = path.join(__dirname, '..', '..', attachmentFile)

//     console.log('ATTACHMENT FILENAME: ', pathToAttachment)



//     fs.readFile((pathToAttachment), (err, data) => {
//         if (err) {
//           console.log('FILE NOT FOUND ', pathToAttachment)
//         }
//         if (data) {
//           const msg = {
//             to: email,
//             from: 'kiesau.test@gmx.de',
//             subject: 'Gesamtübersicht Ticketverkauf',
//             attachments: [
//               {
//                 content: data.toString('base64'),
//                 filename: `${attachmentFile}`,
//                 type: 'application/xlsx',
//                 disposition: 'attachment',
//               },
//             ],
//           };
//           sgMail
//         .send(msg)
//         .then(() => {
//             console.log('Email sent')
//         })
//         .catch((error) => {
//             console.error(error)
//         })
//         }
//       });

    

 }


// {
// pathToAttachment = `${__dirname}/../../${attachmentFile}`;
// attachment = fs.readFileSync(pathToAttachment).toString("base64");
// console.log('EMAIL SEND TO ', email, subject, message)
// sgMail
//     .send({
//         to: email,
//         from: 'kiesau.test@gmx.de',
//         subject: subject,
//         //text: message + "\n\n" + "This message was automatically created by the ticket-system.",
//         text: message + "\n\n" + "Diese Meldung wurde vom Ticket-System automatisch erzeugt.",
//         attachments: [
//             {
//             content: attachment,
//             filename: `${attachmentFile}`,
//             type: "application/xlsx",
//             disposition: "attachment"
//             }
//         ]
//     })
//     .then(() => {
//         console.log('EMAIL SENT !')
//       })
//     .catch((error) => {
//         console.error('MAILERROR: ', error)
//     })
// }


module.exports = mailAttachSend
