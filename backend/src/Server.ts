import createApp from './App';
import env from './config/Env';
import logger from './utils/Logger';

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
});
