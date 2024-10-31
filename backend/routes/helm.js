// backend/routes/k8sCluster.js
const Router = require('koa-router');
const koaBody = require('koa-body');
const { getHelmApps, getHelmApp, deleteHelmApp, postHelmApp } = require('../controllers/helm');

const router = new Router();

// Other routes...

router.get('/apps/:clusterId/:nameSpace', getHelmApps);
router.get('/app/:clusterId/:nameSpace/:appName', getHelmApp);
router.delete('/app/:clusterId/:nameSpace/:appName', deleteHelmApp);
router.post('/app', koaBody.default({ multipart: true }), postHelmApp); 

module.exports = router;