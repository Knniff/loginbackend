const express = require("express");
const expressJwt = require("express-jwt");
const {
  loginValidationRules,
  registerValidationRules,
  updateValidationRules,
  checkId,
  checkToken,
  validate,
} = require("../_helpers/validator");
const userService = require("./user.service");
const authorize = require("../_helpers/authorize");
const ErrorHelper = require("../_helpers/error-helper");

const router = express.Router();

function userCheck(req) {
  let currentUser = req.user;
  currentUser.role = JSON.parse(currentUser.role);
  // only allow users with a rank higher then process.env.RANKCUTOFF to change/see other users
  if (
    req.params.id !== currentUser.sub &&
    currentUser.role.rank <= Number(process.env.RANKCUTOFF)
  ) {
    throw new ErrorHelper(
      "Forbidden",
      403,
      "Forbidden for standard User, if its not your own account.",
    );
  }
}

function login(req, res, next) {
  userService
    .login(req.body)
    .then((user) =>
      user
        ? res.json(user)
        : next(
            new ErrorHelper(
              "Unauthorized",
              401,
              "Username or Password is incorrect.",
            ),
          ),
    )
    .catch((err) => next(err));
}

function register(req, res, next) {
  userService
    .create(req.body)
    .then(() => res.json({}))
    .catch((err) => next(err));
}

function getAll(req, res, next) {
  userService
    .getAll()
    .then((users) => res.json(users))
    .catch((err) => next(err));
}

// eslint-disable-next-line consistent-return
function getById(req, res, next) {
  userCheck(req);

  userService
    .getById(req.params.id)
    .then((user) =>
      user
        ? res.json(user)
        : next(
            new ErrorHelper(
              "Not Found",
              404,
              "Wrong ID or User deleted.",
            ),
          ),
    )
    .catch((err) => next(err));
}

function update(req, res, next) {
  userCheck(req);

  userService
    .update(req.params.id, req.body)
    .then(() => res.json({}))
    .catch((err) => next(err));
}

function deleter(req, res, next) {
  userCheck(req);

  userService
    .delete(req.params.id)
    .then(() => res.json({}))
    .catch((err) => next(err));
}

// routes
router.post("/login", loginValidationRules(), validate, login); // public routes
router.post(
  "/register",
  registerValidationRules(),
  validate,
  register,
);
router.get(
  "/",
  checkToken(),
  validate,
  expressJwt({ secret: process.env.SECRET }),
  authorize(100),
  getAll,
); // admin only
router.get(
  "/:id",
  checkToken(),
  checkId(),
  validate,
  expressJwt({ secret: process.env.SECRET }),
  authorize(),
  getById,
); // all logged in users
router.put(
  "/:id",
  checkToken(),
  updateValidationRules(),
  validate,
  expressJwt({ secret: process.env.SECRET }),
  authorize(),
  update,
);
router.delete(
  "/:id",
  checkToken(),
  checkId(),
  validate,
  expressJwt({ secret: process.env.SECRET }),
  authorize(),
  deleter,
);

module.exports = router;
