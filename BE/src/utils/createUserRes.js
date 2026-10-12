function createUserRes(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    // DOB: user.DOB,
    gender: user.gender,
    email: user.email,
    mobileNo: user.mobileNo,
    pincode: user.pincode,
    state: user.state,
    city: user.city,
    address: user.address,
    organisation: user.organisation,
    referenceEmail: user.referenceEmail,
    role: user.role,
    accessToken: user.accessToken,
    isEmailVerified: user.isEmailVerified,
    isEnabled: user.isEnabled,
    provider: user.provider,
    lastLogin: user.lastLogin,
  };
}

module.exports = {
  createUserRes,
};
