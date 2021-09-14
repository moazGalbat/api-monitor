const UserModel = require('../models/User');
const { LOGIN_FAILED, NOT_FOUND_ERR } = require('../helpers/commonErrors');
const CustomError = require('../helpers/CustomError');
const { confirmationMailBody } = require('../mail/mailTemplates');
const { sendMail } = require('../mail/nodmaile');
const { userSchema } = require('../schemas/userSchema');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email }).exec();
    if (!user) throw LOGIN_FAILED;
    const match = await user.comparePassword(password);
    if (!match) throw LOGIN_FAILED;
    if (user.status !== 'Active') throw new CustomError({ statusCode: 401, code: 'EMAIL_NOT_VERIVIED', message: 'Your email is not verified' });
    const token = await user.generateToken('3h');
    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
};

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = await userSchema.validateAsync(req.body).catch((err) => {
      throw new CustomError({ statusCode: 422, code: 'VALIDATION_ERROR', details: err.details });
    });
    const mailExist = await UserModel.findOne({ email });
    if (mailExist) throw new CustomError({ statusCode: 422, code: 'VALIDATION_ERROR', message: 'email already exist' });
    const code = await UserModel.generateConfirmationCode({ name, email });
    const user = new UserModel({
      name,
      email,
      password,
      code,
    });
    await user.save();
    sendMail({
      email,
      subject: 'confirm your mail',
      body: confirmationMailBody({ name, confirmationCode: code }),
    });
    res.status(200).json({ message: 'User created successfully. Confirmation mail Sent. Please verify your email before login.' });
  } catch (err) {
    next(err);
  }
};

const mailConfirmation = async (req, res, next) => {
  try {
    const { confirmationCode } = req.params;
    const user = await UserModel.findOne({ code: confirmationCode }).exec();
    if (!user) throw NOT_FOUND_ERR('User');
    user.status = 'Active';
    await user.save();
    res.status(200).json({ message: 'Your mail is verified' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  signup,
  mailConfirmation,
};
