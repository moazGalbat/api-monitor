const express = require('express');
const { port } = require('./config');
const databaseConnection = require('./db/db');
const errorMiddleware = require('./middleware/error');
const authRouter = require('./routes/auth');

databaseConnection();

const app = express();
app.use(express.json());

app.use('/', authRouter);

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is listening on Port ${port}`);
});
