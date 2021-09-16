const express = require('express');

const checkRouter = express.Router();

const {
  createCheck, getChecks, updateCheck, deleteCheck, pauseCheck, report,
} = require('../controllers/check');
const authMiddleware = require('../middleware/authMiddleware');

checkRouter.post('/', authMiddleware, createCheck);
checkRouter.get('/', authMiddleware, getChecks);
checkRouter.put('/:id', authMiddleware, updateCheck);
checkRouter.delete('/:id', authMiddleware, deleteCheck);
checkRouter.patch('/:id', authMiddleware, pauseCheck);
checkRouter.get('/report', authMiddleware, report);

module.exports = checkRouter;
