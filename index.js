const express = require('express');
const bodyParser = require('body-parser');
const todoRoutes = require('./routes/todoRoute');
const db = require('./models/index')

const app = express();

app.use(bodyParser.json());
app.use('/todos', todoRoutes);
db.sequelize.sync({ alter: false });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
