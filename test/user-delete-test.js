// require("dotenv").config();
const request = require("supertest");
const app = require("../server");

describe("DELETE /users/", function () {
  let adminToken = null;
  let userToken = null;
  let adminId = null;
  let userId = null;
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
        adminToken = response.body.accessToken;
        adminId = response.body._id;
      });
    await request(app)
      .post("/users/login")
      .send(user)
      .then((response) => {
        userToken = response.body.accessToken;
        userId = response.body._id;
      });
  });

  /*
   *
   *   Testing: user deleting himself
   *   statusCode: 200
   *
   */
  it("respond with 200 ok, because he is allowed to delete himself", function (done) {
    request(app)
      .delete(`/users/${userId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200, done);
  });
  /*
   *
   *   Testing: user deleting another user
   *   statusCode: 403
   *
   *
   */
  it("respond with 403 forbidden, because a standard user cant delete other users", function (done) {
    request(app)
      .delete(`/users/${adminId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(
        403,
        {
          Error: "Forbidden",
          message:
            "Forbidden for standard User, if its not your own account.",
        },
        done,
      );
  });
  /*
   *
   *   Testing: admin deleting another users
   *   statusCode: 200
   *
   */
  it("respond with 200 ok, because admins are allowed to delete all users", function (done) {
    request(app)
      .delete(`/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200, done);
  });
});
