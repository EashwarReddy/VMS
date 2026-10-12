const { transporter } = require("../../configs/transporter");
const {
  EMAIL_VERIFICATION_TOKEN_AGE,
  EMAIL_PASSWORD_RESET_TOKEN_AGE,
} = require("../../constants");
const { generateToken } = require("../jwt/jwtUtil");
const PasswordResetToken = require("../../models/PasswordResetToken.model");

const fs = require("fs");
const path = require("path");
const util = require("util");
const moment = require("moment-timezone");
const jwt = require("jsonwebtoken");

const { setInterval } = require("timers");

const xlsx = require("xlsx");

const jwtSecret = "trackdetails"; // Replace with a secure secret key
const jwtSecret1 = "approvecancel"; // Replace with a secure secret key

async function OrgVisitDetailsMail(visitorDetails, base64Data) {
  try {
    // Creating XLXS File
    // const data = visitorDetails.secondaryvisitors;

    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // const fileName = await createXlsxFile(data, uniqueSuffix);
    // console.log("🚀 ~ OrgVisitDetailsMail ~ fileName:", fileName);
    // const filePath = path.join(
    //   __dirname,
    //   "../../../secondaryVisitorsFiles",
    //   fileName
    // );

    // Read the Excel file
    // const excelData = fs.readFileSync(filePath, { encoding: "base64" });

    const visitorinfo = {
      type: "Organization",
      visitors: visitorDetails.secondaryvisitors.length + 1,
      visitend: visitorDetails.date1,
    };

    // Generate the JWT token outside the loop
    // const feedbackToken = jwt.sign({ pnr: pnr, feedbackProvided: true }, jwtSecret, { expiresIn: '1d' }); // Token expires in 1 day
    const token = jwt.sign({ visitorinfo }, jwtSecret, {
      expiresIn: "1d",
      algorithm: "HS256",
    });

    const token1 = jwt.sign({ visitorinfo }, jwtSecret1, {
      expiresIn: "1d",
      algorithm: "HS256",
    });

    const trackLink =
      "<a href=" +
      `${process.env.FRONTEND_URI}/trackVisit/${visitorDetails.pnr}/${token}` +
      " style='text-decoration:none; color: white;font-size: 1em;'>Track visit</a>";

    const cancelLink =
      "<a href=" +
      `${process.env.FRONTEND_URI}/cancelByVisitor/${visitorDetails.pnr}/${token1}` +
      " style='text-decoration:none; color: white;font-size: 1em;'>Cancel visit</a>";

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
            text-decoration: none;departureDateTime
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
        <div class="header">
          <img src="https://upload.wikimedia.org/wikipedia/en/d/db/C-DAC_LogoTransp.png" alt="CDAC">
        </div>
        <h1>Dear ${visitorDetails.firstName},</h1>
        <div>
          <p>Your visit request has been approved. Below are the details of your visit:</p>
          <ul>
          <li><strong>PNR:</strong>  ${visitorDetails.pnr}</li>
            <li><strong>Visitor Name:</strong> ${visitorDetails.firstName} ${
        visitorDetails.lastName
      }</li>
            <li><strong>Purpose of Visit:</strong>  ${
              visitorDetails.purpose
            }</li>
            <li><strong>Date and Time of Meeting Starts:</strong>${new Date(
              visitorDetails.date
            ).toLocaleString(undefined, {
              month: "numeric",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}</li>
            <li><strong>Date and Time of Meeting Ends:</strong>${new Date(
              visitorDetails.date1
            ).toLocaleString(undefined, {
              month: "numeric",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}</li>
            <li><strong>Host Name:</strong> ${visitorDetails.hostname}</li>
            <li><strong>Host Email:</strong> ${visitorDetails.hostemail}</li>
          </ul>
          <p>If you need to cancel your visit, please click on the link below:</p>
          <button class="approve-button">${trackLink}</button>
          <button>${cancelLink}</button>
          <p>Thank you for your cooperation.</p>
          <p>Best regards,</p>
          <p>C-DAC, Hyderabad</p>
        </div>
      </div>
      
      </body>
      </html>
      
        `,
      attachments: [
        // {
        //   filename: fileName,
        //   content: excelData, // Attach the Excel content
        //   encoding: "base64", // Encoding of the attachment
        // },
        {
          filename: "Organisation_Pass.pdf",
          content: pdfBuffer, // Attach the PDF content
          // encoding: "base64", // Encoding of the attachment
        },
      ],
    };

    const info = await transporter.sendMail(visitorMailOptions);
    console.log("Mail Info ", info);

    // await deleteXlsxFile(filePath);

    return info;
  } catch (error) {
    console.log(error);
    return;
  }
}

async function createXlsxFile(data, fileName) {
  console.log("🚀 ~ createXlsxFile ~ data:", data);
  // Define the file path where the XLSX file will be saved
  const filePath = path.join(
    __dirname,
    "../../../secondaryVisitorsFiles",
    fileName + ".xlsx"
  );

  console.log("File Path:: ", filePath);
  // console.log("XLSX Data", data);

  // Create a new Excel workbook
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, worksheet, "Data");

  // Write the workbook to the XLSX file
  xlsx.writeFile(workbook, filePath, { bookType: "xlsx", type: "file" });

  console.log("XLSX file created successfully:", fileName);
  return `${fileName}.xlsx`;
}

// Function to delete an XLSX file
async function deleteXlsxFile(filePath) {
  return new Promise((resolve, reject) => {
    // Check if the file exists
    fs.stat(filePath, (err, stats) => {
      if (err) {
        console.error("Error checking file status:", err);
        reject(err);
      } else {
        // Delete the file
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
            reject(err);
          } else {
            console.log("XLSX file deleted successfully:", filePath);
            resolve();
          }
        });
      }
    });
  });
}

module.exports = {
  OrgVisitDetailsMail,
};
