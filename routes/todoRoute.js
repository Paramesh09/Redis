const router = require("express").Router()
const { createTodo,
    getAllTodos,
    updateTodo,
    deleteTodo,
    getTodoById } = require("../controller")

router.post("/", createTodo)
router.get("/", getAllTodos)
router.get("/:id", getTodoById)
router.put("/:id", updateTodo)
router.delete("/:id", deleteTodo)

module.exports = router