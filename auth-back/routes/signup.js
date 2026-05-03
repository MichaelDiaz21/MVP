const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../schema/user");
const { jsonResponse } = require("../lib/jsonResponse");

const router = express.Router();

router.post("/", async function (req, res) {
  const { username, password, name, role, city, cityName } = req.body;

  if (!username || !password || !name || !role) {
    return res.status(409).json(
      jsonResponse(409, {
        error: "username, password, name and role are required",
      })
    );
  }

  try {
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(409).json(
        jsonResponse(409, {
          error: "username already exists",
        })
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password,
      name,
      role,
      city: city || "bog",
      cityName: cityName || "Bogotá",
    });

    await user.save();

    return res.json(
      jsonResponse(200, {
        message: "User created successfully",
      })
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(
      jsonResponse(500, {
        error: "Error creating user",
      })
    );
  }
});

module.exports = router;