// backend/routes/k8sCluster.js
const Router = require('koa-router');
const koaBody = require('koa-body');
const { getHelmApps, getHelmApp, postHelmApp } = require('../controllers/helm');

const router = new Router();

// Other routes...

router.get('/apps/:clusterId/:namespace', getHelmApps);
router.get('/app/:clusterId/:namespace/:appname', getHelmApp);
router.post('/app', koaBody.default({ multipart: true }), postHelmApp); 

module.exports = router;