const createError = require("http-errors");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const dbConfig = require("./configs/db.config");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const User = require("./models/user.model");
const bcrypt = require("bcryptjs");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

/**
 * DB Connection initialization
 */

mongoose.connect(dbConfig.DB_URL);
const db = mongoose.connection;
db.on("error", () => {
  console.log("error while connecting to DB");
});
db.once("open", () => {
  console.log("connected to Mongo DB ");
  init();
});

//routing
app.use("/", indexRouter);
app.use("/users", usersRouter);
require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);
require("./routes/ticket.routes")(app);

/**
 *
 * @returns
 * This method is for the demonstration purpose,
 * ideally one ADMIN user should have been created in the backend
 */
async function init() {
  const user = await User.findOne({ userId: "admin" });

  if (user) {
    console.log("Admin user already present");
    return;
  }

  try {
    user = await User.create({
      name: "Prathamesh",
      userId: "admin",
      email: "prathmeshlakhpaty@gmail.com",
      userType: "ADMIN",
      password: bcrypt.hashSync("Admin@123", 8),
    });
    console.log(user);
  } catch (e) {
    console.log(e.message);
  }
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
