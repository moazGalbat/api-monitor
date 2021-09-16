const { default: axios } = require('axios');

axios.interceptors.request.use((config) => {
  config.metadata = { startTime: new Date() };
  return config;
}, (error) => Promise.reject(error));

axios.interceptors.response.use((response) => {
  response.config.metadata.endTime = new Date();
  response.duration = response.config.metadata.endTime - response.config.metadata.startTime;
  return response;
}, (error) => {
  error.config.metadata.endTime = new Date();
  error.duration = error.config.metadata.endTime - error.config.metadata.startTime;
  return Promise.reject(error);
});

module.exports = axios;
