const express = require("express");
const router = express.Router();
const Token = require("../schema/token");

router.delete("/", async function (req, res) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(400).json({ error: "Invalid token format" });
    }

    const refreshToken = authHeader.split(" ")[1];

    console.log("TOKEN:", refreshToken);

    const result = await Token.deleteOne({ token: refreshToken });

    console.log("DELETE RESULT:", result);

    return res.json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;