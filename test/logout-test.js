// require("dotenv").config();
const request = require("supertest");
const app = require("../server");

describe("POST /users/logout", function () {
  let userRefreshToken = null;
  beforeEach(async function () {
    const user = {
      username: "User",
      password: "123456789",
    };
    await request(app)
      .post("/users/login")
      .send(user)
      .then((response) => {
        userRefreshToken = response.body.refreshToken;
      });
  });
  /*
   *
   *   Testing: logging out with valid refreshToken
   *   statusCode: 200
   *
   */
  it("respond with 200 ok, because of valid refreshToken", function (done) {
    const data = {
      refreshToken: userRefreshToken,
    };
    request(app).post("/users/logout").send(data).expect(200, done);
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
