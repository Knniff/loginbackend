// require("dotenv").config();
const request = require("supertest");
const app = require("../server");

describe("POST /users/refresh", function () {
  let adminRefreshToken = null;
  let userRefreshToken = null;
  beforeEach(async function () {
    const user = {
      username: "User",
      password: "123456789",
    };
    const admin = {
      username: "Admin",
      password: "123456789",
    };
    await request(app)
      .post("/users/login")
      .send(admin)
      .then((response) => {
        adminRefreshToken = response.body.refreshToken;
      });
    await request(app)
      .post("/users/login")
      .send(user)
      .then((response) => {
        userRefreshToken = response.body.refreshToken;
      });
  });
  /*
   *
   *   Testing: refreshing token with valid refreshToken
   *   statusCode: 200
   *
   */
  it("respond with 200 ok, because of valid refreshToken", function (done) {
    const data = {
      refreshToken: adminRefreshToken,
    };
    request(app).post("/users/refresh").send(data).expect(200, done);
  });
  /*
   *
   *   Testing: refreshing token with valid refreshToken
   *   statusCode: 200
   *
   */
  it("respond with 200 ok, because of valid refreshToken", function (done) {
    const data = {
      refreshToken: userRefreshToken,
    };
    request(app).post("/users/refresh").send(data).expect(200, done);
  });
  /*
   *
   *   Testing: refreshing token with invalid refreshToken
   *   statusCode: 200
   *
   */
  it("respond with 401 Unauthorized, because of invalid refreshToken either because its malformed or logged out", function (done) {
    const data = {
      refreshToken:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZjQ2Nzg3MDY3YjhlMzE2YjVmMjc5ZmEiLCJyb2xlIjoie1wibmFtZVwiOlwiVXNlclwiLFwicmFua1wiOlwiMVwifSIsImlhdCI6MTU5ODQ1Mzg3N30.gPLtiP590kdbYfb267Zc3Gm7z5oDfNcuSS0XI9rJSH",
    };
    request(app).post("/users/refresh").send(data).expect(
      401,
      {
        Error: "Unauthorized",
        message: "The refresh token is invalid.",
      },
      done,
    );
  });
  /*
   *
   *   Testing: refreshing token with invalid refreshToken
   *   statusCode: 200
   *
   */
  it("respond with 422 Unprocessable Entity, because of no refreshToken", function (done) {
    const data = {
      refreshToken: "",
    };
    request(app)
      .post("/users/refresh")
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
