const Router = require('koa-router');
const { 
  newTerminal,
} = require('../controllers/k8sCluster');

const router = new Router();

router.get('/terminal', newTerminal);

module.exports = router;