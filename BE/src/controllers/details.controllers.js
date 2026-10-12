const VisitIndividual = require("../models/Visits.model");
const {logger} = require("../configs/logger");

async function getAccomodationDetailsByPNR(pnr) {
  try {
    const result = await VisitIndividual.aggregate([
      {
        $match: { pnr: pnr },
      },
      {
        $lookup: {
          from: "accomodationindividuals",
          localField: "pnr",
          foreignField: "pnr",
          as: "accomodationDetails",
        },
      },
    ]);
    let visitDetails = result[0];
    if (!visitDetails) return null;

    delete visitDetails.visitLink;

    // ✅ Mask the Aadhar number (show only last 4 digits)
    if (visitDetails.visitoridtype === "AADHAR" && visitDetails.visitortidno) {
      const id = visitDetails.visitortidno.toString();
      visitDetails.visitortidno = id.replace(/\d(?=\d{4})/g, "*"); // e.g., ************6132
    }
     // ✅ Mask visitor contact (show only last 3 digits)
     if (visitDetails.visitorcontactno) {
      const num = visitDetails.visitorcontactno.toString();
      visitDetails.visitorcontactno = num.replace(/\d(?=\d{3})/g, "*");
    }

    // ✅ Mask host contact (show only last 3 digits)
    if (visitDetails.hostcontact) {
      const hostNum = visitDetails.hostcontact.toString();
      visitDetails.hostcontact = hostNum.replace(/\d(?=\d{3})/g, "*");
    }

    return visitDetails;
  } catch (error) {
    logger.error(error);
    console.log(error);
    throw error;
  }
}

async function getConveyanceDetailsByPNR(pnr) {
  try {
    const result = await VisitIndividual.aggregate([
      {
        $match: { pnr: pnr },
      },
      {
        $lookup: {
          from: "conveyanceindividuals",
          localField: "pnr",
          foreignField: "pnr",
          as: "conveyanceDetails",
        },
      },
    ]);
    let visitDetails = result[0];
    if (!visitDetails) return null;

    delete visitDetails.visitLink;

    // ✅ Mask the Aadhar number (show only last 4 digits)
    if (visitDetails.visitoridtype === "AADHAR" && visitDetails.visitortidno) {
      const id = visitDetails.visitortidno.toString();
      visitDetails.visitortidno = id.replace(/\d(?=\d{4})/g, "*"); // e.g., ************6132
    }

     // ✅ Mask visitor contact (show only last 3 digits)
     if (visitDetails.visitorcontactno) {
      const num = visitDetails.visitorcontactno.toString();
      visitDetails.visitorcontactno = num.replace(/\d(?=\d{3})/g, "*");
    }

    // ✅ Mask host contact (show only last 3 digits)
    if (visitDetails.hostcontact) {
      const hostNum = visitDetails.hostcontact.toString();
      visitDetails.hostcontact = hostNum.replace(/\d(?=\d{3})/g, "*");
    }

    return visitDetails;
  } catch (error) {
    logger.error(error);
    console.error("Error in getConveyanceDetailsByPNR: ", error);
    throw error;
  }
}

