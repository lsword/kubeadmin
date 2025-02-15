const Koa = require('koa');
const Router = require('koa-router');
const websockify = require('koa-websocket');
const serve = require('koa-static');
const mount = require('koa-mount');
const send = require('koa-send');
const path = require('path');
const k8sClusterRoutes = require('./routes/k8sCluster');
const appStoreRoutes = require('./routes/appStore');
const helmRoutes = require('./routes/helm');
const metricsRoutes = require('./routes/metrics');
const terminalRoutes = require('./routes/terminal');
const logger = require('./utils/logger');

const app = websockify(new Koa());
// const app = new Koa();

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
router.use(`/kubeadmin/api/k8s`, k8sClusterRoutes.routes());
router.use(`/kubeadmin/api/appstore`, appStoreRoutes.routes());
router.use(`/kubeadmin/api/helm`, helmRoutes.routes());
router.use(`/kubeadmin/api/metrics`, metricsRoutes.routes());
app.ws.use(router.routes()).use(router.allowedMethods());
app.use(router.routes()).use(router.allowedMethods());
//app.use(require('./router/terminal').routes())
//app.ws.use(terminalRoutes.routes());
//app.ws.use(require('./router/terminal').routes())

/*
const wsrouter = new Router();
wsrouter.use(`/kubeadmin/api/k8s`, terminalRoutes.routes());
app.use(wsrouter.routes()).use(wsrouter.allowedMethods());
*/

app.use(mount(`/kubeadmin`, serve(path.join(__dirname, './static'))));
// app.use(serve(path.join(__dirname, './static')));
app.use(async (ctx, next) => {
  if (ctx.status === 404 && ctx.method === 'GET') {
    await send(ctx, 'index.html', { root: path.join(__dirname, './static') });
  } else {
    await next();
  }
});

module.exports = app;
