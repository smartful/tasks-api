import { request, response } from 'express';
import sanitizeHtml from 'sanitize-html';
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

  const sanitizedName = sanitizeHtml(name);

  try {
    const newTask = new Task({
      name: sanitizedName,
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
  if (name) taskField.name = sanitizeHtml(name);
  if ('done' in request.body) {
    taskField.done = done;
  }

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

export const deleteTask = async (request, response) => {
  try {
    let task = await Task.findById(request.params.id);

    if (!task) {
      return response.status(404).json({ message: 'Task not found' });
    }

    // Make sure user own the task
    if (task.user.toString() !== request.user.id) {
      return response.status(401).json({ message: 'Not Authorized' });
    }

    await Task.findByIdAndRemove(request.params.id);
    return response.json({ message: 'Contact removed' });
  } catch (error) {
    console.error(`Error : ${error.message}`);
    return response.status(500).json({ message: 'Server Error' });
  }
};
