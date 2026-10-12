const { default: mongoose } = require("mongoose");
const { genderEnums, userProviderEnums } = require("../enums");
const { cleanString } = require("../utils/sanitizer");
const validator = require("validator");
const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is required."],
      trim: true,
      minlength: [2, "First Name must be at least 2 characters long."],
      maxlength: [50, "First Name cannot exceed 50 characters."],
      set: cleanString
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, "Last Name cannot exceed 50 characters."],
      default: null,
      set: cleanString
    },
    gender: {
      type: String,
      required: [true, "Gender is required."],
      enum: genderEnums,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email address"]
    },
    mobileNo: {
      type: String,
      required: [true, "Mobile number is required."],
      trim: true,
      match: [/^\d{10}$/, "Mobile number must be exactly 10 digits."],
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required."],
      match: [/^[0-9]{6}$/, "Pincode must be 6 digits"]
    },
    state: {
      type: String,
      required: [true, "State is required."],
      trim: true,
      set: cleanString 
    },
    district: {
      type: String,
      required: [true, "District is required."],
      trim: true,
      set: cleanString 
    },
    address: {
      type: String,
      required: [true, "Address is required."],
      trim: true,
      minlength: [5, "Address must be at least 5 characters long."],
      maxlength: [255, "Address cannot exceed 255 characters."],
      set: cleanString 
    },
    organisation: {
      type: String,
      required: [true, "Organisation is required."],
      trim: true,
      maxlength:50,
      set: cleanString 
    },
    referenceEmail: {
      type: String,
      required: [true, "Reference email is required."],
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email address"]
    },
    password: {
      type: String,
      default: null,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: [true, "Role is required."],
    },
    accessToken: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    currentSessionId: {
      type: String,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    provider: {
      type: String,
      enum: userProviderEnums,
      default: "local",
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date,
      default: null
    },
    lastFailedLogin: {
      type: Date
    },
    profilePhoto: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
