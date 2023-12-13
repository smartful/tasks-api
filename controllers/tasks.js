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
