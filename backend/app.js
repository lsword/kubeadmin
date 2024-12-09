const Koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');
const mount = require('koa-mount');
const send = require('koa-send');
const path = require('path');
const k8sClusterRoutes = require('./routes/k8sCluster');
const appStoreRoutes = require('./routes/appStore');
const helmRoutes = require('./routes/helm');
const metricsRoutes = require('./routes/metrics');
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

const router = new Router();
router.use(`${process.env.PREFIX}/api/k8s`, k8sClusterRoutes.routes());
router.use(`${process.env.PREFIX}/api/appstore`, appStoreRoutes.routes());
router.use(`${process.env.PREFIX}/api/helm`, helmRoutes.routes());
router.use(`${process.env.PREFIX}/api/metrics`, metricsRoutes.routes());
app.use(router.routes()).use(router.allowedMethods());

app.use(mount(`${process.env.PREFIX}`, serve(path.join(__dirname, './static'))));
// app.use(serve(path.join(__dirname, './static')));
app.use(async (ctx, next) => {
  if (ctx.status === 404 && ctx.method === 'GET') {
    await send(ctx, 'index.html', { root: path.join(__dirname, './static') });
  } else {
    await next();
  }
});

module.exports = app;