async function getCombinedIndDetailsByPNR(pnr) {
  try {
    const result = await VisitIndividual.aggregate([
      {
        $match: { pnr: pnr },
      },
      {
        $lookup: {
          from: "accomodationindividuals",
          localField: "pnr",
          foreignField: "pnr",
          as: "accommodationDetails",
        },
      },
      {
        $lookup: {
          from: "conveyanceindividuals",
          localField: "pnr",
          foreignField: "pnr",
          as: "conveyanceDetails",
        },
      },
    ]);

    // const visitDetails = result[0]; // Assuming only one visit is found for a given PNR
    // const accommodationDetails = result[0]?.accommodationDetails[0] || {}; // Assuming only one accommodation is found for a given PNR
    // const conveyanceDetails = result[0]?.conveyanceDetails[0] || {}; // Assuming only one conveyance is found for a given PNR

    const ResponseValue = {
      visitDetails: {
        arrivalDateTime: result[0].visitstart,
        departureDateTime: result[0].visitend,
        isStaying: result[0].isAccomodationRequired,
        isTraveling: result[0].isTravelRequired,
        firstName: result[0].visitorfirstname,
        lastName: result[0].visitorlastname,
        gender: result[0].visitorgender,
        // age: result[0].visitorage,
       // contact: result[0].visitorcontactno,
        email: result[0].visitoremail,
        pincode: result[0].visitorpincode,
        state: result[0].visitorstate,
        district: result[0].visitordistrict,
        address: result[0].visitoraddress,
        organization: result[0].visitororganization,
        govtIdType: result[0].visitoridtype,
        //govtIdNumber: result[0].visitortidno,
        employee: result[0].hostname,
        officeemail: result[0].hostemail,
        //phoneNumber: result[0].hostcontact,
        deptName: result[0].hostdepartment,
        purpose: result[0].purpose,
      },
      accomodationDetails:
        {
          arrivalDateTime:
            result[0]?.accommodationDetails[0]?.arrivaldateandtime,
          departureDateTime:
            result[0]?.accommodationDetails[0]?.departuredateandtime,
        } || {},
      conveyanceDetails: result[0].isTravelRequired
        ? result[0].isAccomodationRequired
          ? [
              {
                ind_id: result[0]?.conveyanceDetails[0]?._id,
                pickupDateTime:
                  result[0]?.conveyanceDetails[0]?.initialpickupdateandtime,
                pickupLocation:
                  result[0]?.conveyanceDetails[0]?.initiallocation,
                dropOffDateTime:
                  result[0]?.conveyanceDetails[0]?.finaldropoffdateandtime,
                dropOffLocation:
                  result[0]?.conveyanceDetails[0]?.finaldropofflocation,
                driverName: result[0]?.conveyanceDetails[0]?.drivername,
                status: result[0]?.conveyanceDetails[0]?.status,
              },
            ] || []
          : result[0]?.conveyanceDetails[0]?.conveyancedetails.map((item) => ({
              ind_id: item._id,
              pickupDateTime: item.pickupdateandtime,
              pickupLocation: item.pickuplocation,
              dropOffDateTime: item.dropoffdateandtime,
              dropOffLocation: item.dropofflocation,
              driverName: item.drivername,
              status: item.status,
            })) || []
        : [],
    };

    return ResponseValue;

    // return {
    //     visitDetails,
    //     accommodationDetails,
    //     conveyanceDetails
    // }
  } catch (error) {
    logger.error(error);
    console.error("Error in getCombinedIndDetailsByPNR: ", error);
    throw error;
  }
}


// async function getCombinedIndDetailsByPNRTracking(pnr) {
//   try {
//     const result = await VisitIndividual.aggregate([
//       {
//         $match: { pnr: pnr },
//       },
//       {
//         $lookup: {
//           from: "accomodationindividuals",
//           localField: "pnr",
//           foreignField: "pnr",
//           as: "accommodationDetails",
//         },
//       },
//       {
//         $lookup: {
//           from: "conveyanceindividuals",
//           localField: "pnr",
//           foreignField: "pnr",
//           as: "conveyanceDetails",
//         },
//       },
//     ]);

//     const visitDetails = result[0]; // Assuming only one visit is found for a given PNR
//     // const accommodationDetails = result[0]?.accommodationDetails[0] || {}; // Assuming only one accommodation is found for a given PNR
//     // const conveyanceDetails = result[0]?.conveyanceDetails[0] || {}; // Assuming only one conveyance is found for a given PNR

