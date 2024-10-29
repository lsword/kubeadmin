const Router = require('koa-router');
const { getAppStores, getAppStore, addAppStore, getAppStoreApps, getAppStoreAppVersions, getAppStoreAppDetail } = require('../controllers/appStore');

const router = new Router();

router.get('/stores', getAppStores);
router.get('/store/:storeId', getAppStore);
router.get('/apps/:storeId', getAppStoreApps);
router.get('/appversions/:storeId/:chartName', getAppStoreAppVersions);
router.get('/app/:storeId/:chartName/:chartVersion', getAppStoreAppDetail);
router.post('/store', addAppStore);

module.exports = router;