const Mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { generateAccessToken, generateRefreshToken } = require("../auth/sign");
const getUserInfo = require("../lib/getUserInfo");
const Token = require("../schema/token");

const UserSchema = new Mongoose.Schema({
  id: { type: Object },

  username: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["Administrador", "Supervisor", "Operador"],
    default: "Operador",
  },

  city: {
    type: String,
    default: "bog",
  },

  cityName: {
    type: String,
    default: "Bogotá",
  },

  status: {
    type: String,
    enum: ["Activo", "Inactivo"],
    default: "Activo",
  },
});

UserSchema.pre("save", async function () {
  if (this.isModified("password") || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

UserSchema.methods.usernameExists = async function (username) {
  const result = await Mongoose.model("User").find({ username });
  return result.length > 0;
};

UserSchema.methods.isCorrectPassword = async function (password, hash) {
  return await bcrypt.compare(password, hash);
};

UserSchema.methods.createAccessToken = function () {
  return generateAccessToken(getUserInfo(this));
};

UserSchema.methods.createRefreshToken = async function () {
  const refreshToken = generateRefreshToken(getUserInfo(this));

  try {
    await new Token({ token: refreshToken }).save();
    return refreshToken;
  } catch (error) {
    console.error(error);
  }
};

module.exports = Mongoose.model("User", UserSchema);



