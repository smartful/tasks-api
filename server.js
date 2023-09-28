import express from 'express';
import connectDB from './config/db.js';
import tasksRoutes from './routes/tasks.js';

const app = express();
const port = process.env.PORT || 5000;
connectDB();

app.use('/api/tasks', tasksRoutes);
app.get('/', (request, response) => {
  response.json({ message: 'Salut les nazes ! Bienvenue sur Task !!!' });
});

app.listen(port, () => {
  console.log(`Server listening on PORT : ${port}`);
});
