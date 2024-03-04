import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import tasksRoutes from './routes/tasks.js';
import usersRoutes from './routes/users.js';
import subscribtionRoutes from './routes/subscribtions.js';
import { subscribtionWebhook } from './controllers/subscribtions.js';

const app = express();
const port = process.env.PORT || 5000;
connectDB();

console.log('process.env.NODE_ENV : ', process.env.NODE_ENV);
console.log('process.env.CLIENT_URL : ', process.env.CLIENT_URL);

// app.use(
//   cors({
//     origin: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.CLIENT_URL,
//   })
// );
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/tasks', tasksRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/subscribe', subscribtionRoutes);

// Stripe Webhook
app.post('/webhooks', express.raw({ type: 'application/json' }), subscribtionWebhook);

app.get('/', (request, response) => {
  response.json({ message: 'Salut les nazes ! Bienvenue sur Task !!!' });
});

app.listen(port, () => {
  console.log(`Server listening on PORT : ${port}`);
});
