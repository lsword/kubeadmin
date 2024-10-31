// const { exec } = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const { getClusterById, getAppStoreById } = require('../db');
const { getClusterConfigFile } = require('../utils/k8sConfig');
const AppStoreService = require('./appStoreService');

class HelmService {
  constructor(storeInfo) {
    this.helmPath = path.resolve(__dirname, '../bin/helm');
  }
  
  async listApps(clusterId, nameSpace) {
    const result = {};
    result.status = -1;
    result.data = [];

    const k8sConfigFilePath = await getClusterConfigFile(clusterId);
    if (!k8sConfigFilePath) {
      console.log("Can not find cluster");
      result.status = -1;
      result.msg = "Can not find cluster";
      result.data = [];
      return result;
    }

    try {
      const { stdout, stderr } = await exec(`${this.helmPath} list --kubeconfig ${k8sConfigFilePath} -n ${nameSpace} -o json`);
      const apps = JSON.parse(stdout);
      result.status = 0;
      result.msg = "ok";
      result.data = apps;
      return result;
    } catch(error){
      console.log(error)
      result.status = -1;
      result.msg = "Can not list helm app of cluster";
      result.data = [];
      return result;
    }
  }

  async installApp(appName, clusterId, nameSpace, chartName, chartVersion, chartRepo, values) {
    const result = {};
    result.status = -1;

    const helmPath = path.resolve(__dirname, '../bin/helm');
    const fsPromises = require('fs').promises;

    // Getcluster config file
    const k8sConfigFilePath = await getClusterConfigFile(clusterId);
    if (!k8sConfigFilePath) {
      result.status = -1;
      result.msg = "Can not find cluster";
      return result;
    }

    // Check app name

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

    // Write app config file
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

    // Clean tmp dir
    await fsPromises.rm( packagePath, { recursive: true } );

    // Return ok
    result.status = 0;
    result.msg = "ok";
    return result;
  }

  async deleteApp(appName, clusterId, nameSpace) {
    const result = {};
    result.status = -1;
    result.data = null;

    const k8sConfigFilePath = await getClusterConfigFile(clusterId);
    if (!k8sConfigFilePath) {
      result.msg = "Can not find cluster";
      console.log(result.msg);
      return result;
    }

    try {
      const { stdout, stderr } = await exec(`${this.helmPath} delete --kubeconfig ${k8sConfigFilePath} -n ${nameSpace} ${appName}`);
      result.status = 0;
      result.msg = `Delete helm app(${appName}) in namespace(${nameSpace}) of cluster(${clusterId}) successfully`;
      result.data = null;
    } catch(error){
      result.msg = `Can not delete helm app(${appName}) in namespace(${nameSpace}) of cluster(${clusterId})`;
    }
    return result;
  }
}

module.exports = HelmService;