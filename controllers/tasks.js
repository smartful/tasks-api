import { request, response } from 'express';
import Task from '../models/taskModel.js';

export const getTasks = async (request, response) => {
  try {
    const tasks = await Task.find({ user: request?.user?.id }).sort({ date: -1 });
    return response.json(tasks);
  } catch (error) {
    console.error(`Error : ${error.message}`);
    return response.status(500).json({ message: 'Server Error' });
  }
};

export const createTask = async (request, response) => {
  const { name } = request.body;

  try {
    const newTask = new Task({
      name,
      done: false,
      user: request?.user.id,
    });
    const contact = await newTask.save();
    return response.json(contact);
  } catch (error) {
    console.error(`Error : ${error.message}`);
    return response.status(500).json({ message: 'Server Error' });
  }
};

export const updateTask = async (request, response) => {
  const { name, done } = request.body;
  const taskField = {};
  if (name) taskField.name = name;
  if (done) taskField.done = done;

  try {
    let task = await Task.findById(request.params.id);

    if (!task) {
      return response.status(404).json({ message: 'Task not found' });
    }

    // Make sure user own the task
    if (task.user.toString() !== request.user.id) {
      return response.status(401).json({ message: 'Not Authorized' });
    }

    task = await Task.findByIdAndUpdate(request.params.id, taskField, { new: true });
    return response.json(task);
  } catch (error) {
    console.error(`Error : ${error.message}`);
    return response.status(500).json({ message: 'Server Error' });
  }
};
