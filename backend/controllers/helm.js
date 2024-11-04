// backend/controllers/k8sCluster.js
const HelmService = require('../services/helmService');
const { getClusterById } = require('../db');
const fs = require('fs').promises;
const path = require('path');

exports.getHelmApps = async (ctx) => {
  const { clusterId, nameSpace } = ctx.params;

  if (!clusterId || !nameSpace) {
    ctx.status = 200;
    ctx.body = {
      code: 20001,
      msg: 'ClusterId and Namespace are required.',
      data: null
    };
    return;
  }

  const helmService = new HelmService();
  const listResult = await helmService.listApps(clusterId, nameSpace);
  if (listResult.status === 0) {
    ctx.body = {
      code: 20000,
      msg: 'Helm releases retrieved successfully.',
      data: listResult.data,
    };
  }
  else {
    ctx.body = {
      code: 20003,
      msg: listResult.msg,
      data: null,
    };  
  }
};

exports.getHelmApp = async (ctx) => {
  const { clusterId, nameSpace, appName } = ctx.params;

  if (!clusterId || !nameSpace || !appName) {
    ctx.status = 200;
    ctx.body = {
      code: 20001,
      msg: 'ClusterId, Namespace and AppName are required.',
      data: null
    };
    return;
  }

  const helmService = new HelmService();
  const listResult = await helmService.getApp(clusterId, nameSpace, appName);
  if (listResult.status === 0) {
    ctx.body = {
      code: 20000,
      msg: 'Helm releases retrieved successfully.',
      data: listResult.data,
    };
  }
  else {
    ctx.body = {
      code: 20003,
      msg: listResult.msg,
      data: null,
    };  
  }
}

exports.postHelmApp = async (ctx) => {
  var reqbody = ctx.request.body;
  const { appname, chartname, chartversion, chartrepo, clusterid, namespace, values } = ctx.request.body;

  try {
    const helmService = new HelmService();
    const installResult = await helmService.installApp(appname, clusterid, namespace, chartname, chartversion, chartrepo, values);
    if (installResult.status === 0) {
      ctx.body = {
        code: 20000,
        msg: 'App installed successfully.',
        data: null,
      };      
    } else {
      ctx.body = {
        code: 50000,
        msg: 'App installed failed.',
        data: installResult.msg,
      };      
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      code: 50001,
      msg: 'Failed to retrieve Helm releases.',
      data: { error: error }
    };
  }
};

exports.deleteHelmApp = async (ctx) => {
  const { clusterId, nameSpace, appName } = ctx.params;

  if (!clusterId || !nameSpace || !appName) {
    ctx.status = 200;
    ctx.body = {
      code: 20001,
      msg: 'nameSpace and appName are required.',
      data: null
    };
    return;
  }

  try {
    const helmService = new HelmService();
    const deleteResult = await helmService.deleteApp(appName, clusterId, nameSpace);
    if (deleteResult.status === 0) {
      ctx.body = {
        code: 20000,
        msg: 'App deleted successfully.',
        data: "",
      };      
    } else {
      ctx.body = {
        code: 50000,
        msg: 'App deleted failed.',
        data: deleteResult.msg,
      };      
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      code: 50001,
      msg: 'Failed to retrieve Helm releases.',
      data: { error: error }
    };
  }
};
