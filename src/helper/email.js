
require("dotenv").config();
// Nodemailer
const nodemailer = require("nodemailer");

const path = require('path')
// FS
const fs = require("fs");

// Googleapis
const { google } = require("googleapis");
// Pull out OAuth from googleapis
const OAuth2 = google.auth.OAuth2;

// const createTransporter = async () => {
//     //Connect to the oauth playground
//     console.log('CLIENT_ID: ', process.env.OAUTH_CLIENT_ID)  
//     const oauth2Client = new OAuth2(
//       process.env.OAUTH_CLIENT_ID,
//       process.env.OAUTH_CLIENT_SECRET,
//       "https://developers.google.com/oauthplayground"
//     );
//     console.log('CLIENT: ', oauth2Client)  
//     // Add the refresh token to the Oauth2 connection
//     oauth2Client.setCredentials({
//       refresh_token: process.env.OAUTH_REFRESH_TOKEN,
//     });
  
//     const accessToken = await new Promise((resolve, reject) => {
//       oauth2Client.getAccessToken((err, token) => {
//         if (err) {
//           reject("Failed to create access token : error message(" + err);
//         }
//         resolve(token);
//       });
//     });
  
//     // Authenticating and creating a method to send a mail
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         type: "OAuth2",
//         user: process.env.SENDER_EMAIL,
//         accessToken,
//         clientId: process.env.OAUTH_CLIENT_ID,
//         clientSecret: process.env.OAUTH_CLIENT_SECRET,
//         refreshToken: process.env.OAUTH_REFRESH_TOKEN,
//       },
//     });

    
  
//     return transporter;
//   };


const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_EMAIL_PASS
  },
});

const emailSend = async (email, subject, message, attachmentFile)  => {

    console.log('EMAIL ROUTE TOUCHED')  

    attachmentPath = path.join(__dirname, '..', '..', attachmentFile)

    // Mail options
    fs.readFile((attachmentPath) , async (err, data) => {
        if (err) {
            console.log('FILE NOT FOUND ', pathToAttachment)
        }
        if (data) {
            let mailOptions = {
                from: process.env.SENDER_EMAIL,
                to: email,
                subject: subject,
                text: message,
                attachments: [
                    {
                    content: data.toString('base64'),
                    filename: `${attachmentFile}`,
                    type: 'application/xlsx',
                    disposition: 'attachment',
                    },
                ],
            };
            try {
                // Get response from the createTransport
                //let emailTransporter = await createTransporter();
        
                // Send email
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        // failed block
                        console.log(error);
                    } else {
                       // Success block
                        console.log("Email sent: " + info.response);
                    }
                });
            } catch (error) {
                return console.log(error);
            }
        }
    })       

}

module.exports = emailSend