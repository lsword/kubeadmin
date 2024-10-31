// backend/controllers/k8sCluster.js
const HelmService = require('../services/helmService');
const { getClusterById } = require('../db');
const fs = require('fs').promises;
const path = require('path');

exports.getHelmApps = async (ctx) => {
  const { clusterId, nameSpace } = ctx.params;

  if (!clusterId || !nameSpace) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: 'Namespace is required.',
      code: 1018,
      data: null
    };
    return;
  }

  const helmService = new HelmService();
  const listResult = await helmService.listApps(clusterId, nameSpace);
  if (listResult.status === 0) {
    ctx.body = {
      status: 200,
      msg: 'Helm releases retrieved successfully.',
      code: 20000,
      data: listResult.data,
    };
  }
  else {
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: listResult.msg,
      code: 1019,
      data: listResult.data,
    };  
  }
};

exports.getHelmApp = async (ctx) => {
  const { clusterId, nameSpace, appName } = ctx.params;
}

exports.postHelmApp = async (ctx) => {
  var reqbody = ctx.request.body;
  const { appname, chartname, chartversion, chartrepo, clusterid, namespace, values } = ctx.request.body;

  try {
    const helmService = new HelmService();
    const installResult = await helmService.installApp(appname, clusterid, namespace, chartname, chartversion, chartrepo, values);
    if (installResult.status === 0) {
      ctx.body = {
        status: 200,
        msg: 'App installed successfully.',
        code: 20000,
        data: "",
      };      
    } else {
      ctx.body = {
        status: 500,
        msg: 'App installed failed.',
        code: 50000,
        data: installResult.msg,
      };      
    }
} catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: 'Failed to retrieve Helm releases.',
      code: 1019,
      data: { error: error }
    };
  }
};

exports.deleteHelmApp = async (ctx) => {
  const { clusterId, nameSpace, appName } = ctx.params;

  if (!clusterId || !nameSpace || !appName) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: 'nameSpace and appName are required.',
      code: 1018,
      data: null
    };
    return;
  }

  try {
    const helmService = new HelmService();
    const deleteResult = await helmService.deleteApp(appName, clusterId, nameSpace);
    if (deleteResult.status === 0) {
      ctx.body = {
        status: 200,
        msg: 'App deleted successfully.',
        code: 20000,
        data: "",
      };      
    } else {
      ctx.body = {
        status: 500,
        msg: 'App deleted failed.',
        code: 50000,
        data: deleteResult.msg,
      };      
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: 'Failed to retrieve Helm releases.',
      code: 1019,
      data: { error: error }
    };
  }
};
