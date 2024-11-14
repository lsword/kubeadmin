const Koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');
const path = require('path');
const k8sClusterRoutes = require('./routes/k8sCluster');
const appStoreRoutes = require('./routes/appStore');
const helmRoutes = require('./routes/helm');
const logger = require('./utils/logger');

const app = new Koa();

app.use(async (ctx, next) => {
  logger.info(`Received request: ${ctx.method} ${ctx.url}`);
  try {
    await next();
  } catch (err) {
    logger.error('Error occurred:', err);
    ctx.status = err.status || 500;
    ctx.body = err.message;
  }
});

app.use(serve(path.join(__dirname, './static')));

const router = new Router();
router.use('/api/k8s', k8sClusterRoutes.routes());
router.use('/api/appstore', appStoreRoutes.routes());
router.use('/api/helm', helmRoutes.routes());
app.use(router.routes()).use(router.allowedMethods());


module.exports = app;
