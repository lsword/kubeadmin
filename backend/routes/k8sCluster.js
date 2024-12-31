const Router = require('koa-router');
const koaBody = require('koa-body');
const { uploadFile, 
  testConnection, addCluster, getClusters, deleteCluster, getCluster, getNamespaces, clusterOverview, 
  getNamespacedPods, getNamespacedPodDetail,
  getNamespacedResources,
  getStorageClasses,
  getNodes,
  postServiceType,
  deletePod,
  newTerminal,
  resizeTerminal,
} = require('../controllers/k8sCluster');

const router = new Router();

router.post('/upload', uploadFile);
router.post('/testConnection', koaBody.default({ multipart: true }), testConnection);
router.post('/cluster', koaBody.default({ multipart: true }), addCluster);
router.get('/clusters', getClusters);
router.delete('/cluster/:clusterId', deleteCluster);
router.get('/cluster/:clusterId', getCluster); 
router.get('/namespaces/:clusterId', getNamespaces); 
router.get('/clusterOverview/:clusterId', clusterOverview); 
router.get('/pods/:clusterId/:namespace', getNamespacedPods);
router.get('/pod/:clusterId/:namespace/:podname', getNamespacedPodDetail);
router.get('/resources/:clusterId/:namespace', getNamespacedResources);
router.get('/storageclasses/:clusterId', getStorageClasses);
router.get('/nodes/:clusterId', getNodes);
router.post('/:clusterId/service/servicetype', koaBody.default({ multipart: true }), postServiceType);
router.delete('/pod/:clusterId/:namespace/:podName/:force', deletePod);
router.all('/terminal', newTerminal);
router.post('/resizeTerminal/:terminalId', resizeTerminal);

module.exports = router;