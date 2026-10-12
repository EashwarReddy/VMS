const genderEnums = ["Male", "Female", "Other"];

const userProviderEnums = ["local", "ldap", "google", "mobile"];

const visitStatusEnums = [
  "Planned",
  "Approved",
  "Cancelled",
  "Ongoing",
  "Completed",
  "Failed",
];

const visitorTypeEnums = [
  "Visitor(CDAC)",
  "Visitor(Other Organization)",
  "Service Provider",
  "Worker",
];

const visitPriorityEnums = ["High", "Mid", "Low"];

const accomodationStatusEnums = ["Planned", "Completed", "Cancelled"];

const conveyanceStatusEnums = [
  "Pre-Planned",
  "Planned",
  "Completed",
  "Cancelled",
];

const visitorMovementStatusEnums = [
  "In Campus",
  "Exited",
  "Pending",
  "Blocked",
];

const visitorIdTypeEnums = [
  "AADHAR",
  "PAN",
  "VOTERID",
  "DRIVING_LICENSE",
  "ORGANIZATION_ID",
  "PASSPORT",
];

module.exports = {
  genderEnums,
  userProviderEnums,
  visitStatusEnums,
  visitorTypeEnums,
  visitPriorityEnums,
  accomodationStatusEnums,
  conveyanceStatusEnums,
  visitorMovementStatusEnums,
  visitorIdTypeEnums,
};
