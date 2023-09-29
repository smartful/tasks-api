import { response } from 'express';

export const register = (request, response) => {
  const { name, email, password } = request.body;
  console.log('name : ', name);
  console.log('email : ', email);
  console.log('password : ', password);

  response.json({ name, email });
};
