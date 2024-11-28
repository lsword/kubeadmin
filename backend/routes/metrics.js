// backend/routes/metrics.js
const Router = require('koa-router');
const koaBody = require('koa-body');
const { getNameSpaceMetrics } = require('../controllers/metrics');
const router = new Router();

// Other routes...

router.get('/namespace/:clusterId/:nameSpace', getNameSpaceMetrics);
module.exports = router;