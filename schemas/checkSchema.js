const Joi = require('joi');

const checkSchema = Joi.object({
  name: Joi.string()
    .trim()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
  url: Joi.string()
    .trim()
    .uri()
    .required(),
  protocol: Joi.string()
    .valid('https', 'http')
    .required(),
  path: Joi.string().uri({
    relativeOnly: true,
  }),
  port: Joi.number()
    .integer()
    .min(0)
    .max(65535),
  webhook: Joi.string()
    .trim()
    .uri(),
  timeout: Joi.number()
    .integer()
    .min(5),
  interval: Joi.number()
    .integer()
    .min(1),
  threshold: Joi.number()
    .integer()
    .min(1),
  authentication: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }),
  httpHeaders: Joi.object(),
  assert: Joi.object().keys({
    statusCode: Joi.number()
      .integer().required(),
  }),
  tags: Joi.array(),
  ignoreSSL: Joi.boolean().required(),
});

module.exports = {
  checkSchema,
};
