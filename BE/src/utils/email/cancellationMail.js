const { transporter } = require("../../configs/transporter");
const moment = require("moment-timezone");

async function cancellationMail(visitDetails) {
  try {

    const visitorMailOptions = {
      from: '"BCTFS" <fspbct@gmail.com>',
      to: `${visitDetails.visitoremail}`,
      subject: "Your Visit Request is Cancelled",
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
          </style>
        </head>
        <body>
        
        <div class="container">
          <div class="header">
            <img src="https://upload.wikimedia.org/wikipedia/en/d/db/C-DAC_LogoTransp.png" alt="CDAC">
          </div>
          <h1>Dear ${visitDetails.visitorfirstname},</h1>
          <div>
            <p>Your visit request has been cancelled. Below are the details:</p>
            <ul>
            <li><strong>PNR:</strong>  ${visitDetails.pnr}</li>
              <li><strong>Visitor Name:</strong> ${
                visitDetails.visitorfirstname
              } ${visitDetails.visitorlastname}</li>
              <li><strong>Purpose of Visit:</strong>  ${
                visitDetails.purpose
              }</li>
              <li><strong>Date and Time of Meeting Starts:</strong> ${
                new Date(visitDetails.visitstart).toLocaleString(
                  undefined,
                  {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true, timeZone : 'UTC',
                  }
                )}</li>

<li><strong>Date and Time of Meeting Ends:</strong> ${new Date(visitDetails.visitend).toLocaleString(
  undefined,
  {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true, timeZone : 'UTC',
  }
)}</li>
              <li><strong>Host Name:</strong> ${visitDetails.hostname}</li>
              <li><strong>Host Email:</strong> ${visitDetails.hostemail}</li>
            </ul>
            <p>Thank you for your cooperation.</p>
            <p>Best regards,</p>
            <p>C-DAC, Hyderabad</p>
          </div>
        </div>
        
        </body>
        </html>        
          `,
    };

    const hostMailOptions = {
      from: '"BCTFS" <fspbct@gmail.com>',
      to: `${visitDetails.hostemail}`,
      subject: "Your Visit Request is Cancelled",
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
            </style>
          </head>
          <body>
          
          <div class="container">
            <div class="header">
              <img src="https://upload.wikimedia.org/wikipedia/en/d/db/C-DAC_LogoTransp.png" alt="CDAC">
            </div>
            <h1>Dear ${visitDetails.hostname},</h1>
            <div>
              <p>Visit request has been cancelled. Below are the details:</p>
              <ul>
              <li><strong>PNR:</strong>  ${visitDetails.pnr}</li>
                <li><strong>Visitor Name:</strong> ${
                  visitDetails.visitorfirstname
                } ${visitDetails.visitorlastname}</li>
                <li><strong>Purpose of Visit:</strong>  ${
                  visitDetails.purpose
                }</li>
               <li><strong>Date and Time of Meeting Starts:</strong> ${new Date(visitDetails.visitstart).toLocaleString(
                undefined,
                {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true, timeZone : 'UTC',
                }
              )}</li>

<li><strong>Date and Time of Meeting Ends:</strong> ${new Date(visitDetails.visitend).toLocaleString(
  undefined,
  {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true, timeZone : 'UTC',
  }
)}</li>

              </ul>
              <p>Best regards,</p>
              <p>C-DAC, Hyderabad</p>
            </div>
          </div>
          
          </body>
          </html>        
            `,
    };

    const info = await transporter.sendMail(visitorMailOptions);
    console.log("Accepted:", info.accepted);
    console.log("Rejected:", info.rejected);
    console.log("Response:", info.response);


    const info2 = await transporter.sendMail(hostMailOptions);
    console.log("Mail Info ", info2);
    // Delete the temporary Excel file
    // fs.unlinkSync(filePath);
    // await deleteXlsxFile(filePath)

    return info;
  } catch (error) {
    console.log(error);
    return;
  }
}

module.exports = { cancellationMail };
