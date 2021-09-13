const express = require('express');
const { port } = require('./config');
const databaseConnection = require('./db/db');

databaseConnection();

const app = express();
app.use(express.json());

app.get('/helloWorld', (req, res) => {
  res.send(`Server up and running - ${new Date().toISOString()}`);
});

app.listen(port, () => {
  console.log(`Server is listening on Port ${port}`);
});
