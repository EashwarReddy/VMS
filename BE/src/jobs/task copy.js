const { connectDB } = require("../db/connectDB");
const logger = require("../configs/logger");
const { visitStatusEnums } = require("../enums");
const VisitsModel = require("../models/Visits.model");
const { default: mongoose } = require("mongoose");

(async function () {
  try {
    await connectDB();
    const indVisits = await VisitsModel.find({
      draft: false,
      visitstatus: {
        $nin: [visitStatusEnums[2], visitStatusEnums[4], visitStatusEnums[5]],
      },
    });

    await Promise.all(
      indVisits.forEach(async (visit) => {
        // console.log("🚀 ~ indVisits.map ~ visit:", visit);
        const now = new Date();
        console.log("🚀 ~ indVisits.map ~ now:", now);
        console.log("visit.visitstart: ", visit.visitstart);
        console.log("visit.visitend: ", visit.visitend);
        
        if (now < visit.visitend) {
          console.log(
            "🚀 ~ indVisits.map ~ now < visit.visitend:",
            now < visit.visitend
          );
          //   if (visit.visitstatus === visitStatusEnums[3])
          //     // if visitstatus === "Ongoing" then make it "Completed"
          //     await VisitsModel.findByIdAndUpdate(visit.id, {
          //       visitstatus: visitStatusEnums[4],
          //     });

          //   // if visitstatus === "Planned" || "Approved" then make it "Failed"
          //   if (
          //     visit.visitstatus === visitStatusEnums[0] ||
          //     visit.visitstatus === visitStatusEnums[1]
          //   )
          //     await VisitsModel.findByIdAndUpdate(visit.id, {
          //       visitstatus: visitStatusEnums[5],
          //     });
        }
      })
    );
    console.log("task executed!");
    process.exit(0); //To indicate worker thread that task is done and exit
  } catch (error) {
    console.log(error);
    logger.error(error);
    process.exit(0); //To indicate worker thread that task is done and exit
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
    process.exit(0); //To indicate worker thread that task is done and exit
  }
})();
