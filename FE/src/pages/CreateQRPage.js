import {
  Button,
  Container,
  TextField,
  Typography,
  Box,
  Snackbar,
} from "@mui/material";
import jsPDF from "jspdf";
import { useRef, useState } from "react";
import CustomQRCode from "../components/CustomQRCode"; // Import the custom QR code component
import Head from "next/head";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import MuiAlert from "@mui/material/Alert";
import { Frontend_API } from "src/api";

function Page() {
  const [qrData, setQRData] = useState(""); // State to hold QR data
  const qrCodeRef = useRef(null); // Reference to the QR code component
  const [isPDFGenerated, setIsPDFGenerated] = useState(false);
  const [isValidationError, setIsValidationError] = useState(false);

  const handleCloseSnackbar = () => {
    setIsPDFGenerated(false);
    setIsValidationError(false);
  };
  const handleGenerateQR = () => {};

  // Define the logo image URL
  const logoUrl = "./cdac.png"; // Assuming your logo file is in the public directory

  const handleDownloadQR = async () => {
    // Assuming qrData is the value to be used as a query in the database
    const qrCodeValue = 1;

    try {
      const response = await fetch(`${Frontend_API}/${qrCodeValue}`);
      const data = await response.json();
      console.log("data::", data);
      if (!data) {
        console.error("Data not found in the database");
        setIsValidationError(true);

        return;
      } else {
        // Data retrieval successful, proceed with generating the PDF
        generatePDF(data);
        setIsFeedbackSubmitted(true);
      }
    } catch (error) {
      console.error("Error fetching data from the database:", error);
      setIsValidationError(true);
    }
  };
  const generatePDF = (data) => {
    const pdf = new jsPDF();

    // Dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const logoWidth = 40; // Adjust the logo width as needed
    const logoHeight = 40;
    const qrCodeWidth = 80; // Adjust the QR code width as needed
    const qrCodeHeight = 80;
    const contentMarginTop = 10; // Adjust the margin in points for content as needed
    // const qrCodeImageData = qrCodeContainer.toDataURL('image/png');

    // Draw QR code directly
    const qrCodeContainer = document.getElementById("qr-code");
    if (!qrCodeContainer) {
      console.error("QR code container not found");
      return;
    }

    qrCodeContainer.style.border = "5px solid red"; // Adjust the border size and color as needed
    qrCodeContainer.style.borderRadius = "10px"; // Optional: Add border-radius for rounded corners

    // Convert QR code container to image
    const qrCodeImageData = qrCodeContainer.toDataURL("image/png");
    // Logo at the top
    const logoX = (pdfWidth - logoWidth) / 2;
    const logoY = contentMarginTop;
    pdf.addImage(topLogo, "PNG", logoX-5, logoY, logoWidth+10, logoHeight-5); // Replace 'path/to/your/logo.png' with your logo path
    // QR code below the logo
    const qrCodeX = (pdfWidth - qrCodeWidth) / 2;
    const qrCodeY = logoY + logoHeight + 10; // Adjust the Y position as needed
    pdf.addImage(
      qrCodeImageData,
      "PNG",
      qrCodeX,
      qrCodeY,
      qrCodeWidth,
      qrCodeHeight
    );

    pdf.addImage(
      logoUrl,
      "PNG",
      qrCodeX +25,
      qrCodeY +25,
      qrCodeWidth -50,
      qrCodeHeight -50,
    );

    // Visitor name below the QR code at the center
    const visitorNameWidth =
      pdf.getStringUnitWidth(`Visitor Name: ${data.name || "Default Name"}`) *
      12;
    const visitorNameX = pdfWidth - visitorNameWidth; // Center the text
    const visitorNameY = qrCodeY + qrCodeHeight + 10; // Adjust the Y position as needed

    pdf.setFontSize(12);
    pdf.text(
      `Visitor Name: ${data.name || "Default Name"}`,
      visitorNameX,
      visitorNameY
    );


      // Draw border around the entire content
  pdf.setDrawColor(0, 0, 0); // Set border color to red (adjust as needed)
  pdf.setLineWidth(1);
  pdf.rect(5, 5, pdfWidth - 10, pdfHeight - 10);

    // Save the PDF
    const pdfFileName = "qrcodes.pdf";
    pdf.save(pdfFileName);
  };

  return (
    <>
      <Head>
        <title>Standard user Form</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container>
          <Typography variant="h3" gutterBottom>
            Generate QR Code
          </Typography>

          {/* Input field for QR data */}
          <TextField
            label="Enter QR Data"
            variant="outlined"
            fullWidth
            value={qrData}
            onChange={(e) => setQRData(e.target.value)}
            style={{ marginBottom: "20px" }}
          />

          {/* Button to generate QR code */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateQR}
          >
            Generate QR Code
          </Button>

          {/* Display generated QR code */}
          {qrData && (-
            <div style={{ marginTop: "20px" }}>
              <Typography variant="h5" gutterBottom>
                Generated QR Code:
              </Typography>
              <CustomQRCode
                id="qr-code"
                ref={qrCodeRef}
                value={qrData}
                logo={logoUrl}
              />
              <Button
                variant="contained"
                color="primary"
                style={{ marginTop: "10px" }}
                onClick={handleDownloadQR}
              >
                Download QR Code
              </Button>
            </div>
          )}
          {!qrData && (
            <Typography variant="body2" color="error">
              Please generate a QR code first.
            </Typography>
          )}
        </Container>
        {/* Snackbar for feedback confirmation */}
        <Snackbar
          open={isPDFGenerated || isValidationError}
          autoHideDuration={2000} // Adjust the duration as needed
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={handleCloseSnackbar}
            severity={isValidationError ? "error" : "success"}
          >
            {isValidationError
              ? "No Data Found."
              : "PDF Generated successfully!"}
          </MuiAlert>
        </Snackbar>
      </Box>
    </>
  );
}

// export default FeedbackForm;
Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
