const { transporter } = require("../../configs/transporter");
const {
  EMAIL_VERIFICATION_TOKEN_AGE,
  EMAIL_PASSWORD_RESET_TOKEN_AGE,
} = require("../../constants");
const { generateToken } = require("../jwt/jwtUtil");
const PasswordResetToken = require("../../models/PasswordResetToken.model");
const { logger, securityLogger } = require("../../configs/logger"); 
const fs = require("fs");
const path = require("path");
const util = require("util");
const moment = require("moment-timezone");
const jwt = require("jsonwebtoken");

const { setInterval } = require("timers");
const crypto = require("crypto");
const VisitTrackToken = require("../../models/VisitTrackToken.model");


async function IndVisitDetailsMail(visitorDetails, base64Data) {
  try {
    
    // 1️⃣ Generate random token
    const crypto = require("crypto");
    const trackToken = crypto.randomBytes(32).toString("hex");

    // 2️⃣ Store token in DB against PNR
    await VisitTrackToken.create({
      pnr: visitorDetails.pnr,
      token: trackToken,
    });

    
    // 3️⃣ Create URLs
    const trackUrl = `${process.env.FRONTEND_URI}/trackVisit/${visitorDetails.pnr}`;
    const cancelUrl = `${process.env.FRONTEND_URI}/cancelByVisitor/${visitorDetails.pnr}`;

  // 3️⃣ Create clean URL WITHOUT token
  const trackLink =
  `<a href="${process.env.FRONTEND_URI}/trackVisit/${visitorDetails.pnr}"
  style="text-decoration:none; color: white;font-size: 1em;">Track visit</a>`;

// 4️⃣ Remove cancellation token also
const cancelLink =
  `<a href="${process.env.FRONTEND_URI}/cancelByVisitor/${visitorDetails.pnr}"
  style="text-decoration:none; color: white;font-size: 1em;">Cancel visit</a>`;
    // START pdf file attachemetnt code

    const pdfBuffer = Buffer.from(base64Data, "base64");



    // END pdf file attachemetnt code

    const visitorMailOptions = {
      from: '"BCTFS" <fspbct@gmail.com>',
      to: `${visitorDetails.email}`,
      subject: "Your Visit Request is Approved",
      html: `<!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f2f2f2;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 800px; /* Increased width */
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 15px; /* Rounded corners */
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Slightly elevated */
            position: relative;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header img {
            display: block;
            margin: 0 auto;
          }
          h1 {
            color: #333;
            text-align: left;
            margin-top: 0;
          }
          ul {
            list-style-type: none;
            padding: 15px; /* Increased padding */
            background-color: whitesmoke; /* White smoke color */
            border-radius: 10px; /* Rounded corners */
            border: 2px solid #ccc; /* Border */
          }
          li {
            margin-bottom: 10px;
          }
          button {
            background-color: #FA2250;
            border: none;
            color: white;
            padding: 10px 25px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
            cursor: pointer;
            border-radius: 10px;
            transition-duration: 0.2s;
          }
          button:hover {
            background-color: #E91E63;
          }

          .approve-button {
            background-color: #28B463;
            border: none;
            color: white;
            padding: 10px 25px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
            cursor: pointer;
            border-radius: 10px;
            transition-duration: 0.2s;
          }
          .approve-button:hover{
          background-color: #239B56;
          }
        </style>
      </head>
      <body>
      
      <div class="container">
        <h1>Dear ${visitorDetails.firstName},</h1>
        <div>
          <p>Your visit request is approved. Below are the details of your visit:</p>
          <ul>
          <li><strong>PNR :</strong>  ${visitorDetails.pnr}</li>
            <li><strong>Visitor Name:</strong> ${visitorDetails.firstName} ${
        visitorDetails.lastName
      }</li>
            <li><strong>Purpose of Visit:</strong>  ${
              visitorDetails.purpose
            }</li>
           <li><strong>Date and Time of Meeting Starts:</strong> ${new Date(visitorDetails.date).toLocaleString(
            undefined,
            {
              month: "numeric",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true, timeZone : 'UTC',
            }
          )}</li>
              <li><strong>Date and Time of Meeting Ends:</strong> ${new Date(visitorDetails.date1).toLocaleString(
                undefined,
                {
                  month: "numeric",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true, timeZone : 'UTC',
                }
              )}</li>

            <li><strong>Host Name:</strong> ${visitorDetails.hostname}</li>
            <li><strong>Host Email:</strong> ${visitorDetails.hostemail}</li>
          </ul>
        
          <button class="approve-button">${trackLink}</button>

          <p style="margin-top: 20px;">If the buttons don't work, use these links:</p>
          <p><strong>Track Visit:</strong> <a href="${trackUrl}" style="color: #28B463;">${trackUrl}</a></p>
         


          <p>Thank you for your cooperation.</p>
          <p>Best regards,</p>
          <p>C-DAC, Hyderabad</p>
        </div>
      </div>
      
      </body>
      </html>
      
        `,

      attachments: [
        {
          filename: "Individual_Pass.pdf",
          content: pdfBuffer, // Attach the PDF content
          // encoding: "base64", // Encoding of the attachment
        },
      ],
    };

    const info = await transporter.sendMail(visitorMailOptions);
    console.log("Mail Info ", info);
    return info;
  } catch (error) {
    console.log(error);
    return;
  }
}

module.exports = {
  IndVisitDetailsMail,
};
