// backend/routes/metrics.js
const Router = require('koa-router');
const { getNameSpaceMetrics } = require('../controllers/metrics');
const router = new Router();

router.get('/namespace/:clusterId/:nameSpace', getNameSpaceMetrics);
module.exports = router;