const normalizeUser = (user) => {
  return {
    ...user,
    middleName: user.middleName || "",
    imageUrl:
      user.imageUrl ||
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    imageAlt: user.imageAlt || "Default profile image",
    state: user.state || "",
    zipCode: user.zipCode || "",
  };
};

module.exports = normalizeUser;
