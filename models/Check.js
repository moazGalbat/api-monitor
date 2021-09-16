const { Schema, model } = require('mongoose');

const CheckSchema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    path: { type: String },
    port: { type: Number },
    protocol: {
      type: String,
      required: true,
      enum: ['http', 'https'],
    },
    webHook: { type: String },
    timeout: { type: Number, default: 5 },
    interval: { type: Number, default: 10 },
    threshold: { type: Number, default: 1 },
    authentication: {
      username: { type: String },
      password: { type: String },
    },
    httpHeaders: [
      {
        key: { type: String },
        value: { type: String },
      },
    ],
    assert: {
      statusCode: { type: Number },
    },
    tags: [String],
    ignoreSSL: { type: Boolean },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    isStopped: { type: Boolean, default: false },
    intervalId: { type: Number },
    alerts: { type: Number, default: 1 },
    history: [Date],
    currentStatus: { type: String, default: 'up' },
    outages: { type: Number, default: 0 },
    responseTimes: [Number],
    upTime: { type: Number, default: 0 },
    downTime: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

const checkModel = model('Check', CheckSchema);

module.exports = checkModel;
