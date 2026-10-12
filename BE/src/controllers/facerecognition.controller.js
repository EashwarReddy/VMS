const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { Server } = require("socket.io");
const { ApiError } = require("../utils/ApiError");
const express = require("express");
const https = require("https");
const {logger} = require("../configs/logger");

const app = express();

// // Load SSL Certificates
// const serverOptions = {
//     key: fs.readFileSync(path.join(__dirname, "../../sslcerts/key.pem")),
//     cert: fs.readFileSync(path.join(__dirname, "../../sslcerts/cert.pem")),
// };

// // Create HTTPS Server
// const server = https.createServer(serverOptions, app);

// // Initialize Socket.io globally
// const io = new Server(server, {
//     cors: {
//         origin: "https://localhost:3000",
//         methods: ["GET", "POST"],
//         credentials: true,
//     },
//     transports: ["websocket", "polling"], // Ensure WebSocket fallback
// });

// // Handle client connections
// io.on("connection", (socket) => {
//     console.log("✅ Client connected:", socket.id);
// });



const VisitIndividual = require("../models/Visits.model");
const VisitsModel = require("../models/Visits.model");
const VisitorMovementModel = require("../models/VisitorMovement.model");
const SocketIDModel = require("../models/SocketID.model");




const uploadsDir = path.join(__dirname, "../../uploads/visitorsPhotos");

// Controller to fetch all images for today's appointments
// const getAllImages = async (req, res) => {
//     try {
//         const today = new Date();
//         const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
//         const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

//         console.log("Today's date:", today, startOfDay, endOfDay);

//         const images = await VisitIndividual.find({
//             visitstart: { $lte: endOfDay },
//             visitend: { $gte: startOfDay },
//         });

//         const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
//         const foundFiles = images.filter(filename => {
//             const filePath = path.join(uploadsDir, filename.image);
//             return fs.existsSync(filePath);
//         });

//         if (foundFiles.length === 0) {
//             // return res.status(404).json({ error: "No appointments found today" });
//             throw new ApiError(["No appointments found today"], "No appointments found today", 404);
//         }

//         // Create a ZIP archive to send multiple files
//         res.setHeader("Content-Type", "application/zip");
//         res.setHeader("Content-Disposition", `attachment; filename=images_${normalizedToday.toDateString().replaceAll(" ", "_")}.zip`);

//         const archive = archiver("zip");
//         archive.pipe(res);

//         foundFiles.forEach(file => {
//             console.log("Processing file:", file.image);
//             const filePath = path.join(uploadsDir, file.image);
//             const sanitizedFirstName = file.visitorfirstname.replaceAll(" ", "_");
//             const sanitizedLastName = file.visitorlastname.replaceAll(" ", "_");
//             const fileName = `${file.pnr}.png`;

//             archive.file(filePath, { name: fileName });
//         });

//         archive.finalize();
//     } catch (error) {
//         console.error("Error fetching images:", error);
//         // res.status(500).json({ error: "Internal server error" });
//         // Handle errors using ApiError
//         if (error instanceof ApiError) {
//             return res.status(error.statusCode || 500).json({
//                 success: error.success,
//                 errors: error.errors,
//                 message: error.message,
//                 data: error.data,
//             });
//         }

//         // Generic server error
//         return res.status(500).json(new ApiError(["Internal server error"], error.message));
//     }
// };

const getAllImages = async (req, res) => {
    try {
        
        const today = new Date();

        // Get UTC Year/Month/Date for today
        const year = today.getUTCFullYear();
        const month = today.getUTCMonth();
        const date = today.getUTCDate();
        
        // Define start and end of day in UTC
        const startOfDay = new Date(Date.UTC(year, month, date, 0, 0, 0, 0));
        const endOfDay = new Date(Date.UTC(year, month, date, 23, 59, 59, 999));

         console.log("Today's date:", today);
        console.log("UTC startOfDay:", startOfDay);
        console.log("UTC endOfDay:", endOfDay);
    
        const images1 = await VisitIndividual.find({
            visitstart: { $lte: endOfDay },
            visitend: { $gte: startOfDay },
        });



        const images = [...images1, ...images2];

        const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const foundFiles = images.filter(filename => {
            const filePath = path.join(uploadsDir, filename.image);
            return fs.existsSync(filePath);
        });

        if (foundFiles.length === 0) {
            // return res.status(404).json({ error: "No appointments found today" });
            throw new ApiError(["No appointments found today"], "No appointments found today", 404);
        }

        // Create a ZIP archive to send multiple files
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", `attachment; filename=images_${normalizedToday.toDateString().replaceAll(" ", "_")}.zip`);

        const archive = archiver("zip");
        archive.pipe(res);

        foundFiles.forEach(file => {
            console.log("Processing file:", file.image);
            const filePath = path.join(uploadsDir, file.image);
            const sanitizedFirstName = file.visitorfirstname.replaceAll(" ", "_");
            const sanitizedLastName = file.visitorlastname.replaceAll(" ", "_");
            const fileName = `${file.pnr}.png`;

            archive.file(filePath, { name: fileName });
        });

        archive.finalize();
    } catch (error) {
        logger.error(error);
        console.error("Error fetching images:", error);
        // res.status(500).json({ error: "Internal server error" });
        // Handle errors using ApiError
        if (error instanceof ApiError) {
            return res.status(error.statusCode || 500).json({
                success: error.success,
                errors: error.errors,
                message: error.message,
                data: error.data,
            });
        }
        // Generic server error
        return res.status(500).json(new ApiError(["Internal server error"], error.message));
    }
};

