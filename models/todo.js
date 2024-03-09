module.exports = (sequelize, Sequelize) => {

  const TodoSchema = sequelize.define("todo", {
      title: {
          type: Sequelize.STRING
      },
      description: {
          type: Sequelize.STRING
      }
  });
  return TodoSchema;
};