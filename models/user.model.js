const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    lowercase: true,
    minLength: 10,
    unique: true,
  },
  createdAt: {
    type: Date,
    immutable: true,
    default: () => {
      return Date.now();
    },
  },
  updatedAt: {
    type: Date,
    default: () => {
      return Date.now();
    },
  },
  userType: {
    type: String,
    enum: ["CUSTOMER", "ENGINEER", "ADMIN"],
    required: true,
    default: "CUSTOMER",
  },
  userStatus: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    required: true,
    default: function () {
      if (this.userType === "CUSTOMER") {
        return "APPROVED";
      } else {
        return "PENDING";
      }
    },
  },
  ticketsCreated: {
    type: [mongoose.SchemaTypes.ObjectId],
    ref: "Ticket",
  },
  ticketsAssigned: {
    type: [mongoose.SchemaTypes.ObjectId],
    ref: "Ticket",
  },
});

userSchema.pre("save", async function (next) {
  const existingAdminCount = await this.constructor.countDocuments({
    userType: "ADMIN",
  });
  if (existingAdminCount === 0 && this.userType === "ADMIN") {
    this.userStatus = "APPROVED";
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
