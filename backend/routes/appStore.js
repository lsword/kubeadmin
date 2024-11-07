const Router = require('koa-router');
const koaBody = require('koa-body');
const { getAppStores, 
  getAppStore,
  getAppStoreApps, 
  getAppStoreAppVersions, 
  getAppStoreAppDetail,
  addAppStore,
  testAppStoreConnection,
  deleteAppStore,
 } = require('../controllers/appStore');

const router = new Router();

router.post('/store', koaBody.default({ multipart: true }), addAppStore);
router.post('/store/testConnection', koaBody.default({ multipart: true }), testAppStoreConnection);
router.get('/stores', getAppStores);
router.get('/store/:storeId', getAppStore);
router.get('/store/apps/:storeId', getAppStoreApps);
router.get('/store/appversions/:storeId/:chartName', getAppStoreAppVersions);
router.get('/store/app/:storeId/:chartName/:chartVersion', getAppStoreAppDetail);
router.delete('/store/:storeId', deleteAppStore);

module.exports = router;