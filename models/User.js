const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');
const util = require('util');
const jwt = require('jsonwebtoken');
const { JWT_SECRET: jwtSecretKey } = require('../config');

const saltRounds = 10;

const sign = util.promisify(jwt.sign);
const verify = util.promisify(jwt.verify);

const userSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Active'],
      default: 'Pending',
      hide: true,
    },
    code: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true },
);

userSchema.pre('save', async function () {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, saltRounds);
  }
});

userSchema.methods.comparePassword = function (plainPassword) {
  const user = this;
  return bcrypt.compare(plainPassword, user.password);
};

userSchema.methods.generateToken = function (expiresIn) {
  const user = this;
  return sign({ id: user._id, email: user.email }, jwtSecretKey, { expiresIn });
};

userSchema.statics.generateConfirmationCode = function ({ email, name }) {
  return sign({ email, name }, jwtSecretKey);
};

userSchema.statics.getVerifiedUser = async function (token) {
  const User = this;
  const payload = await verify(token, jwtSecretKey);
  const currentUser = await User.findById(payload.id);
  if (!currentUser) throw new Error('User Not Found');
  return currentUser;
};

userSchema.statics.findUserByEmail = async function (mail) {
  const User = this;
  const user = await User.findOne({ email: mail }).exec();
  return user;
};

const userModel = model('User', userSchema);

module.exports = userModel;
