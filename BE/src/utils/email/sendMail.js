const { transporter } = require("../../configs/transporter");
const {
  EMAIL_VERIFICATION_TOKEN_AGE,
  EMAIL_PASSWORD_RESET_TOKEN_AGE,
} = require("../../constants");
const { generateToken } = require("../jwt/jwtUtil");
const ResetToken = require("../../models/ResetToken.model");
const { logger, securityLogger } = require("../../configs/logger"); 
const fs = require("fs");
const path = require("path");
const util = require("util");
const moment = require("moment-timezone");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const jwtSecret = "secret"; // Replace with a secure secret key

async function sendVerificationEmail(user) {
  try {

    // 1. Generate resetId (Random UUID)
    const resetId = crypto.randomUUID();

    // 2. Generate JWT (real secure token stored in DB only)
    const token = jwt.sign(
      { userId: user.id },
      process.env.SECRET_KEY,
      { expiresIn: "30m" }
    );

    await ResetToken.create({
      resetId,
      userId: user.id,
      jwtToken: token,
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
    });
    const Link= `${process.env.FRONTEND_URI}/Verify?id=${resetId}`;

    const link =
      "<a href=" +
      `${process.env.FRONTEND_URI}/Verify?id=${resetId}` +
      ">Verify</a>";

    const mailOptions = {
      from: '"BCTFS" <fspbct@gmail.com>', // sender address
      to: `${user.email}`, // list of receivers
      subject: "Verify and Activate Your Account", // Subject line
      html: `Dear ${user.email},
              <p>Greetings from C-DAC !!!</p>
              <p>In order to get started. please verify your account by clicking on the link below:</p>
              <p>${link}</p>
              <br/>
                <p style="margin-top: 20px;">If the buttons don't work, use this link:</p>
          <p><strong>Verify:</strong> <a href="${Link}" style="color: #28B463;">${Link}</a></p>
              <p>----------------------</p>
              <p>C-DAC, Hyderabad</p>
              <br/>
              <br/>
          `,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Error sending verification email:", error.message);
    logger.error("Error sending password verification mail:",error);
    return;
  }
}

// Helper: mask username/email
function maskString(str) {
  if (!str) return "";
  const [name, domain] = str.split("@");
  const maskedName = name[0] + "*".repeat(Math.max(name.length - 1, 0));
  return `${maskedName}@${domain}`;
}


// async function sendPasswordVerificationMail(user) {
//   try {
//     // 1. Generate resetId (Random UUID)
//     const resetId = crypto.randomUUID();

//     // 2. Generate JWT (real secure token stored in DB only)
//     const token = jwt.sign(
//       { userId: user.id },
//       process.env.SECRET_KEY,
//       { expiresIn: "30m" }
//     );

//     await ResetToken.create({
//       resetId,
//       userId: user.id,
//       jwtToken: token,
//       expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
//     });

//     const link = `<a href="${process.env.FRONTEND_URI}/users/password/reset?resetId=${resetId}">Reset Password</a>`;

//           // Mask the username for the email
//     const maskedName = maskString(user.email); 
    
//     const mailOptions = {
//       from: '"BCTFS" <fspbct@gmail.com>', // sender address
//       to: `${user.email}`, // list of receivers
//       subject: "Reset Your Account Password", // Subject line
//       html: `Dear ${user.email},
//               <p>Greetings from C-DAC !!!</p>
//               <p>Your username is <strong>${maskedName}</strong>.</p>
//               <p>In order to reset your password. please click on the link below:</p>
//               <p>${link}</p>
//               <br/>
//               <p>----------------------</p>
//               <p>C-DAC, Hyderabad</p>
//               <br/>
//               <br/>
//           `,
//     };

//     const info = await transporter.sendMail(mailOptions);
//     return info;
//   } catch (error) {
//     logger.error("Error sending password verification mail:",error);
//     return;
//   }
// }

// Read the PDF file

// const pdfAttachment = fs.readFileSync(path.join(__dirname, './Form 10BA _ Section 80GG_FY 2023-24.pdf'));


// async function sendPasswordVerificationMail(user) {
//   try {
//     // 1. Generate resetId (Random UUID)
//     const resetId = crypto.randomUUID();

//     // 2. Generate JWT (real secure token stored in DB only)
//     const token = jwt.sign(
//       { userId: user.id },
//       process.env.SECRET_KEY,
//       { expiresIn: "30m" }
//     );

//     await ResetToken.create({
//       resetId,
//       userId: user.id,
//       jwtToken: token,
//       expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
//     });

//     // Generate the reset URL
//     const resetUrl = `${process.env.FRONTEND_URI}/users/password/reset?resetId=${resetId}`;

//     // Mask the username for the email
//     const maskedName = maskString(user.email); 
    
//     const mailOptions = {
//       from: '"BCTFS" <fspbct@gmail.com>',
//       to: `${user.email}`,
//       subject: "Reset Your Account Password",
//       html: `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <meta charset="UTF-8">
//         </head>
//         <body>
//           <p>Dear ${user.email},</p>
//           <p>Greetings from C-DAC !!!</p>
//           <p>Your username is <strong>${maskedName}</strong>.</p>
//           <p>In order to reset your password, please click on the link below:</p>
//           <p>
//             <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">Reset Password</a>
//           </p>
//           <p>Or copy and paste this link into your browser:</p>
//           <p><a href="${resetUrl}">${resetUrl}</a></p>
//           <p>This link will expire in 30 minutes.</p>
//           <br/>
//           <p>----------------------</p>
//           <p>C-DAC, Hyderabad</p>
//           <br/>
//         </body>
//         </html>
//       `,
//       // Add plain text version as fallback
//       text: `Dear ${user.email},

// Greetings from C-DAC !!!

// Your username is ${maskedName}.

// In order to reset your password, please copy and paste this link into your browser:

// ${resetUrl}

// This link will expire in 30 minutes.

// ----------------------
// C-DAC, Hyderabad
//       `
//     };

//     const info = await transporter.sendMail(mailOptions);
//     return info;
//   } catch (error) {
//     logger.error("Error sending password verification mail:", error);
//     return;
//   }
// }

async function sendPasswordVerificationMail(user) {
  try {
    // 1. Generate resetId (Random UUID)
    const resetId = crypto.randomUUID();

    // 2. Generate JWT (real secure token stored in DB only)
    const token = jwt.sign(
      { userId: user.id },
      process.env.SECRET_KEY,
      { expiresIn: "30m" }
    );

    await ResetToken.create({
      resetId,
      userId: user.id,
      jwtToken: token,
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
    });

    // Generate the reset URL
    const resetUrl = `${process.env.FRONTEND_URI}/users/password/reset?resetId=${resetId}`;
    
    // Log for debugging
    console.log('Reset URL generated:', resetUrl);

    // Mask the username for the email
    const maskedName = maskString(user.email); 
    
    const mailOptions = {
      from: '"BCTFS" <fspbct@gmail.com>',
      to: user.email,
      subject: "Reset Your Account Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <p>Dear ${user.email},</p>
          <p>Greetings from C-DAC !!!</p>
          <p>Your username is <strong>${maskedName}</strong>.</p>
          <p>In order to reset your password, please click on the button below:</p>
          
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #007bff;">
            <a href="${resetUrl}" style="color: #007bff;">${resetUrl}</a>
          </p>
          
          <p><strong>This link will expire in 30 minutes.</strong></p>
          
          <br/>
          <p>----------------------</p>
          <p>C-DAC, Hyderabad</p>
        </div>
      `,
      text: `Dear ${user.email},

Greetings from C-DAC !!!

Your username is ${maskedName}.

To reset your password, copy and paste this link into your browser:

${resetUrl}

This link will expire in 30 minutes.

----------------------
C-DAC, Hyderabad`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Accepted:", info.accepted);
    console.log("Rejected:", info.rejected);
    console.log("Response:", info.response);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    logger.error("Error sending password verification mail:", error);
    throw error; // Re-throw instead of returning undefined
  }
}


async function sendApproveByHostMail(user) {
  try {
    console.log("User::", user);

    const pnr = 2;
    // Generate the JWT token outside the loop
    // const feedbackToken = jwt.sign({ pnr: pnr, feedbackProvided: true }, jwtSecret, { expiresIn: '1d' }); // Token expires in 1 day
    const token = jwt.sign({ pnr: pnr, user }, jwtSecret, {
      expiresIn: "1d",
      algorithm: "HS256",
    });

    // const token = generateToken({ userId: '65e5aeedbb8c0ce0f0bcf00e' }, { expiresIn: '1d' });

    const link =
      "<a href=" +
      `${process.env.FRONTEND_URI}/approveByHost/${pnr}/${token}` +
      ">Approve Visitor</a>";

    const mailOptions = {
      from: '"BCTFS" <fspbct@gmail.com>', // sender address
      to: `${user.email}`, // list of receivers
      subject: "Visit Approval by host", // Subject line
      html: `Dear ${user.email},
        <p>Greetings from C-DAC !!!</p>
        <p>We have a visit scheduled with the following details:</p>
        <p>Visitor Name: ${user.visitorName}</p>
        <p>Date: ${user.date}</p>
        <p>Time: ${user.time}</p>
        <p>Please review the details and click on the appropriate button below to approve or cancel the visit:</p>
        <p>
         ${link}
        </p>
        <br/>
        <p>----------------------</p>
        <p>C-DAC, Hyderabad</p>
        <br/>
        <br/>
    `,
      // attachments: [
      //   {
      //     filename: 'Form 10BA _ Section 80GG_FY 2023-24.pdf',
      //     content: pdfAttachment, // Attach the PDF content
      //     encoding: 'base64' // Encoding of the attachment
      //   }
      // ]
    };
    //   const mailOptions = {
    //     from: '"BCTFS" <fspbct@gmail.com>', // sender address
    //     to: `${user.email}`, // list of receivers
    //     subject: "Visit Approval by host", // Subject line
    //     html: `Dear ${user.email},
    //     <p>Greetings from C-DAC !!!</p>
    //     <p>We have a visit scheduled with the following details:</p>
    //     <p>Visitor Name: ${user.visitorName}</p>
    //     <p>Date: ${user.date}</p>
    //     <p>Time: ${user.time}</p>
    //     <p>Please review the details and click on the appropriate button below to approve or cancel the visit:</p>
    //     <p>
    //       <a href="${process.env.FRONTEND_URI}/approve_visit/${user.visitId}" style="background-color: green; color: white; padding: 10px 20px; text-decoration: none; margin-right: 10px;">Approve</a>
    //       <a href="${process.env.FRONTEND_URI}/cancel_visit/${user.visitId}" style="background-color: red; color: white; padding: 10px 20px; text-decoration: none;">Cancel</a>
    //     </p>
    //     <br/>
    //     <p>----------------------</p>
    //     <p>C-DAC, Hyderabad</p>
    //     <br/>
    //     <br/>
    // `,
    //     // attachments: [
    //     //   {
    //     //     filename: 'Form 10BA _ Section 80GG_FY 2023-24.pdf',
    //     //     content: pdfAttachment, // Attach the PDF content
    //     //     encoding: 'base64' // Encoding of the attachment
    //     //   }
    //     // ]
    //   };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.log(error);
    return;
  }
}

async function sendCancelVisitMail(visitor) {
  try {
    console.log("visitor::", visitor);

    const pnr = 2;
    // Generate the JWT token outside the loop
    // const feedbackToken = jwt.sign({ pnr: pnr, feedbackProvided: true }, jwtSecret, { expiresIn: '1d' }); // Token expires in 1 day
    const token = jwt.sign({ pnr: pnr, visitor }, jwtSecret, {
      expiresIn: "1d",
      algorithm: "HS256",
    });

    // const token = generateToken({ userId: '65e5aeedbb8c0ce0f0bcf00e' }, { expiresIn: '1d' });

    const link =
      "<a href=" +
      `${process.env.FRONTEND_URI}/cancelVisit/${pnr}/${token}` +
      ">cancel visit</a>";

    const mailOptions = {
      from: '"BCTFS" <fspbct@gmail.com>', // sender address
      to: "sushmitam@cdac.in",
      subject: "Cancellation of Visit",
      html: `
        <p>Dear ${visitor.firstName},</p>
        <p>We regret to inform you that your visit scheduled for ${visitor.date} at ${visitor.time} has been cancelled due to the following reason:</p>
        <p>${visitor.cancellationReason}</p>
        <p>We apologize for any inconvenience caused.</p>
        <p>click on below link to cancel your visit</p>
        <p>  ${link}     </p> 
        <p>Best regards,</p>
        <p>Your Organization</p>
        <br />
     `,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.log(error);
    return;
  }
}

async function sendScheduleMail(user) {
  try {
    console.log("User::", user);

    const pnr = user.pnr;
    // Generate the JWT token outside the loop
    // const feedbackToken = jwt.sign({ pnr: pnr, feedbackProvided: true }, jwtSecret, { expiresIn: '1d' }); // Token expires in 1 day
    const token = jwt.sign({ pnr: pnr, user }, jwtSecret, {
      expiresIn: "1d",
      algorithm: "HS256",
    });
    const link =
      "<a href=" +
      `${process.env.FRONTEND_URI}/cancelByVisitor/${pnr}/${token}` +
      ">cancel visit</a>";
    const mailOptions = {
      from: '"BCTFS" <fspbct@gmail.com>', // sender address
      to: `${user.email}`, // list of receivers
      subject: "Regarding schedule of meeting with visitor", // Subject line
      html: `Dear ${user.hostname},
      <p>Greetings from C-DAC !!!</p>
      <p>We are pleased to schedule a meeting with you. Below are the details:</p>
      <p>First Name: ${user.firstName}</p>
      <p>Last Name: ${user.lastName}</p>
      <p>Date: ${user.date}</p>
      <p>Time: ${user.time}</p>
      <p>Venue: ${user.venue}</p>
      <p>Host Name: ${user.hostname}</p>
      <br/>
      <p>If you want to cancel the meeting you can click below.</p>
      <p>  ${link}     </p> 
      <p>Thank you,</p>
      <p>C-DAC, Hyderabad</p>
      <br/>
      <br/>
  `,

      // attachments: [
      //   {
      //     filename: 'Form 10BA _ Section 80GG_FY 2023-24.pdf',
      //     content: pdfAttachment, // Attach the PDF content
      //     encoding: 'base64' // Encoding of the attachment
      //   }
      // ]
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.log(error);
    return;
  }
}

async function sendApprovedToVisitor(pdfFile) {
  try {
    console.log("pdfFile from sendMailFile::", pdfFile.pdfFile.path);
    // console.log("pdfFile from sendMailFile::",pdfFile);
    // Read the PDF file asynchronously
    //  const pdfAttachment = await readFileAsync(pdfFile.buffer);
    const pdfAttachment = fs.readFileSync(path.join(pdfFile.pdfFile.path));
    const pnr = 2;
    // Generate the JWT token outside the loop
    // const feedbackToken = jwt.sign({ pnr: pnr, feedbackProvided: true }, jwtSecret, { expiresIn: '1d' }); // Token expires in 1 day
    const token = jwt.sign({ pnr: pnr }, jwtSecret, {
      expiresIn: "1d",
      algorithm: "HS256",
    });

    // const token = generateToken({ userId: '65e5aeedbb8c0ce0f0bcf00e' }, { expiresIn: '1d' });

    const link =
      "<a href=" +
      `http://10.244.3.201:3000/trackVisit/${pnr}/${token}` +
      ">Track Here</a>";
    // console.log("feedbackToken::",token)
    // Assuming you are using some library for generating tokens, replace this with your actual token generation logic

    const email = "shashikantd@cdac.in";
    const visitDate = "2024-03-03";
    const visitTime = "12:00 PM";
    const visitLocation = "Hyd";
    const hostName = "Radhika";
    const hostEmail = "shashikantd@cdac.in";
    const mailOptions = {
      from: '"BCTFS" <fspbct@gmail.com>', // sender address
      to: `${email}`, // list of receivers
      subject: " confirrmation of Approval request", // Subject line
      html: `Dear ${email},
      <p>Greetings from C-DAC !!!</p>
      <p>We are pleased to inform you that your visit has been approved. Below are the details of your visit:</p>
      <p>Date: ${visitDate}</p>
      <p>Time: ${visitTime}</p>
      <p>Location: ${visitLocation}</p>
      <p>Host Name: ${hostName}</p>
      <p>Host Email: ${hostEmail}</p>
     <p>----------------------------</p>
     <p>-------</p>You can Track Details using below Link......</p>
     <p>${link}</p>
      <br/>
      <p>Please feel free to contact us if you have any further questions or concerns.</p>
      <br/>
      <p>Thank you,</p>
      <p>C-DAC, Hyderabad</p>
      <br/>
      <br/>

  `,
      attachments: [
        {
          filename: "approvedFile.pdf",
          content: pdfAttachment,
          encoding: "base64", // Encoding of the attachment
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.log(error);
    return;
  }
}

async function sendFeedbackEmail(user) {
  try {
    const pnr = 2;
    // Generate the JWT token outside the loop
    // const feedbackToken = jwt.sign({ pnr: pnr, feedbackProvided: true }, jwtSecret, { expiresIn: '1d' }); // Token expires in 1 day
    const token = jwt.sign({ pnr: pnr, feedbackProvided: true }, jwtSecret, {
      expiresIn: "1d",
      algorithm: "HS256",
    });

    // const token = generateToken({ userId: '65e5aeedbb8c0ce0f0bcf00e' }, { expiresIn: '1d' });

    const link =
      "<a href=" +
      `${process.env.FRONTEND_URI}/approval/${pnr}/${token}` +
      ">Provide Feedback</a>";
    // console.log("feedbackToken::",token)
    // Assuming you are using some library for generating tokens, replace this with your actual token generation logic

    // Generating the link with pnr and token as query parameters
    // const link = `${process.env.FRONTEND_URI}/approval/${pnr}_${token}`;
    // console.log("feedbackToken:", token);
    // console.log("Link:", link);

    const mailOptions = {
      from: '"BCTFS" <fspbct@gmail.com>', // sender address
      to: `${user.email}`, // list of receivers
      subject: "Feedback Request form", // Subject line
      html: `Dear ${user.email},
                <p>Greetings from C-DAC !!!</p>
                <p>We would love to hear your feedback. Please click on the link below to provide your valuable feedback:</p>
                <p>${link}</p>
                <br/>
                <p>----------------------</p>
                <p>C-DAC, Hyderabad</p>
                <br/>
                <br/>
            `,
    };

    const info = await transporter.sendMail(mailOptions);

    return info;
  } catch (error) {
    console.log(error);
    return;
  }
}

// Function to send Deamon emails

async function sendDeamonEmail(user) {
  try {
    console.log("email::", user);

    const mailOptions = {
      from: '"BCTFS" <fspbct@gmail.com>',
      to: `${user.email}`,
      subject: "Deamon Request form",
      html: `Dear ${user.email},
              <p>Greetings from C-DAC !!!</p>
              <p>We would love to hear your Deamon Mail.</p>
    
              <p>----------------------</p>
              <p>C-DAC, Hyderabad</p>
              <br/>
              <br/>
          `,
    };
    // Convert the scheduled date to the local time zone
    const localScheduledDate = moment
      .tz("2024-03-04T14:25:00", "Asia/Kolkata")
      .toDate(); // Adjust 'Asia/Kolkata' to your local time zone

    // Schedule the email to be sent at the specified local date and time
    schedule.scheduleJob(localScheduledDate, async () => {
      console.log(`Sending email to ${user.email} on ${localScheduledDate}`);
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent:", info);
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// let sendEmailFlag6Hours = true; // Flag for sending email reminder 6 hours before visit time
// let sendEmailFlag12Hours = true; // Flag for sending email reminder 12 hours before visit time
// let sendEmailFlag24Hours = true; // Flag for sending email reminder 24 hours before visit time
// let visitCompleted = false; // Flag to track if the visit has been completed

// async function sendReminderEmails() {
//   try {
//     // Get the visit time (replace this with your actual logic to retrieve the visit time)
//     const visitTime = new Date('2024-03-04T15:18:00'); // Example: March 4, 2024, at 1:10 PM

//     // Calculate the time difference in milliseconds
//     const timeDifference = visitTime.getTime() - Date.now();

//     // Check if the visit time is within 6 hours, 12 hours, or 24 hours
//     if (timeDifference <= 0) {
//       console.log('Visit has already passed. Sending completion email...');
//       // Send completion email only if not already sent
//       if (!visitCompleted) {
//         await sendCompletionEmail();
//         visitCompleted = true; // Set the flag to indicate that the email has been sent
//       }
//     } else if (timeDifference <= 5 * 60 * 1000 && sendEmailFlag6Hours) {
//       console.log('Sending high priority1 reminder email (6 hours before visit time)...');
//       // Send high priority reminder email 6 hours before visit time
//       await sendHighPriorityReminderEmail();
//       sendEmailFlag6Hours = false; // Disable further emails for this interval
//     } else if (timeDifference <= 4 * 60 * 1000 && sendEmailFlag12Hours) {
//       console.log('Sending high priority2 reminder email (12 hours before visit time)...');
//       // Send high priority reminder email 12 hours before visit time
//       await sendHighPriorityReminderEmail();
//       sendEmailFlag12Hours = false; // Disable further emails for this interval
//     } else if (timeDifference <= 3 * 60 * 1000 && sendEmailFlag24Hours) {
//       console.log('Sending medium priority reminder email (24 hours before visit time)...');
//       // Send medium priority reminder email 24 hours before visit time
//       await sendMediumPriorityReminderEmail();
//       sendEmailFlag24Hours = false; // Disable further emails for this interval
//     }
//   } catch (error) {
//     console.error('Error occurred while sending reminder email:', error);
//   }
// }

async function sendCompletionEmail() {
  try {
    // Construct the completion email
    const mailOptions = {
      from: "bctfs@cdac.in",
      to: "sushmitam@cdac.in",
      subject: "Visit Completed",
      text: "Dear Host,\n\nThe visit has been successfully completed.\n\nBest regards,\nYour Application",
    };

    // Send the completion email
    const info = await transporter.sendMail(mailOptions);
    console.log("Completion email sent successfully:", info);
  } catch (error) {
    console.error("Error occurred while sending completion email:", error);
  }
}

async function sendHighPriorityReminderEmail() {
  try {
    // Construct the high priority reminder email
    const mailOptions = {
      from: "bctfs@cdac.in",
      to: "sushmitam@cdac.in",
      subject: "High Priority Reminder1: Pending Visit Approval ",
      text: "Dear Host,\n\nThis is a high priority reminder to approve the pending visit.\n\nBest regards,\nYour Application",
    };

    // Send the high priority reminder email
    const info = await transporter.sendMail(mailOptions);
    console.log("High priority reminder email sent successfully:", info);
  } catch (error) {
    console.error(
      "Error occurred while sending high priority reminder email:",
      error
    );
  }
}

async function sendMediumPriorityReminderEmail() {
  try {
    // Construct the medium priority reminder email
    const mailOptions = {
      from: "bctfs@cdac.in",
      to: "sushmitam@cdac.in",
      subject: "Medium Priority Reminder: Pending Visit Approval",
      text: "Dear Host,\n\nThis is a medium priority reminder to approve the pending visit.\n\nBest regards,\nYour Application",
    };

    // Send the medium priority reminder email
    const info = await transporter.sendMail(mailOptions);
    console.log("Medium priority reminder email sent successfully:", info);
  } catch (error) {
    console.error(
      "Error occurred while sending medium priority reminder email:",
      error
    );
  }
}

module.exports = {
  sendScheduleMail,
  sendApprovedToVisitor,
  sendFeedbackEmail,
  sendApproveByHostMail,
  sendVerificationEmail,
  sendPasswordVerificationMail,
  sendDeamonEmail,
  sendCancelVisitMail,
};
