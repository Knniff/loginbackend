const jwt = require("jsonwebtoken");
const ErrorHelper = require("./error-helper");
const userService = require("../users/user.service");
// const Role = require("./role");

function authorize(requiredrank = 0) {
  return function authorizer(req, res, next) {
    const user = userService.getById(req.user.sub);
    if (!user) {
      throw new ErrorHelper(
        "Not Found",
        404,
        "The Token belongs to a deleted User.",
      );
    }
    const userrole = JSON.parse(req.user.role);

    if (userrole.rank >= requiredrank) {
      return next();
    }
    throw new ErrorHelper(
      "Unauthorized",
      401,
      "You dont have a role with the required Permissions for this.",
    );
  };
}

module.exports = authorize;
