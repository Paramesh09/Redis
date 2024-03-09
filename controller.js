const redisClient = require('./redisService');
const model = require('./models/index');
const Todo = model.todo;

// Create a new todo
async function createTodo(req, res) {
    const { title, description } = req.body;
    try {
        // Create todo in database
        const todo = await Todo.create({ title, description });

        // Cache the todo in Redis
        redisClient.set(`todo:${todo.id}`, JSON.stringify(todo));

        return res.status(201).json(todo);
    } catch (error) {
        console.error('Error creating todo:', error);
        return res.status(500).json({ error: 'Error creating todo' });
    }
}

// Read all todos
async function getAllTodos(req, res) {
    try {
        // Check if todos exist in Redis cache
        redisClient.get('todos', async (err, data) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching todos' });
            }
            if (data) {
                return res.status(200).json(JSON.parse(data));
            } else {
                const todos = await Todo.findAll();
                redisClient.setex('todos', 3600, JSON.stringify(todos));
                return res.status(200).json(todos);
            }
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching todos' });
    }
}

// Update a todo
async function updateTodo(req, res) {
    const id = req.params.id;
    const { title, description } = req.body;
    try {
        // Check if todo exists in Redis cache
        const cachedTodo = await redisClient.get('todos:' + id);
        let todo;
        if (cachedTodo) {
            // Update todo in Redis
            todo = JSON.parse(cachedTodo);
            todo.title = title;
            todo.description = description;
            await redisClient.set('todos:' + id, JSON.stringify(todo)); // Update cache
        } else {
            // Todo not found in Redis, update in local database
            todo = await Todo.findByPk(id);
            if (!todo) {
                return res.status(404).json({ error: 'Todo not found' });
            }
            todo.title = title;
            todo.description = description;
            await todo.save();
            // Cache the updated todo in Redis
            await redisClient.set('todos:' + id, JSON.stringify(todo));
        }
        return res.status(200).json(todo);
    } catch (error) {
        console.error('Error updating todo:', error);
        return res.status(500).json({ error: 'Error updating todo' });
    }
}

// Delete a todo
async function deleteTodo(req, res) {
    const id = req.params.id;
    try {
        const todo = await Todo.findByPk(id);
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        await todo.destroy();
        await redisClient.del('todos:' + id); // Remove from cache
        return res.status(200).json(todo);
    } catch (error) {
        console.error('Error deleting todo:', error);
        return res.status(500).json({ error: 'Error deleting todo' });
    }
}

// Get a single todo by ID
async function getTodoById(req, res) {
    const id = req.body.id;
    console.log("oid", id);
    try {
        // Check if todo exists in Redis cache
        const cachedTodo = await redisClient.get(`todo:${id}`);
        console.log("jhjh", cachedTodo);
        if (cachedTodo) {
            // Data exists in Redis cache
            return res.status(200).json(JSON.parse(cachedTodo));
        } else {
            // Data not found in Redis, fetch from database
            const todo = await Todo.findByPk(id);
            if (!todo) {
                return res.status(404).json({ error: 'Todo not found' });
            }
            // Cache the fetched todo in Redis
            await redisClient.setEx(`todo:${id}`, JSON.stringify(todo));
            return res.status(200).json(todo);
        }
    } catch (error) {
        console.error('Error fetching todo:', error);
        return res.status(500).json({ error: 'Error fetching todo' });
    }
}


module.exports = {
    createTodo,
    getAllTodos,
    getTodoById,
    updateTodo,
    deleteTodo,
};
