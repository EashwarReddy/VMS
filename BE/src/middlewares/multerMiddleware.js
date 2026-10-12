const multer = require("multer");
const path = require("path");
const fs = require("fs");
const NodeClam = require("clamscan");
const { ApiError } = require("../utils/ApiError"); // Import ApiError

// Define allowed file extensions
const allowedExtensions = [".jpg", ".jpeg", ".png"];

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadFolder = "../uploads/";
    if (req.uploadType === "visitorsPhotos") {
      uploadFolder += "visitorsPhotos/";
    } else if (req.uploadType === "profilePhotos") {
      uploadFolder += "profilePhotos/";
    } else {
      return cb(new ApiError(["Invalid upload type"], "Invalid upload type"), null); // Pass ApiError to callback
    }
    const uploadPath = path.resolve(__dirname, "../", uploadFolder);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File Filter Middleware
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true); // Accept file
  } else {
    cb(new ApiError([`Invalid file type. Allowed: ${allowedExtensions.join(", ")}`], "Invalid file type"), false); // Pass ApiError to callback
  }
};

// ClamAV File Scanner Middleware
const scanFile = async (req, res, next) => {
  if (!req.file) return next(); // Skip if no file uploaded
  try {
    const clamav = await new NodeClam().init({
      removeInfected: true,
      quarantineInfected: false,
      scanRecursively: true,
      clamdscan: {
        socket: "/var/run/clamav/clamd.ctl",
        host: "localhost",
        port: 3310,
      },
    });
    const isInfectedResult = await clamav.isInfected(req.file.path || req.file.buffer);
    console.log(`Scanning File: ${req.file.originalname}, Path: ${req.file.path}`);
    console.log("Scan Result:", isInfectedResult);
    if (isInfectedResult.isInfected) {
      console.error(`Virus detected in ${req.file.filename}. File deleted.`);
      fs.unlinkSync(req.file.path); // Delete the infected file
      return res.status(400).json(new ApiError(["Virus detected in uploaded file!"], "Virus detected")); // Use ApiError
    }
    next(); // Proceed if file is clean
  } catch (error) {
    console.error("Error scanning file:", error);
    return res.status(500).json(new ApiError(["Error scanning file for viruses."], error.message)); // Use ApiError
  }
};

// Multer instance with file filtering
const upload = multer({ storage, fileFilter });

// Middleware function to set upload type dynamically
const setUploadType = (type) => (req, res, next) => {
  req.uploadType = type;
  next();
};

module.exports = { upload, setUploadType, scanFile };