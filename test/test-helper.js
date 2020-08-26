// require("dotenv").config();
// const request = require("supertest");
// const app = require("../server");
const { dropDB } = require("../_helpers/db");
const userService = require("../users/user.service");
const Role = require("../_helpers/role");

beforeEach(async function () {
  const user = {
    username: "User",
    password: "123456789",
    firstName: "Max",
    lastName: "Mustermann",
  };
  const admin = {
    username: "Admin",
    password: "123456789",
    firstName: "Maxim",
    lastName: "Markow",
    role: JSON.stringify(Role.Admin),
  };
  await dropDB();
  await userService.create(user).catch((err) => console.log(err));
  await userService.create(admin).catch((err) => console.log(err));
});

after(async function () {
  await dropDB();
});
