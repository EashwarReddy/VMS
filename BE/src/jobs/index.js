// // For more feature use "BullMQ" instead of "Agenda"

// const { Agenda } = require("@hokify/agenda");
// const VisitsModel = require("../models/Visits.model");
// const { visitStatusEnums } = require("../enums");
// const VisitsOrgModel = require("../models/VisitsOrg.model");

// const mongoConnectionString =
//   "mongodb://127.0.0.1:27017/visitor-management-system";

// const agenda = new Agenda({ db: { address: mongoConnectionString },collection: 'agendaJobs' });

// agenda.define("changeStatus", async (job) => {
//   try {
//     console.log("job executed!");
//     const indVisits = await VisitsModel.find({
//       draft: false,
//       visitstatus: {
//         $nin: [visitStatusEnums[2],visitStatusEnums[3], visitStatusEnums[4], visitStatusEnums[5]],
//       },
//     });
//     console.log("🚀 ~ agenda.define ~ indVisits:", indVisits);
//     const orgVisits = await VisitsOrgModel.find({
//       draft: false,
//       visitstatus: {
//         $nin: [visitStatusEnums[2],visitStatusEnums[3], visitStatusEnums[4], visitStatusEnums[5]],
//       },
//     });

//     await Promise.all(
//       indVisits.map(async (visit) => {
//         // console.log("🚀 ~ indVisits.map ~ visit:", visit);
//         const now = new Date();
//         // console.log("🚀 ~ indVisits.map ~ now:", now);
//         console.log("🚀 ~ visit ids:", visit.id); 
//         if (now > visit.visitend) {
//           // if visitstatus === "Ongoing" then make it "Completed"
//           if (visit.visitstatus === visitStatusEnums[3])
//             await VisitsModel.findByIdAndUpdate(visit.id, {
//               visitstatus: visitStatusEnums[4],
//             });

//           // if visitstatus === "Planned" || "Approved" then make it "Failed"
//           if (
//             visit.visitstatus === visitStatusEnums[0] ||
//             visit.visitstatus === visitStatusEnums[1]
//           )
//             await VisitsModel.findByIdAndUpdate(visit.id, {
//               visitstatus: visitStatusEnums[5],
//             });
//         }
//       })
//     );

//     // await Promise.all(
//     //   orgVisits.map(async (visit) => {
//     //     // console.log("🚀 ~ indVisits.map ~ visit:", visit);
//     //     const now = new Date();
//     //     //   console.log("🚀 ~ indVisits.map ~ now:", now);

//     //     if (now > visit.visitend) {
//     //       // if visitstatus === "Ongoing" then make it "Completed"
//     //       if (visit.visitstatus === visitStatusEnums[3])
//     //         await VisitsModel.findByIdAndUpdate(visit.id, {
//     //           visitstatus: visitStatusEnums[4],
//     //         });

//     //       // if visitstatus === "Planned" || "Approved" then make it "Failed"
//     //       if (
//     //         visit.visitstatus === visitStatusEnums[0] ||
//     //         visit.visitstatus === visitStatusEnums[1]
//     //       )
//     //         await VisitsModel.findByIdAndUpdate(visit.id, {
//     //           visitstatus: visitStatusEnums[5],
//     //         });
//     //     }
//     //   })
//     // );
//   } catch (error) {
//     console.log(error);
//   }
// });

// (async function () {
//   // IIFE to give access to async/await
//   await agenda.start();

//   agenda.on('start', (job) => {
//     console.log(`Job ${job.attrs.name} starting at ${new Date().toISOString()}`);
//   });
  
//   agenda.on('complete', (job) => {
//     console.log(`Job ${job.attrs.name} completed at ${new Date().toISOString()}`);
//   });
  

//   await agenda.every("1 minutes", "changeStatus");

//   // Alternatively, you could also do:
//   // await agenda.every('*/3 * * * *', 'changeStatus');
// })();

// agenda.on("fail", (err, job) => {
//   console.error(`Agenda Job Failed: ${job.attrs.name}`, err);
// });



// const { Agenda } = require("@hokify/agenda");
//  const VisitsModel = require("../models/Visits.model");
// const { visitStatusEnums } = require("../enums");
// const agenda = new Agenda({
//   db: {
//     address: "mongodb://127.0.0.1:27017/visitor-management-system",
//     collection: "agendaJobs",
//   },
// });

// agenda.define("changeStatus", async (job) => {
//   try {
//     console.log("job executed!");

