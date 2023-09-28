import express from 'express';
import tasksRoutes from './routes/tasks.js';

const app = express();
const port = process.env.PORT || 5000;

app.use('/api/tasks', tasksRoutes);
app.get('/', (request, response) => {
  response.json({ message: 'Salut les nazes ! Bienvenue sur Task !!!' });
});

app.listen(port, () => {
  console.log(`Server listening on PORT : ${port}`);
});
