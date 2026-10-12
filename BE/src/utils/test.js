const VisitsModel = require("../models/Visits.model");

async function test() {
  try {
    const indVisits = await VisitsModel.find().select("visitstatus visitstart visitend");
    console.log("🚀 ~ test ~ indVisits:", indVisits);
  } catch (error) {
    console.log(error);
  }
}

// test();
