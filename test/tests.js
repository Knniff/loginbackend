/* eslint-disable no-undef */
/* eslint-disable func-names */
const request = require("supertest");
const bcrypt = require("bcryptjs");
const Role = require("../_helpers/role");
const { dropDB, User } = require("../_helpers/db");
const app = require("../server");

const userLoginData = {
  username: "User",
  password: "123456789",
};
const adminLoginData = {
  username: "User",
  password: "123456789",
};
async function createUser() {
  const userParam = {
    username: "User",
    password: "123456789",
    firstName: "Max",
    lastName: "Mustermann",
    role: JSON.stringify(Role.User),
  };
  const user = new User(userParam);

  user.hash = bcrypt.hashSync(userParam.password, 10);

  await user.save();
  console.log("User saved!");
}

async function createAdmin() {
  const userParam = {
    username: "Admin",
    password: "123456789",
    firstName: "Maxim",
    lastName: "Markow",
    role: JSON.stringify(Role.Admin),
  };
  const user = new User(userParam);

  user.hash = bcrypt.hashSync(userParam.password, 10);

  await user.save();
  console.log("Admin saved!");
}

async function login(user) {
  return request(app).post("/users/login").send(user);
}

describe("/users", function () {
  afterEach(async function () {
    await dropDB();
  });

  before(async function () {
    await dropDB();
  });
  describe("DELETE /", function () {
    describe("Successes", function () {
      it("respond with 200 ok, because admins are allowed to delete all users", function (done) {
        createAdmin().then(
          createUser().then(
            login(userLoginData).then((user) => {
              login(adminLoginData).then((admin) => {
                request(app)
                  .delete(`/users/${user.body._id}`)
                  .set(
                    "Authorization",
                    `Bearer ${admin.body.accessToken}`,
                  )
                  .expect(200, done);
              });
            }),
          ),
        );
      });
      it("respond with 200 ok, because he is allowed to delete himself", function (done) {
        createUser().then(
          login(userLoginData).then((responseBody) => {
            request(app)
              .delete(`/users/${responseBody.body._id}`)
              .set(
                "Authorization",
                `Bearer ${responseBody.body.accessToken}`,
              )
              .expect(200, done);
          }),
        );
      });
    });
    describe("Errors", function () {
      it("respond with 403 forbidden, because a standard user cant delete other users", function (done) {
        createUser().then(
          login(userLoginData).then((responseBody) => {
            request(app)
              .delete("/users/0000000000006204aefc242c")
              .set(
                "Authorization",
                `Bearer ${responseBody.body.accessToken}`,
              )
              .expect(
                403,
                {
                  Error: "Forbidden",
                  message:
                    "Forbidden for your rank, if its not your own account.",
                },
                done,
              );
          }),
        );
      });
    });
  });
  describe("POST /logout", function () {
    describe("Successes", function () {
      it("respond with 200 ok, because of valid refreshToken", function (done) {
        createUser().then(
          login(userLoginData).then((responseBody) => {
            const refreshToken = {
              refreshToken: responseBody.body.refreshToken,
            };
            request(app)
              .post("/users/logout")
              .send(refreshToken)
              .expect(200, done);
          }),
        );
      });
    });
    describe("Errors", function () {
      it("respond with 401 Unauthorized, because of invalid refreshToken", function (done) {
        const data = {
          refreshToken:
            "1fe56w1f56we1f00000056a1w6f156awe1f56w1e6f1awe56f1aw51f6aw1f561aew65f165awe1f561ew56",
        };
        request(app).post("/users/logout").send(data).expect(
          401,
          {
            Error: "Unauthorized",
            message: "The refresh token is invalid.",
          },
          done,
        );
      });
      it("respond with 422 Unprocessable Entity, because of no refreshToken", function (done) {
        const data = {
          refreshToken: "",
        };
        request(app)
          .post("/users/logout")
          .send(data)
          .expect(
            422,
            {
              Error: "Validation Error",
              message: [
                {
                  refreshToken: "Not Allowed to be empty.",
                },
                {
                  refreshToken: "Too short for a JWT.",
                },
              ],
            },
            done,
          );
      });
    });
  });
  describe("POST /login", function () {
    describe("Successes", function () {
      it("respond with 200 ok, because of correct input", function (done) {
        createUser().then(
          request(app)
            .post("/users/login")
            .send(userLoginData)
            .expect(200, done),
        );
      });
    });
    describe("Errors", function () {
      it("respond with 401 Unauthorized, because of wrong password", function (done) {
        const loginData = {
          username: "User",
          password: "1234563249",
        };
        createUser().then(
          request(app).post("/users/login").send(loginData).expect(
            401,
            {
              Error: "Unauthorized",
              message: "Username or Password is incorrect.",
            },
            done,
          ),
        );
      });
      it("respond with 422 malformed, because of no input", function (done) {
        request(app)
          .post("/users/login")
          .expect(
            422,
            {
              Error: "Validation Error",
              message: [
                {
                  username: "Not Allowed to be empty.",
                },
                {
                  username: "Has to exist.",
                },
                {
                  password: "Not Allowed to be empty.",
                },
                {
                  password: "Has to exist.",
                },
                {
                  password:
                    "Too short or too long, needs atleast 8 characters and not more then 25.",
                },
              ],
            },
            done,
          );
      });
      it("respond with 422 malformed, because of too short password", function (done) {
        const loginData = {
          username: "User",
          password: "123456",
        };
        request(app)
          .post("/users/login")
          .send(loginData)
          .expect(
            422,
            {
              Error: "Validation Error",
              message: [
                {
                  password:
                    "Too short or too long, needs atleast 8 characters and not more then 25.",
                },
              ],
            },
            done,
          );
      });
      it("respond with 422 malformed, because of too long password", function (done) {
        const loginData = {
          username: "User",
          password:
            "123456159198464fdeasf48es64fgsed86fg4ews6f84sed8f4se64f86es",
        };
        request(app)
          .post("/users/login")
          .send(loginData)
          .expect(
            422,
            {
              Error: "Validation Error",
              message: [
                {
                  password:
                    "Too short or too long, needs atleast 8 characters and not more then 25.",
                },
              ],
            },
            done,
          );
      });
      it("respond with 422 malformed, because of too long username", function (done) {
        const loginData = {
          username:
            "Usefwefwefgwefjuiwenfiuoawefnbzuiaeowhfiewzqghfrzuoagwerofzugewaqzurwaezuir",
          password: "123456789",
        };
        request(app)
          .post("/users/login")
          .send(loginData)
          .expect(
            422,
            {
              Error: "Validation Error",
              message: [
                {
                  username: "Too long, not more then 25 characters.",
                },
              ],
            },
            done,
          );
      });
    });
  });
});
