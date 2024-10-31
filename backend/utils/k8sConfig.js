const fs = require('fs').promises;
const path = require('path');
const { getClusterById } = require('../db');

async function getClusterConfigFile(clusterId) {
  const clusterInfo = await getClusterById(clusterId);

  if (!clusterInfo) {
    console.log(clusterId);
    throw new Error("Cannot find cluster");
    return null;
  }

  const configFilePath = path.resolve(__dirname, '../tmp', `${clusterId}-k8s.yaml`);
  await fs.writeFile(configFilePath, clusterInfo.config, { mode: 0o600 });

  return configFilePath;
}

module.exports = { getClusterConfigFile };