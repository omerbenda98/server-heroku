const CustomError = require("../utils/CostumeError");

const permissionsMiddleware = (isBiz, isAdmin) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new CustomError("must provide userData");
    }
    if (isBiz === req.user.biz && isBiz === true) {
      return next();
    }
    if (isAdmin === req.user.isAdmin && isAdmin === true) {
      return next();
    }

    res.status(401).json({ msg: "you not allowed to edit this card" });
  };
};

module.exports = permissionsMiddleware;
