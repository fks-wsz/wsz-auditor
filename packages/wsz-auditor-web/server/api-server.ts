import express from 'express';
import auditRouter from './router/audit';
import { errorHandlerMiddleware } from './middleware/error';

const app = express();
const API_PORT = process.env.API_PORT || 3001;

app.use(express.json());
app.use(auditRouter);

app.use(errorHandlerMiddleware);

app.listen(API_PORT, () => {
  console.log(`API server running at http://localhost:${API_PORT}`);
});
