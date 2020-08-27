const express = require("express");
const {
  loginValidationRules,
  registerValidationRules,
  updateValidationRules,
  checkId,
  checkToken,
  checkRefreshToken,
  validate,
} = require("../_helpers/validator");
const userService = require("./user.service");
const { authorize, authenticate } = require("../_helpers/authorize");
const ErrorHelper = require("../_helpers/error-helper");

const router = express.Router();

function userCheck(req) {
  const currentUser = req.user;
  currentUser.role = JSON.parse(currentUser.role);
  // only allow users with a rank higher then process.env.RANKCUTOFF to change/see other users
  if (
    req.params.id !== currentUser.sub &&
    currentUser.role.rank < Number(process.env.RANKCUTOFF)
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
    .then((user) => res.json(user))
    .catch((err) => next(err));
}

function register(req, res, next) {
  userService
    .create(req.body)
    .then(() => res.json({}))
    .catch((err) => next(err));
}

function logout(req, res, next) {
  userService
    .logout(req.body.refreshToken)
    .then(() => res.json({}))
    .catch((err) => next(err));
}

function tokenRefresh(req, res, next) {
  userService
    .tokenRefresh(req.body.refreshToken)
    .then((token) => res.json(token))
    .catch((err) => next(err));
}

function getAll(req, res, next) {
  userService
    .getAll()
    .then((users) => res.json(users))
    .catch((err) => next(err));
}

function getById(req, res, next) {
  userCheck(req);
  userService
    .getById(req.params.id)
    .then((user) => res.json(user))
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
// public routes
router.post("/login", loginValidationRules(), validate, login);
router.post(
  "/register",
  registerValidationRules(),
  validate,
  register,
);
router.post("/logout", checkRefreshToken(), validate, logout);
router.post("/refresh", checkRefreshToken(), validate, tokenRefresh);
// admin only
router.get(
  "/",
  checkToken(),
  validate,
  authenticate,
  authorize(100),
  getAll,
);
// all logged in users
router.get(
  "/:id",
  checkToken(),
  checkId(),
  validate,
  authenticate,
  authorize(),
  getById,
);
router.put(
  "/:id",
  checkToken(),
  updateValidationRules(),
  validate,
  authenticate,
  authorize(),
  update,
);
router.delete(
  "/:id",
  checkToken(),
  checkId(),
  validate,
  authenticate,
  authorize(),
  deleter,
);

module.exports = router;
