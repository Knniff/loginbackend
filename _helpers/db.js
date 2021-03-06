const mongoose = require("mongoose");
const user = require("../users/user.model");
const log = require("./logger");

// activates debug statements for troubleshooting
// mongoose.set("debug", true);
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(
    () => {
      log.logger.info("Database is connected");
    },
    (err) => {
      log.logger.error(`Can not connect to the database${err}`);
    },
  );
mongoose.Promise = global.Promise;

async function dropDB() {
  return mongoose.connection
    .dropCollection("users")
    .catch(() => console.log("No Collection to be dropped"));
}
async function closeConnection() {
  return mongoose.connection.close().catch((err) => console.log(err));
}

module.exports = {
  User: user,
  dropDB,
  closeConnection,
};
