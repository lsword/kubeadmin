// const { exec } = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const { getClusterById, getAppStoreById } = require('../db');
const AppStoreService = require('./appStoreService');

class HelmService {
  async listApps(configFilePath, nameSpace) {
    try {
      const helmPath = path.resolve(__dirname, '../bin/helm');
      const { stdout, stderr } = await exec(`${helmPath} list --kubeconfig ${configFilePath} -n ${nameSpace} -o json`);
      const apps = JSON.parse(stdout);
      return apps;
    } catch(error){
      console.log(error)
      return [];
    }
  }

  async installApp(appName, clusterId, nameSpace, chartName, chartVersion, chartRepo, values) {
    const result = {};
    const helmPath = path.resolve(__dirname, '../bin/helm');
    const fsPromises = require('fs').promises;

    // Get k8s config
    const clusterInfo = await getClusterById(clusterId);

    if (!clusterInfo) {
      result.status = -1;
      result.msg = "Can not find cluster";
      return result;
    }
    // Get appstore info
    const storeInfo = await getAppStoreById(chartRepo);
    if (!storeInfo) {
      result.status = -1;
      result.msg = "Can not find chart store";
      return result;
    }
    console.log(storeInfo.address);

    // Get package info
    const appStoreService = new AppStoreService(storeInfo);
    const packagePath = await appStoreService.getAppPackagePath(chartName, chartVersion);

    if (!packagePath)  {
      result.status = -1;
      result.msg = "Can not get chart package";
      return result;
    }

    // Write cluster config file and app config file
    const k8sConfigFilePath = path.resolve(packagePath, chartName, 'k8s.yaml');
    await fsPromises.writeFile(k8sConfigFilePath, clusterInfo.config, { mode: 0o600 });

    const valuesFilePath = path.resolve(packagePath, chartName, 'v.yaml');
    await fsPromises.writeFile(valuesFilePath, values);

    // Exec dry run before install app
    var dryRunCommand = `${helmPath} install ${appName} . -n ${nameSpace} -f ${valuesFilePath} --kubeconfig ${k8sConfigFilePath} --dry-run`;
    const { stdout: dryRunOut, stderr: dryRunError } = await exec(dryRunCommand, { maxBuffer: 8000 * 1024, cwd: `${packagePath}/${chartName}` });
    if (dryRunError) {
      result.status = -1;
      result.msg = dryRunError;
      return result;
    }
    // Install app
    var installCommand = `${helmPath} install ${appName} . -n ${nameSpace} -f ${valuesFilePath} --kubeconfig ${k8sConfigFilePath}`;
    const { stdout: installOutput, stderr: installError } = await exec(installCommand, { maxBuffer: 8000 * 1024, cwd: `${packagePath}/${chartName}` });
    if (installError) {
      result.status = -1;
      result.msg = installError;
      return result;
    }

    result.status = 0;
    result.msg = "ok";
    return result;
  // console.log(dryRunCommand);
    // console.log(dryRunOut)
  }
}

module.exports = HelmService;