const Joi = require('joi');
// const User = require('../models/User');

const userSchema = Joi.object({
  name: Joi.string()
    .trim()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
  email: Joi.string()
    .trim()
    .email()
    // .external(
    //   async (value, helpers) => {
    //     const user = await User.findUserByEmail(value);
    //     if (user) {
    //       return new Error('emalis already exist');
    //     }
    //     return false;
    //   },
    // )
    .required(),
  password: Joi.string()
    .trim()
    .min(8)
    .max(15)
    .required(),
});

module.exports = {
  userSchema,
};
