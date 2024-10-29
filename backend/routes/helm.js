// backend/routes/k8sCluster.js
const Router = require('koa-router');
const { getHelmApps } = require('../controllers/helm');

const router = new Router();

// Other routes...

router.get('/apps/:clusterId/:namespace', getHelmApps); // Add this line

module.exports = router;