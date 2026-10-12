const { default: mongoose, Mongoose } = require("mongoose");
const socketSchema = mongoose.Schema(
    {
        socketID : {
            type : String
        },
        userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    }, { timestamps: true }
)
module.exports = mongoose.model("SocketID", socketSchema);

