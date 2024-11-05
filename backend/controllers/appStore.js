const { customAlphabet } = require('nanoid');
const { kubeadminDB, getAppStoreById } = require('../db');
const AppStoreService = require('../services/appStoreService');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const compressing = require('compressing');

const nanoid = customAlphabet('abcdefghigklmnopqrstuvwxyz', 10)

exports.testAppStoreConnection = async(ctx) => {

}

exports.getAppStores = async (ctx) => {
  try {
    const db = await kubeadminDB();
    const appStores = await db.all('SELECT * FROM appstore');
    ctx.body = {
      status: 200,
      code: 20000,
      msg: 'App stores retrieved successfully.',
      data: appStores
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: 'Failed to retrieve app stores.',
      data: { error: error.message }
    };
  }
};

exports.getAppStore = async (ctx) => {
  const { storeId } = ctx.params;
  if (!storeId) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: 'StoreId is required.',
      data: null,
    };
    return;
  }

  const storeInfo = await getAppStoreById(storeId);
  if (!storeInfo) {
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: `Failed to get store info by storeid: ${storeId}`,
      code: 50000, // Custom error code for connection failure
      data: null,
    };
  }
  ctx.body = {
    status: 200,
    code: 20000,
    msg: 'App stores retrieved successfully.',
    data: storeInfo,
  };
};

exports.getAppStoreApps = async (ctx) => {
  const { storeId } = ctx.params;
  if (!storeId) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: 'StoreId is required.',
      data: null
    };
    return;
  }
  
  const storeInfo = await getAppStoreById(storeId);
  if (!storeInfo) {
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: `Failed to get store info by storeid: ${storeId}`,
      code: 50000, // Custom error code for connection failure
      data: null
    };
  }

  try {
    const appStoreService = new AppStoreService(storeInfo);
    const apps = await appStoreService.listApps();
    ctx.body = {
      status: 200,
      code: 20000,
      msg: 'App stores retrieved successfully.',
      data: apps
    };
  } catch(error) {
    ctx.status = 500;
    ctx.body = {
      status: 50001,
      msg: `Failed to get app info from store(${storeId}).`,
      data: { error: error.message }
    };
  }
};

exports.getAppStore = async (ctx) => {
  const { storeId } = ctx.params;
  if (!storeId) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: 'StoreId is required.',
      data: null,
    };
    return;
  }

  const storeInfo = await getAppStoreById(storeId);
  if (!storeInfo) {
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: `Failed to get store info by storeid: ${storeId}`,
      code: 50000, // Custom error code for connection failure
      data: null,
    };
  }
  ctx.body = {
    status: 200,
    code: 20000,
    msg: 'App stores retrieved successfully.',
    data: storeInfo,
  };
};

exports.getAppStoreAppVersions = async (ctx) => {
  const { storeId, chartName } = ctx.params;
  if (!storeId || !chartName) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: 'StoreId and ChartName are required.',
      data: null
    };
    return;
  }

  const storeInfo = await getAppStoreById(storeId);
  if (!storeInfo) {
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: `Failed to get store info by storeid: ${storeId}`,
      code: 50000, // Custom error code for connection failure
      data: null
    };
  }
  try {
    const appStoreService = new AppStoreService(storeInfo);
    const appVersionsInfo = await appStoreService.getAppVersions(chartName);
    ctx.body = {
      status: 200,
      code: 20000,
      msg: 'App info retrieved successfully.',
      data: appVersionsInfo,
    };
  } catch(error) {
    ctx.status = 500;
    ctx.body = {
      status: 50001,
      msg: `Failed to get app info from store(${storeId}).`,
      data: { error: error.message }
    };
  }

};

exports.getAppStoreAppDetail = async (ctx) => {
  const { storeId, chartName, chartVersion } = ctx.params;
  if (!storeId || !chartName || !chartVersion) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: 'StoreId, ChartName and ChartVersion are required.',
      data: null
    };
    return;
  }
  
  var chartPackageInfo = {};
  chartPackageInfo.readme = "";
  chartPackageInfo.values = "";
  // chartPackageInfo.path = "";

  const storeInfo = await getAppStoreById(storeId);
  if (!storeInfo) {
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: `Failed to get store info by storeid: ${storeId}`,
      code: 50000, // Custom error code for connection failure
      data: null,
    };
    return;
  }

  if (storeInfo.type === 'chartmuseum') {
    // http://store.e-byte.cn/chart/api/test/charts
    // http://store.e-byte.cn/chart/test/charts/myapp-0.5.0.tgz
    const chartUrl = `${storeInfo.address.replace('/api/', '/')}/${chartName}-${chartVersion}.tgz`;
    console.log(chartUrl);
    await axios.get(chartUrl, {
      responseType: 'arraybuffer'
    }).then(async response => {
      const buffer = response.data;
  
      var tmpDir = path.resolve(__dirname, '../tmp/chart', nanoid());
      fs.mkdirSync(tmpDir, { recursive: true });
      await compressing.tgz.uncompress(buffer, tmpDir).then(() => {
        // chartPackageInfo.path = tmpDir + '/' + chartName;
        try {
          chartPackageInfo.readme = fs.readFileSync(tmpDir + '/' + chartName + '/README.md', 'utf8');
        }
        catch (e) {
          chartPackageInfo.readme = "";
        }
        try {
          chartPackageInfo.values = fs.readFileSync(tmpDir + '/' + chartName + '/values.yaml', 'utf8');
        }
        catch (e) {
          chartPackageInfo.values = "";
        }
      }).catch((error) => {
        console.log(error);
      }).finally(()=>{
        // delte tmp dir
      });
    });  
  } else {
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: `Store type(${storeId}) does not supported`,
      code: 50000, // Custom error code for connection failure
      data: null,
    };
    return;
  }

  ctx.body = {
    status: 200,
    code: 20000,
    msg: 'App stores retrieved successfully.',
    data: chartPackageInfo
  };


  /*
  const storeInfo = await getAppStoreById(storeId);
  if (!storeInfo) {
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: `Failed to get store info by storeid: ${storeId}`,
      code: 50000, // Custom error code for connection failure
      data: null
    };
  }

  try {
    const appStoreService = new AppStoreService(storeInfo);
    const apps = await appStoreService.listApps();
    ctx.body = {
      status: 200,
      code: 20000,
      msg: 'App stores retrieved successfully.',
      data: apps
    };
  } catch(error) {
    ctx.status = 500;
    ctx.body = {
      status: 50001,
      msg: `Failed to get app info from store(${storeId}).`,
      data: { error: error.message }
    };
  }
*/
};

exports.addAppStore = async (ctx) => {
  const { name, type, address } = ctx.request.body;

  if (!name || !type || !address) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: 'Name, type, and address are required.',
      data: null
    };
    return;
  }

  try {
    const db = await kubeadminDB();
    const storeId = nanoid();
    const result = await db.run('INSERT INTO appstore (id, name, type, address) VALUES (?, ?, ?, ?)', [storeId, name, type, address]);
    ctx.body = {
      status: 200,
      code: 20000,
      msg: 'App store added successfully.',
      data: { id: result.lastID }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: 'Failed to add app store.',
      data: { error: error.message }
    };
  }
};
