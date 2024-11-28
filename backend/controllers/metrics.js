const MetricsService = require('../services/metricsService');
const { getClusterById } = require('../db');
const fs = require('fs').promises;
const path = require('path');

exports.getNameSpaceMetrics = async (ctx) => {
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

  const cluster = await getClusterById(clusterId);
  if (!cluster) {
    ctx.body = {
      code: -1,
      msg: 'Cluster ID is required.',
      data: null
    };
    return;
  }

  const metricsService = new MetricsService(cluster.config);
  const metrics = await metricsService.getNamespaceMetrics(clusterId, nameSpace);
  if (metrics.status === 0) {
    ctx.body = {
      code: 0,
      msg: 'Helm releases retrieved successfully.',
      data: metrics.data,
    };
  }
  else {
    ctx.body = {
      code: -1,
      msg: metrics.msg,
      data: null,
    };  
  }
}