const express = require("express");
const router = express.Router();
const Todo = require("../schema/todo");


const authenticateToken = require("../auth/authenticateToken");


router.get("/", authenticateToken, async (req, res) => {
  try {
    const items = await Todo.find({ idUser: req.user.id });

    return res.json(items);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al obtener los todos" });
  }
});


router.post("/", authenticateToken, async (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const todo = new Todo({
      idUser: req.user.id,
      title: req.body.title,
      completed: false,
    });

    const todoInfo = await todo.save();

    return res.json(todoInfo);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al crear el todo" });
  }
});

module.exports = router;