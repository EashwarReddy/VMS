const { validationResult } = require("express-validator");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const ConveyanceOrganization = require("../models/ConveyanceOrg.model");

// Create a new conveyance organization booking
async function createConveyanceOrganization(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(new ApiError(errors.array().map(error => error.msg)));
        }        

        const conveyanceOrganization = new ConveyanceOrganization(req.body);
        await conveyanceOrganization.save();

        res.status(201).json(new ApiResponse(null, "Conveyance organization booking created successfully!"));
    } catch (error) {
        console.error(error);
        res.status(500).json(new ApiError([error.message]));
    }
}

// Get all conveyance organization bookings
async function getAllConveyanceOrganizations(req, res) {
    try {
        const conveyanceOrganizations = await ConveyanceOrganization.find();
        res.json(new ApiResponse(conveyanceOrganizations, "All conveyance organization bookings fetched successfully!"));
    } catch (error) {
        console.error(error);
        res.status(500).json(new ApiError([error.message]));
    }
}

// Get a conveyance organization booking by ID
async function getConveyanceOrganizationById(req, res) {
    try {
        const conveyance = await ConveyanceOrganization.findOne({
          pnr: req.params.id,
        });
    
        const finaldetails = {
          pnr: conveyance.pnr,
          pickupDateTime: conveyance.initialpickupdateandtime,
          pickupLocation: conveyance.initiallocation,
          dropOffDateTime: conveyance.finaldropoffdateandtime,
          dropOffLocation: conveyance.finaldropofflocation,
        };
    
        const conveyanceDetails = conveyance.conveyancedetails.map((item) => ({
    
          ind_id: item._id,
          pickupDateTime: item.pickupdateandtime,
          pickupLocation: item.pickuplocation,
          dropOffDateTime: item.dropoffdateandtime,
          dropOffLocation: item.dropofflocation,
          driverName: item.drivername,
          vehicleNo: item.vehicleno,
          vehicleType: item.vehicletype,
          driverContact: item.drivercontact,
          bookedBy: item.bookedby,
          bookedFor: item.bookedfor,
          remarks: item.remarks,
          status: item.status,
        }));
    
        if (!conveyance) {
          return res
            .status(404)
            .json(new ApiError(["Conveyance booking not found"]));
        }
        res.json(
          new ApiResponse(
            { conveyanceDetails, finaldetails },
            "Conveyance booking fetched successfully!"
          )
        );
      } catch (error) {
        console.error(error);
        res.status(500).json(new ApiError([error.message]));
    }
}

// Update a conveyance organization booking by ID
async function updateConveyanceOrganization(req, res) {
    try {
        const conveyancedetails = req.body.map((item) => {
          if (item.driverContact != " ") {
            return {
              pickupdateandtime: item.pickupDateTime,
              pickuplocation: item.pickupLocation,
              dropoffdateandtime: item.dropOffDateTime,
              dropofflocation: item.dropOffLocation,
              drivername: item.driverName,
              vehicleno: item.vehicleNo,
              vehicletype: item.vehicleType,
              drivercontact: item.driverContact,
              bookedby: item.bookedBy,
              bookedfor: item.bookedFor,
              remarks: item.remarks,
              status: "Planned",
            };
          }
          return {
            pickupdateandtime: item.pickupDateTime,
            pickuplocation: item.pickupLocation,
            dropoffdateandtime: item.dropOffDateTime,
            dropofflocation: item.dropOffLocation,
            drivername: " ",
            vehicleno: " ",
            vehicletype: " ",
            drivercontact: " ",
            bookedby: " ",
            bookedfor: " ",
            remarks: " ",
            status: "Pre-Planned",
          };
        });
    
        const errors = validationResult(conveyancedetails);
        if (!errors.isEmpty()) {
          return res
            .status(400)
            .json(new ApiError(errors.array().map((error) => error.msg)));
        }
    
        const conveyance = await ConveyanceOrganization.findOneAndUpdate(
          { pnr: req.params.id },
          { $set: { conveyancedetails: conveyancedetails } },
          { new: true }
        );
        if (!conveyance) {
          return res
            .status(404)
            .json(new ApiError(["Conveyance booking not found"]));
        }
        res.json(
          new ApiResponse(conveyance, "Conveyance booking updated successfully!")
        );
      } catch (error) {
        console.error(error);
        res.status(500).json(new ApiError([error.message]));
    }
}

// Delete a conveyance organization booking by ID
async function deleteConveyanceOrganization(req, res) {
    try {
        const conveyanceOrganization = await ConveyanceOrganization.findByIdAndDelete({pnr: req.params.id});
        if (!conveyanceOrganization) {
            return res.status(404).json(new ApiError(["Conveyance organization booking not found"]));
        }
        res.json(new ApiResponse(null, "Conveyance organization booking deleted successfully!"));
    } catch (error) {
        console.error(error);
        res.status(500).json(new ApiError([error.message]));
    }
}

module.exports = {
    createConveyanceOrganization,
    getAllConveyanceOrganizations,
    getConveyanceOrganizationById,
    updateConveyanceOrganization,
    deleteConveyanceOrganization
};
