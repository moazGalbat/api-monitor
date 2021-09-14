const express = require('express');
const { port } = require('./config');
const databaseConnection = require('./db/db');
const errorMiddleware = require('./middleware/error');
const authRouter = require('./routes/auth');
const checkRouter = require('./routes/check');
const authMiddleware = require('./middleware/authMiddleware');
const { handleChecksOnServerBoot } = require('./helpers/checkHelpers');

databaseConnection();

// handleChecksOnServerBoot();

const app = express();
app.use(express.json());

app.use('/', authRouter);
app.use('/checks', authMiddleware, checkRouter);

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is listening on Port ${port}`);
});
