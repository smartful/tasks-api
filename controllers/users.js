import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const register = async (request, response) => {
  const { name, email, password } = request.body;

  try {
    // Check if user already exist
    let user = await User.findOne({ email });
    if (user) {
      return response.status(400).json({ message: 'User already exist' });
    }

    user = new User({
      name,
      email,
      password,
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Generate token
    const payload = {
      user: {
        id: user.id,
      },
    };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (error, token) => {
      if (error) throw error;
      return response.json({ token });
    });
  } catch (error) {
    console.error(`Error : ${error.message}`);
    return response.status(500).json({ message: 'Server Error' });
  }
};

export const login = async (request, response) => {
  const { email, password } = request.body;

  try {
    // Check if user exist
    let user = await User.findOne({ email });
    if (!user) {
      return response.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return response.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (error, token) => {
      if (error) throw error;
      return response.json({ token });
    });
  } catch (error) {
    console.error(`Error : ${error.message}`);
    return response.status(500).json({ message: 'Server Error' });
  }
};

export const getProfile = async (request, response) => {
  try {
    const user = await User.findById(request.user.id).select('-password');
    return response.json(user);
  } catch (error) {
    console.error(`Error : ${error.message}`);
    return response.status(500).json({ message: 'Server Error' });
  }
};
