const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../_helpers/db");
const Role = require("../_helpers/role");
const ErrorHelper = require("../_helpers/error-helper");

const { User } = db;
const refreshTokens = [];

async function login({ username, password }) {
  const user = await User.findOne({ username });
  if (user && bcrypt.compareSync(password, user.hash)) {
    const accessToken = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.ACCESSTOKENSECRET,
      { expiresIn: "25m" },
    );
    const refreshToken = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.REFRESHTOKENSECRET,
    );
    refreshTokens.push(refreshToken);
    const { hash, ...userWithoutHash } = user.toObject();
    return {
      ...userWithoutHash,
      accessToken,
      refreshToken,
    };
  }
  throw new ErrorHelper(
    "Unauthorized",
    401,
    "Username or Password is incorrect.",
  );
}

async function logout(refreshToken) {
  const index = refreshTokens.findIndex(
    (element) => element === refreshToken,
  );
  refreshTokens.splice(index, 1);
}

async function tokenRefresh(refreshToken) {
  if (!refreshTokens.includes(refreshToken)) {
    throw new ErrorHelper(
      "Unauthorized",
      401,
      "The refresh token is invalid.",
    );
  }

  const tokens = jwt.verify(
    refreshToken,
    process.env.REFRESHTOKENSECRET,
    (err, user) => {
      if (err) {
        throw new ErrorHelper(
          "Unauthorized",
          401,
          "The refresh token is invalid.",
        );
      }

      const accessToken = jwt.sign(
        { sub: user.sub, role: user.role },
        process.env.ACCESSTOKENSECRET,
        { expiresIn: "25m" },
      );

      return {
        accessToken,
        refreshToken,
      };
    },
  );
  return tokens;
}

async function getAll() {
  return User.find().select("-hash");
}

async function getById(id) {
  const user = await User.findById(id).select("-hash");
  if (user) {
    return user;
  }
  throw new ErrorHelper(
    "Not Found",
    404,
    "Wrong ID or User deleted.",
  );
}

async function create(userParam) {
  // look if username is free
  if (await User.findOne({ username: userParam.username })) {
    throw new ErrorHelper(
      "Not Unique",
      500,
      `Username ${userParam.username} is already taken`,
    );
  }

  const user = new User(userParam);
  // hash password
  if (!("role" in userParam)) {
    user.role = JSON.stringify(Role.User);
  }
  if (userParam.password) {
    user.hash = bcrypt.hashSync(userParam.password, 10);
  }

  await user.save();
}

async function update(id, userParam) {
  const user = await User.findById(id);
  // validate
  if (user.username !== userParam.username) {
    if (await User.findOne({ username: userParam.username })) {
      throw new ErrorHelper(
        "Not Unique",
        500,
        `Username ${userParam.username} is already taken`,
      );
    }
  }
  // hash password
  user.hash = bcrypt.hashSync(userParam.password, 10);

  // copy userParam properties to user
  Object.assign(user, userParam);
  await user.save();
}

async function deleter(id) {
  await User.findByIdAndDelete(id);
}

module.exports = {
  login,
  logout,
  tokenRefresh,
  getAll,
  getById,
  create,
  update,
  delete: deleter,
};