// Controller to handle photo upload with corresponding JSON data

// const uploadFileSuccess = async (req, res) => {
//     try {
//         const uploadedFiles = req.file.buffer;

//         if (!uploadedFiles || uploadedFiles.length === 0) {
//             return res.status(400).json({ error: "No photos uploaded" });
//         }

//         console.log("Uploaded files:", uploadedFiles);

//         // Get today's date in YYYY-MM-DD format
//         const today = new Date();
//         const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD

//         // Path to today's folder inside /success
//         const successFolder = path.join(__dirname, "../success", formattedDate);

//         // Check if today's folder exists, create it if not
//         if (!fs.existsSync(successFolder)) {
//             fs.mkdirSync(successFolder, { recursive: true });
//         }

//         // Process and save each uploaded file
//         // uploadedFiles.forEach(file => {
//         //     if (/\.(jpg|jpeg|png|gif)$/i.test(file.originalname)) {
//         //         const imageName = file.originalname;
//         //         const imagePath = path.join(successFolder, imageName);

//         //         // Save the file in today's folder
//         //         fs.copyFileSync(file.path, imagePath);

//         //         console.log(`File saved: ${imagePath}`);
//         //     }
//         // });
//         const file = uploadedFiles[0]; // Get the first file
// let imageName = ''
//         if (file && /\.(jpg|jpeg|png|gif)$/i.test(file.originalname)) {
//              imageName = file.originalname;
//             const imagePath = path.join(successFolder, imageName);
        
//             // Save the file in today's folder
//             fs.copyFileSync(file.path, imagePath);
        
//             console.log(`File saved: ${imagePath}`);
//         }
//         const [pnr, timestamp] = imageName.split("_");
//         const visitInd = await VisitIndividual.findOne({ pnr : pnr });
//         let visit = await VisitsModel.findOne({ pnr: pnr });
//         let resObj = {
//             pnr: visit.pnr,
//             visitorName: `${visit.visitorfirstname} ${visit.visitorlastname}`,
//             visitorOrg: visit.visitororganization,
//             inTime: visit.visitstart,
//             outTime: visit.visitend,
//             hostName: visit.hostname,
//             purpose: visit.purpose,
//             idType: visit.visitoridtype,
//             idNo: visit.visitortidno,
//             movementStatus: "none",
//             visitors: "1",
//             visitType : visit.visitType
//           };
//         const message = {
//             status: 'success',
//             link:  visit.visitLink || `http://${process.env.FRONTEND_URI}/spotRegistration`,
//             data : resObj
//           };
         
//           // Emit message to all connected clients
//           req.io.emit('file-upload-success', message);
//           console.log('message to to be sent', message)

//         res.status(200).json({
//             message: "Photos processed and saved successfully!",
//         });
       
//     } catch (error) {
//         console.error("Error processing files:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };

