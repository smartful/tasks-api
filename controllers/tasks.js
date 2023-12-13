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
