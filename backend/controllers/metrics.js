const MetricsService = require('../services/metricsService');
const { getClusterById } = require('../db');
const fs = require('fs').promises;
const path = require('path');

exports.getNameSpaceMetrics = async (ctx) => {
  console.log("aaa")
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

  const metricsService = new MetricsService();
  const metrics = await metricsService.getNamespaceMetrics(clusterId, nameSpace);
  if (metrics.status === 0) {
    ctx.body = {
      code: 20000,
      msg: 'Helm releases retrieved successfully.',
      data: metrics.data,
    };
  }
  else {
    ctx.body = {
      code: 20003,
      msg: metrics.msg,
      data: null,
    };  
  }
}