const express = require('express');
const router = express.Router();

// pulls all the modules from /controller/tasks
const { getAllTasks, createTask, getTask, updateTask, deleteTask } = require('../controllers/tasks')

// if they go to / they can get all tasks or create new tasks
router.route('/').get(getAllTasks).post(createTask)
// if they go to /:id they can get a task, they can update a task, or they can delete a task
router.route('/:id').get(getTask).patch(updateTask).delete(deleteTask)

module.exports = router