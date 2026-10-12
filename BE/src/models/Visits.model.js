const { default: mongoose } = require("mongoose");
const {
  visitorIdTypeEnums,
  visitStatusEnums,
  visitPriorityEnums,
  visitorTypeEnums,
} = require("../enums");
const validator = require("validator");

const { cleanString } = require("../utils/sanitizer");


const VisitIndividualSchema = new mongoose.Schema(
  {
    pnr: {
      type: String,
      unique: true,
      required: [true, "PNR is required."],
      trim: true,
    },
    visitstart: {
      type: Date,
      required: [true, "Visit schedule 'From' date and time is required."],
    },
    visitend: {
      type: Date,
      required: [true, "Visit schedule 'To' date and time is required."],
      validate: {
        validator: function (value) {
          return value > this.visitstart;
        },
        message: "Visit end date must be after visit start date.",
      },
    },
    approvedByHost: {
      type: Boolean,
      default: false,
    },
    isAccomodationRequired: {
      type: Boolean,
      required: [true, "Accommodation requirement must be specified."],
    },
    isTravelRequired: {
      type: Boolean,
      required: [true, "Travel requirement must be specified."],
    },
    visitorfirstname: {
      type: String,
      required: [true, "First Name is required."],
      trim: true,
      minlength: [2, "First Name must be at least 2 characters long."],
      maxlength: [50, "First Name cannot exceed 50 characters."],
      set: cleanString
    },
    visitorlastname: {
      type: String,
      required: [true, "Visitor's last name is required."],
      trim: true,
      minlength: [1, "Last Name must be at least 1 characters long."],
      maxlength: [50, "Last Name cannot exceed 50 characters."],
      set: cleanString
    },
    visitorgender: {
      type: String,
      required: [true, "Visitor's gender is required."],
      trim: true,
    },
    visitorcontactno: {
      type: String,
      trim: true,
      required: [true, "Visitor's contact number is required."],
      match: [/^\d{10}$/, "Visitor's contact number must be 10 digits."],
    },
    visitoremail: {
      type: String,
      required: [true, "Visitor's email is required."],
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email address"]
    },
    visitortype: {
      type: String,
      enum: visitorTypeEnums,
      required: [true, "Visitor type is required."],
    },
    visitorpincode: {
      type: Number,
      required: [true, "Visitor's pincode is required."],
      match: [/^[0-9]{6}$/, "Pincode must be 6 digits"]
    },
    visitorstate: {
      type: String,
      required: [true, "Visitor's state is required."],
      trim: true,
      set: cleanString 
    },
    visitordistrict: {
      type: String,
      required: [true, "Visitor's district is required."],
      trim: true,
      set: cleanString 
    },
    visitoraddress: {
      type: String,
      required: [true, "Visitor's address is required."],
      trim: true,
      maxlength: 250,
      set: cleanString 
    },
    visitororganization: {
      type: String,
      required: [true, "Visitor's organization is required."],
      trim: true,
      maxlength: 50,
      set: cleanString 
    },
    visitLink: {
      type: String,
      trim: true,
    },
    visitoridtype: {
      type: String,
      required: [true, "Visitor's ID type is required."],
      enum: visitorIdTypeEnums,
    },
    visitortidno: {
      type: String,
      required: [true, "Visitor's ID number is required."],
      trim: true,
      select: false,
      minlength: [4, "Visitor's ID number must be at least 4 characters long."],
      maxlength: [20, "Visitor's ID number cannot exceed 20 characters."],
      set: cleanString 
    },
    hostname: {
      type: String,
      required: [true, "Host's name is required."],
      trim: true,
      minlength: [2, "Host Name must be at least 2 characters long."],
      maxlength: [50, "Host Name cannot exceed 50 characters."],
      set: cleanString
    },
    hostdepartment: {
      type: String,
      required: [true, "Host's department is required."],
      trim: true,
      maxlength: 50,
      set: cleanString 
    },
    hostemail: {
      type: String,
      required: [true, "Host's email is required."],
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email address"],
    },
    hostcontact: {
      type: String,
      trim: true,
      required: [true, "Host's contact number is required."],
      match: [/^\d{10}$/, "Host's contact number must be 10 digits."],
    },
    purpose: {
      type: String,
      required: [true, "Purpose of the visit is required."],
      trim: true,
      maxlength: 50,
      set: cleanString 
    },
    visitstatus: {
      type: String,
      required: [true, "Visit status is required."],
      enum: visitStatusEnums,
      default: "Planned",
    },
    draft: {
      type: Boolean,
      required: [true, "Draft status is required."],
    },
    submittedby: {
      type: String,
      required: [true, "Submitted by is required."],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Visitor image is required."],
    },
    priority: {
      type: String,
      enum: visitPriorityEnums,
      default: "Low",
    },
  },
  { timestamps: true }
);


// Create indexes
VisitIndividualSchema.index({ pnr: 1 }, { unique: true }); // Unique index for PNR
VisitIndividualSchema.index({ visitstatus: 1 }); // Index for quick visit status queries
VisitIndividualSchema.index({ visitstart: 1, visitend: 1 }); // Efficient date range queries
VisitIndividualSchema.index({ submittedby: 1, createdAt: -1 });
VisitIndividualSchema.index({ visitororganization: "text", visitoraddress: "text" }); // Searchable text fields

module.exports = mongoose.model("VisitIndividual", VisitIndividualSchema);
