const router = require('express').Router();
const { login, signup, mailConfirmation } = require('../controllers/auth');

router.post('/login', login);

router.post('/signup', signup);

router.get('/confirm/:confirmationCode', mailConfirmation);

module.exports = router;
