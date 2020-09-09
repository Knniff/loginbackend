// require("dotenv").config();
const request = require("supertest");
const app = require("../server");
const { generateTOTP } = require("../_helpers/mfa");

describe("POST /users/mfa", function () {
  let userToken = null;
  beforeEach(async function () {
    const user = {
      username: "User",
      password: "123456789",
    };
    await request(app)
      .post("/users/login")
      .send(user)
      .then((response) => {
        userToken = response.body.accessToken;
      });
  });
  /*
   *
   *   Testing: activating mfa
   *   statusCode: 401
   *
   */
  it("respond with 401 unauthorized, because totp wrong", function (done) {
    request(app)
      .post("/users/mfa/generate")
      .set("Authorization", `Bearer ${userToken}`);
    const totp = "000000";
    request(app)
      .post("/users/mfa/generate")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ token: totp })
      .expect(
        401,
        {
          Error: "Unauthorized",
          message:
            "TOTP Token is incorrect. Mfa Activation process exited.",
        },
        done,
      );
  });
  /*
   *
   *   Testing: activating mfa
   *   statusCode: 200
   *
   */
  it("respond with 200 ok, because mfa got activated", function (done) {
    let userSecret = null;
    request(app)
      .post("/users/mfa/generate")
      .set("Authorization", `Bearer ${userToken}`)
      .then((response) => {
        userSecret = response.body.userSecret;
      });
    const totp = generateTOTP(userSecret, 0);
    request(app)
      .post("/users/mfa/enable")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ token: totp })
      .expect(200, done);
  });
  /*
   *
   *   Testing: deactivating mfa
   *   statusCode: 200
   *
   */
  it("respond with 200 ok, because mfa got deactivated", function (done) {
    let userSecret = null;
    request(app)
      .post("/users/mfa/generate")
      .set("Authorization", `Bearer ${userToken}`)
      .then((response) => {
        userSecret = response.body.userSecret;
      });
    const totp = generateTOTP(userSecret, 0);
    request(app)
      .post("/users/mfa/enable")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ token: totp });
    request(app)
      .post("/users/mfa/disable")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ token: totp })
      .expect(200, done);
  });
  /*
   *
   *   Testing: activating mfa and using it
   *   statusCode: 200
   *
   */
  it("respond with 200 ok, because mfa got activated and used", function (done) {
    let userRefreshToken = null;
    let userSecret = null;
    const user = {
      username: "User",
      password: "123456789",
    };
    request(app)
      .post("/users/mfa/generate")
      .set("Authorization", `Bearer ${userToken}`)
      .then((response) => {
        userSecret = response.body.userSecret;
      });
    const totp = generateTOTP(userSecret, 0);
    request(app)
      .post("/users/mfa/enable")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ token: totp });

    request(app)
      .post("/users/login")
      .send(user)
      .then((response) => {
        userRefreshToken = response.body.refreshToken;
      });
    request(app)
      .post("/users/mfa/verify")
      .send({ refreshToken: userRefreshToken, totp })
      .expect(200, done);
  });
  /*
   *
   *   Testing: mfa got activated and used but wrong totp
   *   statusCode: 200
   *
   */
  it("respond with 401 Unauthorized, because mfa got activated and used but wrong totp", function (done) {
    let userRefreshToken = null;
    let userSecret = null;
    const user = {
      username: "User",
      password: "123456789",
    };
    request(app)
      .post("/users/mfa/generate")
      .set("Authorization", `Bearer ${userToken}`)
      .then((response) => {
        userSecret = response.body.userSecret;
      });
    const totp = generateTOTP(userSecret, 0);
    request(app)
      .post("/users/mfa/enable")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ token: totp });

    request(app)
      .post("/users/login")
      .send(user)
      .then((response) => {
        userRefreshToken = response.body.refreshToken;
      });

    request(app)
      .post("/users/mfa/verify")
      .send({ refreshToken: userRefreshToken, totp: "000000" })
      .expect(401, done);
  });
});