const uploadFileSuccess = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const fileBuffer = req.file.buffer;
        const fileOriginalName = req.file.originalname;

        // Validate file type
        if (!/\.(jpg|jpeg|png|gif)$/i.test(fileOriginalName)) {
            return res.status(400).json({ error: "Invalid file type. Only images are allowed." });
        }

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

        // Define success folder path
        const successFolder = path.join(__dirname, "../success", today);

        // Create folder if it doesn't exist
        if (!fs.existsSync(successFolder)) {
            fs.mkdirSync(successFolder, { recursive: true });
        }

        // Save image to the folder
        const imagePath = path.join(successFolder, fileOriginalName);
        fs.writeFileSync(imagePath, fileBuffer); // Save buffer directly

        console.log(`File saved: ${imagePath}`);

        // Extract PNR from filename
        const [pnr] = fileOriginalName.split("_");

        // Fetch visit details
        const visit = await VisitsModel.findOne({ pnr: pnr });
        const visitorMovement = await VisitorMovementModel.findOne({pnr : pnr})
        if (!visit) {
            return res.status(404).json({ error: "Visit not found" });
        }

        const resObj = {
            pnr: visit.pnr,
            visitorName: `${visit.visitorfirstname} ${visit.visitorlastname}`,
            visitorOrg: visit.visitororganization,
            inTime: visit.visitstart,
            outTime: visit.visitend,
            hostName: visit.hostname,
            purpose: visit.purpose,
            idType: visit.visitoridtype,
            idNo: visit.visitortidno,
            movementStatus: visitorMovement?.status||'none',
            visitors: "1",
            visitType: visit.visitType
        };

        const message = {
            status: "success",
            link: visit.visitLink || `http://${process.env.FRONTEND_URI}/spotRegistration`,
            data: resObj
        };

        // Emit message using Socket.IO
        req.io.emit("file-upload-success", message);
        console.log("Message sent:", message);

        res.status(200).json({ message: "File processed and saved successfully!" });

    } catch (error) {
        logger.error(error);
        console.error("Error processing file:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const sendLatestPhoto = (req, res) => {
    try {
        const { uniqueId } = req.params;

        if (!uniqueId) {
            return res.status(400).json({ error: "Unique ID is required" });
        }

        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0]; // YYYY-MM-DD

        // Path to today's folder
        const folderPath = path.join(__dirname, "../success", formattedDate);

        console.log("Looking for files in folder:", folderPath);

        if (!fs.existsSync(folderPath)) {
            return res.status(404).json({ error: "No photos folder found for today" });
        }

        // Read all files in today's folder
        const files = fs.readdirSync(folderPath);

        // Filter files that match the uniqueId and valid timestamped images
        const matchingFiles = files
            .filter(file => {
                const regex = new RegExp(`^${uniqueId}_(\\d{14})\\.(jpg|jpeg|png|gif)$`, "i");
                return regex.test(file);
            })
            .map(file => {
                const regex = new RegExp(`^${uniqueId}_(\\d{14})\\.(jpg|jpeg|png|gif)$`, "i");
                const match = file.match(regex);
                const dateTimeStr = match[1]; // Extract the timestamp part (YYYYMMDDHHMMSS)
                const dateTime = new Date(
                    dateTimeStr.replace(
                        /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/,
                        "$1-$2-$3T$4:$5:$6"
                    )
                );
                return { file, dateTime };
            })
            .sort((a, b) => b.dateTime - a.dateTime); // Sort by dateTime descending

        console.log("Matching files:", matchingFiles);

        if (matchingFiles.length === 0) {
            return res.status(404).json({ error: "No matching photos found" });
        }

        // Get the latest file
        const latestFile = matchingFiles[0].file;
        const latestFilePath = path.join(folderPath, latestFile);

        console.log("Sending file:", latestFilePath);

        // Send the latest photo
        res.sendFile(latestFilePath, err => {
            if (err) {
                console.error("Error sending file:", err);
                res.status(500).json({ error: "Failed to send the photo" });
            }
        });
    } catch (error) {
        logger.error(error);
        console.error("Error searching for photo:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
const getVisitPhoto = async (req, res) => {
    try {
        const { uniqueId } = req.params;

        if (!uniqueId) {
            return res.status(400).json({ error: "Unique ID is required" });
        }

        const visit = await VisitsModel.findOne({ pnr: uniqueId });

        if (!visit || !visit.image) {
            return res.status(404).json({ error: "Visit or image not found" });
        }

        const fileName = visit.image;

        // Path to the folder where images are stored
        const folderPath = path.join(__dirname, "../../uploads/visitorsPhotos");
        console.log('Folder path for sending visit photo', folderPath, fileName)
        const photoFile = path.join(folderPath, fileName);

        if (!fs.existsSync(photoFile)) {
            return res.status(404).json({ error: "Photo not found in uploads folder" });
        }

        // Send the matched photo file
        res.sendFile(photoFile, err => {
            if (err) {
                console.error("Error sending file:", err);
                res.status(500).json({ error: "Failed to send the photo" });
            }
        });
    } catch (error) {
        logger.error(error);
        console.error("Error searching for photo:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
// Controller for handling rejected file uploads
const updateSocketID = async (req, res) => {
    try {
        const { userID, socketID } = req.body;

        if (!userID || !socketID) {
            return res.status(400).json(new ApiError(['userID and socketID are required.']));
        }

        // Find the existing socket entry
        let socketEntry = await SocketIDModel.findOne({ userID });

        if (socketEntry) {
            // Update the socketID if entry exists
            socketEntry.socketID = socketID;
            await socketEntry.save();
        } else {
            // Create a new entry if not found
            socketEntry = await SocketIDModel.create({ userID, socketID });
        }

        return res.status(200).json({ message: 'Socket ID updated successfully', socketEntry });
    } catch (error) {
        logger.error(error);
        return res.status(500).json(new ApiError(['Internal server error'], error.message));
    }
};

module.exports = {
    getAllImages,
    uploadFileSuccess,
    sendLatestPhoto,
    updateSocketID,
    getVisitPhoto
};
