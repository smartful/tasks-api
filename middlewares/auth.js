import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const protect = async (request, response, next) => {
  let token;

  if (request?.headers?.authorization && request?.headers?.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = request.headers.authorization.split(' ')[1];

      // Get user from the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      request.user = await User.findById(decoded?.user?.id).select('-password');
      next();
    } catch (error) {
      console.error(`Error : ${error.message}`);
      return response.status(401).json({ message: 'Token is not valid' });
    }
  }

  if (!token) {
    return response.status(401).json({ message: 'No token, authorization denied' });
  }
};