//     // const ResponseValue = {
//     //   visitDetails: {
//     //     arrivalDateTime: result[0].visitstart,
//     //     departureDateTime: result[0].visitend,
//     //     isStaying: result[0].isAccomodationRequired,
//     //     isTraveling: result[0].isTravelRequired,
//     //     firstName: result[0].visitorfirstname,
//     //     lastName: result[0].visitorlastname,
//     //     gender: result[0].visitorgender,
//     //     age: result[0].visitorage,
//     //     contact: result[0].visitorcontactno,
//     //     email: result[0].visitoremail,
//     //     pincode: result[0].visitorpincode,
//     //     state: result[0].visitorstate,
//     //     district: result[0].visitordistrict,
//     //     address: result[0].visitoraddress,
//     //     organization: result[0].visitororganization,
//     //     govtIdType: result[0].visitoridtype,
//     //     govtIdNumber: result[0].visitortidno,
//     //     employee: result[0].hostname,
//     //     officeemail: result[0].hostemail,
//     //     phoneNumber: result[0].hostcontact,
//     //     deptName: result[0].hostdepartment,
//     //     purpose: result[0].purpose,
//     //   },
//     //   accomodationDetails:
//     //     {
//     //       arrivalDateTime:
//     //         result[0]?.accommodationDetails[0]?.arrivaldateandtime,
//     //       departureDateTime:
//     //         result[0]?.accommodationDetails[0]?.departuredateandtime,
//     //     } || {},
//     //   conveyanceDetails: result[0].isTravelRequired
//     //     ? result[0].isAccomodationRequired
//     //       ? [
//     //           {
//     //             ind_id: result[0]?.conveyanceDetails[0]?._id,
//     //             pickupDateTime:
//     //               result[0]?.conveyanceDetails[0]?.initialpickupdateandtime,
//     //             pickupLocation:
//     //               result[0]?.conveyanceDetails[0]?.initiallocation,
//     //             dropOffDateTime:
//     //               result[0]?.conveyanceDetails[0]?.finaldropoffdateandtime,
//     //             dropOffLocation:
//     //               result[0]?.conveyanceDetails[0]?.finaldropofflocation,
//     //             driverName: result[0]?.conveyanceDetails[0]?.drivername,
//     //             status: result[0]?.conveyanceDetails[0]?.status,
//     //           },
//     //         ] || []
//     //       : result[0]?.conveyanceDetails[0]?.conveyancedetails.map((item) => ({
//     //           ind_id: item._id,
//     //           pickupDateTime: item.pickupdateandtime,
//     //           pickupLocation: item.pickuplocation,
//     //           dropOffDateTime: item.dropoffdateandtime,
//     //           dropOffLocation: item.dropofflocation,
//     //           driverName: item.drivername,
//     //           status: item.status,
//     //         })) || []
//     //     : [],
//     // };

//     return visitDetails;

//     // return {
//     //     visitDetails,
//     //     accommodationDetails,
//     //     conveyanceDetails
//     // }
//   } catch (error) {
//     logger.error(error);
//     console.error("Error in getCombinedIndDetailsByPNRTracking: ", error);
//     throw error;
//   }
// }


async function getCombinedIndDetailsByPNRTracking(pnr) {
  try {
    const result = await VisitIndividual.aggregate([
      {
        $match: { pnr: pnr },
      },
      {
        $lookup: {
          from: "accomodationindividuals",
          localField: "pnr",
          foreignField: "pnr",
          as: "accommodationDetails",
        },
      },
      {
        $lookup: {
          from: "conveyanceindividuals",
          localField: "pnr",
          foreignField: "pnr",
          as: "conveyanceDetails",
        },
      },
    ]);

    let visitDetails = result[0];
    if (!visitDetails) return null;

    delete visitDetails.visitLink;

    // ✅ Mask the Aadhar number (show only last 4 digits)
    if (visitDetails.visitoridtype === "AADHAR" && visitDetails.visitortidno) {
      const id = visitDetails.visitortidno.toString();
      visitDetails.visitortidno = id.replace(/\d(?=\d{4})/g, "*"); // e.g., ************6132
    }
 // ✅ Mask visitor contact (show only last 3 digits)
 if (visitDetails.visitorcontactno) {
  const num = visitDetails.visitorcontactno.toString();
  visitDetails.visitorcontactno = num.replace(/\d(?=\d{3})/g, "*");
}

// ✅ Mask host contact (show only last 3 digits)
if (visitDetails.hostcontact) {
  const hostNum = visitDetails.hostcontact.toString();
  visitDetails.hostcontact = hostNum.replace(/\d(?=\d{3})/g, "*");
}
    return visitDetails;
  } catch (error) {
    logger.error(error);
    console.error("Error in getCombinedIndDetailsByPNRTracking: ", error);
    throw error;
  }
}


module.exports = {
  getAccomodationDetailsByPNR,
  getConveyanceDetailsByPNR,
  getCombinedIndDetailsByPNR,
  getCombinedIndDetailsByPNRTracking,
};
