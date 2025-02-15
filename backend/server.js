
const app = require('./app');
const config = require('./config/config');
const logger = require('./utils/logger');

app.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port}`);
});
