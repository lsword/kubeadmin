// backend/controllers/k8sCluster.js
const HelmService = require('../services/helmService');
const { getClusterById } = require('../db');
const fs = require('fs').promises;
const path = require('path');

exports.getHelmApps = async (ctx) => {
  const { clusterId, namespace } = ctx.params;

  if (!clusterId || !namespace) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: 'Namespace is required.',
      code: 1018,
      data: null
    };
    return;
  }

  try {
    const cluster = await getClusterById(clusterId);
    if (!cluster) {
      ctx.status = 404;
      ctx.body = {
        status: 404,
        msg: 'Cluster not found.',
        code: 1013,
        data: null
      };
      return;
    }

    const configFilePath = path.resolve(__dirname, '../tmp', clusterId);
    await fs.writeFile(configFilePath, cluster.config);

    const helmService = new HelmService();
    const releases = await helmService.listApps(configFilePath, namespace);
    ctx.body = {
      status: 200,
      msg: 'Helm releases retrieved successfully.',
      code: 20000,
      data: releases
    };
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