//     const indVisits = await VisitsModel.find({
//       draft: false,
//       visitstatus: {
//         $nin: [
//           visitStatusEnums[2],
//           visitStatusEnums[4],
//           visitStatusEnums[5],
//         ],
//       },
//     });

//     console.log("🚀 ~ agenda.define ~ indVisits:", indVisits);

//     // process visits
//     await Promise.all(
//       indVisits.map(async (visit) => {
//         const now = new Date();
//         console.log("🚀 ~ visit ids:", visit.id);

//         if (now > visit.visitend) {
//           if (visit.visitstatus === visitStatusEnums[3]) {
//             await VisitsModel.findByIdAndUpdate(visit.id, {
//               visitstatus: visitStatusEnums[4],
//             });
//           }
//           if (
//             visit.visitstatus === visitStatusEnums[0] ||
//             visit.visitstatus === visitStatusEnums[1]
//           ) {
//             await VisitsModel.findByIdAndUpdate(visit.id, {
//               visitstatus: visitStatusEnums[5],
//             });
//           }
//         }
//       })
//     );
//   } catch (error) {
//     console.error("Job error:", error);
//   }
// });

// (async function () {
//   await agenda.start();

//   console.log("🕒 Scheduling job...");

//   // Schedule ONLY if not already scheduled
//   const jobs = await agenda.jobs({ name: "changeStatus" });

//   if (jobs.length === 0) {
//     console.log("⏳ New schedule created...");
//     await agenda.every("1 minute", "changeStatus");
//   } else {
//     console.log("⏩ Job already scheduled, skipping schedule.");
//   }
// })();




const { Agenda } = require("@hokify/agenda");
 const VisitsModel = require("../models/Visits.model");
 const VisitorMovementModel = require("../models/VisitorMovement.model");
const { visitStatusEnums,visitorMovementStatusEnums } = require("../enums");
const agenda = new Agenda({
  db: {
    address: "mongodb://127.0.0.1:27017/visitor-management-system",
    collection: "agendaJobs",
  },
});

agenda.define("changeStatus", async (job) => {
  try {
    console.log("job executed!");

    const indVisits = await VisitsModel.find({
      draft: false,
      visitstatus: {
        $nin: [
          visitStatusEnums[2],
          visitStatusEnums[4],
          visitStatusEnums[5],
        ],
      },
    });

   // console.log("🚀 ~ agenda.define ~ indVisits:", indVisits);

    // process visits
    await Promise.all(
      indVisits.map(async (visit) => {
        const now = new Date();
        console.log("🚀 ~ visit ids:", visit.id);

        if (now > visit.visitend) {
          if (visit.visitstatus === visitStatusEnums[3]) {
            await VisitsModel.findByIdAndUpdate(visit.id, {
              visitstatus: visitStatusEnums[4],
            });
          }
          if (
            visit.visitstatus === visitStatusEnums[0] ||
            visit.visitstatus === visitStatusEnums[1]
          ) {
            await VisitsModel.findByIdAndUpdate(visit.id, {
              visitstatus: visitStatusEnums[5],
            });
          }
        }
      })
    );


    const visitors = await VisitorMovementModel.find({
      status: { $nin: [visitorMovementStatusEnums[1], visitorMovementStatusEnums[3]] },
    });

    console.log("🚀 Found visitors:", visitors.length);

    await Promise.all(
      visitors.map(async (visitor) => {
        const lastMovement = visitor.movements[visitor.movements.length - 1];
        if (!lastMovement) return;

        const now = new Date();

        
        if (!lastMovement.visitOutTime) {
          visitor.status = visitorMovementStatusEnums[1];
        }

        // 2️⃣ Update top-level status to Exited if visitOutTime has passed
        if (lastMovement.visitOutTime) {
          const visitOut = new Date(lastMovement.visitOutTime);
          if (now > visitOut) {
            visitor.status = visitorMovementStatusEnums[1]; // Exited
           // console.log(`✅ Visitor ${visitor._id} status set to Exited`);
          }
        }

        await visitor.save();
      })
    );
  
  } catch (error) {
    console.error("Job error:", error);
  }
});

(async function () {
  await agenda.start();

  console.log("🕒 Scheduling job...");

  // Schedule ONLY if not already scheduled
  const jobs = await agenda.jobs({ name: "changeStatus" });

  if (jobs.length === 0) {
    console.log("⏳ New schedule created...");
    // await agenda.every("1 minute", "changeStatus");
    // 29 18 * * * runs at 18:29 UTC which is 23:59 IST (UTC+5:30)


    await agenda.every("30 minute", 'changeStatus');


  } else {
    console.log("⏩ Job already scheduled, skipping schedule.");
  }
})();
