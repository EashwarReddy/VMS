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

const jwtSecret = "approvecancel"; // Replace with a secure secret key

async function OrgVisitPendingApprovalMail(visitorDetails) {
  try {
    console.log("Details Org::", visitorDetails);

    // Your array of objects containing data

    // // Create a new Excel workbook
    // const workbook = xlsx.utils.book_new();
    // const worksheet = xlsx.utils.json_to_sheet(data);
    // xlsx.utils.book_append_sheet(workbook, worksheet, "Data");

    // Define the path where the temporary Excel file will be saved

    // Creating XLXS File
    const data = visitorDetails.secondaryVisitors;

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName = await createXlsxFile(data, uniqueSuffix);
    console.log("🚀 ~ OrgVisitApprovalMail ~ fileName:", fileName);
    const filePath = path.join(
      __dirname,
      "../../../secondaryVisitorsFiles",
      fileName
    );

    const visitorinfo = {
      type: "Organization",
      visitors: visitorDetails.secondaryVisitors.length + 1,
      visitend: visitorDetails.date1,
    };
    // Write the workbook to a temporary Excel file
    // await new Promise((resolve, reject) => {
    //   xlsx.writeFile(
    //     workbook,
    //     filePath,
    //     { bookType: "xlsx", type: "file" },
    //     (err) => {
    //       if (err) {
    //         console.error("Error writing Excel file:", err);
    //         reject(err);
    //         return;
    //       }
    //       resolve();
    //     }
    //   );
    // });

    // Read the Excel file
    const excelData = fs.readFileSync(filePath, { encoding: "base64" });

    // Generate the JWT token outside the loop
    // const feedbackToken = jwt.sign({ pnr: pnr, feedbackProvided: true }, jwtSecret, { expiresIn: '1d' }); // Token expires in 1 day
    const token = jwt.sign({ visitorinfo }, jwtSecret, {
      expiresIn: "1d",
      algorithm: "HS256",
    });

    const cancelLink =
      "<a href=" +
      `${process.env.FRONTEND_URI}/cancelByVisitor/${visitorDetails.pnr}/${token}` +
      " style='text-decoration:none; color: white;font-size: 1em;'>Cancel visit</a>";

    const visitorMailOptions = {
      from: '"BCTFS" <fspbct@gmail.com>',
      to: `${visitorDetails.email}`,
      subject: "Your Visit Request is Pending Approval",
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
        </style>
      </head>
      <body>
      
      <div class="container">
        <div class="header">
          <img src="https://upload.wikimedia.org/wikipedia/en/d/db/C-DAC_LogoTransp.png" alt="CDAC">
        </div>
        <h1>Dear ${visitorDetails.firstName},</h1>
        <div>
          <p>Your visit request has been submitted and is currently pending approval. Below are the details of your visit:</p>
          <ul>
            <li><strong>Visitor Name:</strong> ${visitorDetails.firstName} ${
        visitorDetails.lastName
      }</li>
            <li><strong>Purpose of Visit:</strong>  ${
              visitorDetails.purpose
            }</li>
            <li><strong>Date and Time of Meeting:</strong>${new Date(
              visitorDetails.date
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
        {
          filename: fileName,
          content: excelData, // Attach the Excel content
          encoding: "base64", // Encoding of the attachment
        },
      ],
    };

    const info = await transporter.sendMail(visitorMailOptions);
    console.log("Mail Info ", info);
    // Delete the temporary Excel file
    // await deleteXlsxFile(filePath);

    return info;
  } catch (error) {
    console.log(error);
    return;
  }
}

async function OrgVisitApprovalMail(visitorDetails) {
  try {
    // Creating XLXS File

    const data = visitorDetails.secondaryVisitors;

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName = await createXlsxFile(data, uniqueSuffix);
    console.log("🚀 ~ OrgVisitApprovalMail ~ fileName:", fileName);
    const filePath = path.join(
      __dirname,
      "../../../secondaryVisitorsFiles",
      fileName
    );

    const visitorinfo = {
      type: "Organization",
      visitors: visitorDetails.secondaryVisitors.length + 1,
      visitend: visitorDetails.date1,
    };

    // Read the Excel file
    const excelData = fs.readFileSync(filePath, { encoding: "base64" });

    // Generate the JWT token outside the loop
    // const feedbackToken = jwt.sign({ pnr: pnr, feedbackProvided: true }, jwtSecret, { expiresIn: '1d' }); // Token expires in 1 day
    const token = jwt.sign({ visitorinfo }, jwtSecret, {
      expiresIn: "1d",
      algorithm: "HS256",
    });

    const cancelLink =
      "<a href=" +
      `${process.env.FRONTEND_URI}/cancelByVisitor/${visitorDetails.pnr}/${token}?type=organization` +
      " style='text-decoration:none; color: white;font-size: 1em;'>Cancel visit</a>";

    const approvalLink =
      "<a href=" +
      `${process.env.FRONTEND_URI}/approveByHost/${visitorDetails.pnr}/${token}?type=organization` +
      " style='text-decoration:none; color: white;font-size: 1em;'>Approve visit</a>";

    const visitorMailOptions = {
      from: '"BCTFS" <fspbct@gmail.com>',
      to: `${visitorDetails.hostemail}`,
      subject: "Your Visit Request is Pending Approval",
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
        <div class="header">
          <img src="https://upload.wikimedia.org/wikipedia/en/d/db/C-DAC_LogoTransp.png" alt="CDAC">
        </div>
        <h1>Dear ${visitorDetails.hostname},</h1>
        <div>
          <p>A visit request has been submitted for your approval. Below are the details of the visit:</p>
          <ul>
            <li><strong>Visitor Name:</strong> ${visitorDetails.firstName} ${
        visitorDetails.lastName
      }</li>
            <li><strong>Purpose of Visit:</strong>  ${
              visitorDetails.purpose
            }</li>
            <li><strong>Date and Time of Meeting:</strong>${new Date(
              visitorDetails.date
            ).toLocaleString(undefined, {
              month: "numeric",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}</li>
            <li><strong>Visitor Contact:</strong> ${visitorDetails.contact}</li>
            <li><strong>Visitor Email:</strong> ${visitorDetails.email}</li>
            <li><strong>Visitor Gender:</strong> ${visitorDetails.gender}</li>
            <li><strong>Visitor Pincode:</strong> ${visitorDetails.pincode}</li>
            <li><strong>Visitor State:</strong> ${visitorDetails.state}</li>
            <li><strong>Visitor District:</strong> ${
              visitorDetails.district
            }</li>
            <li><strong>Visitor Address:</strong> ${visitorDetails.address}</li>
            <li><strong>Visitor Organization:</strong> ${
              visitorDetails.organization
            }</li>
            <li><strong>Visitor Id Type:</strong> ${visitorDetails.idtype}</li>
            <li><strong>Visitor Id No:</strong> ${visitorDetails.idno}</li>
          </ul>
          <p>If you need to cancel your visit, please click on the link below:</p>
          <button class="approve-button">${approvalLink}</button>
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
        {
          filename: fileName,
          content: excelData, // Attach the Excel content
          encoding: "base64", // Encoding of the attachment
        },
      ],
    };

    const info = await transporter.sendMail(visitorMailOptions);
    console.log("Mail Info 2", info);

    // Delete the temporary Excel file
    await deleteXlsxFile(filePath);

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
  console.log("🚀 ~ createXlsxFile ~ worksheet:", worksheet);
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
  OrgVisitPendingApprovalMail,
  OrgVisitApprovalMail,
};
