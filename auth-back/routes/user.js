const express = require("express");
const router = express.Router();
const User = require("../schema/user");
const authenticateToken = require("../auth/authenticateToken");

// 🔹 Obtener todos los usuarios
router.get("/", authenticateToken, async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
});

// 🔹 Actualizar usuario
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { role, city, cityName, status } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        role,
        city,
        cityName,
        status,
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error actualizando usuario" });
  }
});

// 🔹 Eliminar usuario
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error eliminando usuario" });
  }
});

module.exports = router;