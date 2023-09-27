import express from 'express';

const app = express();
const port = process.env.PORT;

app.get('/', (request, response) => {
  response.json({ message: 'Salut les nazes !' });
});

app.listen(port, () => {
  console.log(`Server listening on PORT : ${port}`);
});
