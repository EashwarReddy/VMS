const { default: mongoose } = require("mongoose");

const roleSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required."],
      unique: true,
      trim: true, // Removes unnecessary spaces
      minlength: [3, "Role name must be at least 3 characters long."],
      maxlength: [50, "Role name cannot exceed 50 characters."],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);
