const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const YAML = require('yaml');
const { getClusterById, getAppStoreById } = require('../db');
const { getClusterConfigFile } = require('../utils/k8sConfig');
const AppStoreService = require('./appStoreService');
const K8sService = require('../services/k8sService');

getK8sService = async(clusterId) => {
  try {
    const cluster = await getClusterById(clusterId);
    if (!cluster) return null;
    const k8sService = new K8sService(clusterId, cluster.config);
    return k8sService;
  } catch(error) {
    return null;
  }
};

class HelmService {
  constructor(storeInfo) {
    this.helmPath = path.resolve(__dirname, '../bin/helm');
    this.yqPath = path.resolve(__dirname, '../bin/yq');
  }
  
  async handleError(result, errorMsg, error) {
    console.error(`${errorMsg}:`, error);
    result.status = -1;
    result.msg = errorMsg;
    result.data = null;
    return result;
  }

  async listApps(clusterId, nameSpace) {
    const result = {};

    const k8sConfigFilePath = await getClusterConfigFile(clusterId);
    if (!k8sConfigFilePath) {
      return this.handleError(result, "Can not find cluster");
    }

    try {
      const { stdout, stderr } = await exec(`${this.helmPath} list --kubeconfig ${k8sConfigFilePath} -n ${nameSpace} -o json`);
      const apps = JSON.parse(stdout);
      result.status = 0;
      result.msg = "ok";
      result.data = apps;
      return result;
    } catch(error){
      return this.handleError(result, "Can not list helm app of cluster");
    }
  }
  async getApp(clusterId, nameSpace, appName) {
    const result = {};
    result.status = -1;

    const k8sConfigFilePath = await getClusterConfigFile(clusterId);
    if (!k8sConfigFilePath) {
      return this.handleError(result, "Can not find cluster");
    }

    const resources = [];
    try {
      const { stdout } = await exec(`${this.helmPath} get manifest ${appName} --kubeconfig ${k8sConfigFilePath} -n ${nameSpace}`);
      const manifests = YAML.parseAllDocuments(stdout).map(doc => doc.toJSON()).filter(item => item !== null);
      const k8sService = await getK8sService(clusterId);

      for (const item of manifests) {
        if (item === null) continue;
        if (item.kind === "Service") {
          const response = await k8sService.getServiceDetail(nameSpace, item.metadata.name);
          resources.push(response);
        }
        else {
          resources.push(item);
        }
      }
      result.status = 0;
      result.msg = "ok";
      result.data = resources;
      return result;
    } catch(error){
      return this.handleError(result, "Can not list helm app of cluster");
    }
  }

  async getAppResources(clusterId, nameSpace, appName) {
    const result = {};
    result.status = -1;

    const k8sConfigFilePath = await getClusterConfigFile(clusterId);
    if (!k8sConfigFilePath) {
      return this.handleError(result, "Can not find cluster");
    }

    const resources = [];
    try {
      // const { stdout, stderr } = await exec(`${this.helmPath} get manifest ${appName} --kubeconfig ${k8sConfigFilePath} -n ${nameSpace} | ${this.yqPath} ea "[.]" -o=json`);
      // const manifests = JSON.parse(stdout).filter(item => item !== null);
      const { stdout } = await exec(`${this.helmPath} get manifest ${appName} --kubeconfig ${k8sConfigFilePath} -n ${nameSpace}`);
      const manifests = YAML.parseAllDocuments(stdout).map(doc => doc.toJSON()).filter(item => item !== null);
      const k8sService = await getK8sService(clusterId);

      for (const item of manifests) {
        if (item === null) continue;
        // console.log(item.kind);
        const resource = {};
        if (item.kind === "Ingress") {
          resource.id = `${nameSpace}:${item.kind}:${item.metadata.name}`;
          resource.kind = item.kind;
          // resource.info = await serviceK8s.getIngressByName(ns, item.metadata.name);
          resource.upstreams = [];
          if (item.spec.rules) {
            for (const rule of item.spec.rules) {
              for (const path of rule.http.paths) {
                var upstream = {};
                if (path.backend.service && path.backend.service.name)
                  upstream.id = nameSpace + ":Service:" + path.backend.service.name;
                if (path.backend.serviceName)
                  upstream.id = nameSpace + ":Service:" + path.backend.serviceName;
                resource.upstreams.push(upstream);
              }
            }
          }
          resources.push(resource);
        }
        if (item.kind === "Service") {
          resource.id = `${nameSpace}:${item.kind}:${item.metadata.name}`;
          resource.kind = item.kind;
          // resource.info = await serviceK8s.getServiceByName(ns, item.metadata.name);
          // resource.info = await k8sService.getServiceDetail(nameSpace, item.metadata.name);
          resource.upstreams = [];
  
          var labels = "";
          if (item.spec.selector && typeof item.spec.selector === 'object') {
            /*
            Object.keys(item.spec.selector).forEach((key) => {
              labels += key + "=" + item.spec.selector[key] + ",";
            })
            labels = labels.substring(0, labels.length - 1);
            var tmppods = await serviceK8s.getPodByLabels(ns, labels);
            for (tmppod of tmppods) {
              var upstream = {};
              upstream.id = ns + ":Pod:" + tmppod.metadata.name;
              resource.upstreams.push(upstream);
            }
              */
          }
          // resources.push(resource);
        }
        if (item.kind === "Deployment" || item.kind === "DaemonSet" || item.kind === "StatefulSet") {
          resource.id = `${nameSpace}:${item.kind}:${item.metadata.name}`;
          resource.kind = item.kind;
          /*
          if (item.kind === "Deployment")
            resource.info = await serviceK8s.getDeploymentByName(ns, item.metadata.name);
          else if (item.kind === "DaemonSet")
            resource.info = await serviceK8s.getDaemonSetByName(ns, item.metadata.name);
          else if (item.kind === "StatefulSet")
            resource.info = await serviceK8s.getStatefulSetByName(ns, item.metadata.name);
          resource.upstreams = [];
          var labels = "";
          if (item.spec.selector && item.spec.selector.matchLabels && typeof item.spec.selector === 'object') {
            Object.keys(item.spec.selector.matchLabels).forEach((key) => {
              labels += key + "=" + item.spec.selector.matchLabels[key] + ",";
            })
            labels = labels.substring(0, labels.length - 1);
  
            var tmppods = await serviceK8s.getPodByLabels(ns, labels);
            for (tmppod of tmppods) {
              var upstream = {};
              upstream.id = ns + ":Pod:" + tmppod.metadata.name;
              resource.upstreams.push(upstream);
  
              var podResource = {};
              podResource.id = ns + ":Pod:" + tmppod.metadata.name;
              podResource.kind = "Pod";
              podResource.info = tmppod;
              podResource.controller = ns + ":" + item.kind + ":" + item.metadata.name;
              podResource.upstreams = [];
              resources.push(podResource);
            }
            
          }
            */
          resources.push(resource);
        }
      }
      result.status = 0;
      result.msg = "ok";
      result.data = resources;
      return result;
    } catch(error){
      return this.handleError(result, "Can not list helm app of cluster");
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
      return this.handleError(result, "Can not find cluster");
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
      return this.handleError(result, "Can not get chart package");
    }

    // Write app config file
    const valuesFilePath = path.resolve(packagePath, chartName, 'v.yaml');
    await fsPromises.writeFile(valuesFilePath, values);

    // Exec dry run before install app
    var dryRunCommand = `${helmPath} install ${appName} . -n ${nameSpace} -f ${valuesFilePath} --kubeconfig ${k8sConfigFilePath} --dry-run`;
    const { stdout: dryRunOut, stderr: dryRunError } = await exec(dryRunCommand, { maxBuffer: 8000 * 1024, cwd: `${packagePath}/${chartName}` });
    if (dryRunError) {
      return this.handleError(result, dryRunError);
    }

    // Install app
    var installCommand = `${helmPath} install ${appName} . -n ${nameSpace} -f ${valuesFilePath} --kubeconfig ${k8sConfigFilePath}`;
    const { stdout: installOutput, stderr: installError } = await exec(installCommand, { maxBuffer: 8000 * 1024, cwd: `${packagePath}/${chartName}` });
    if (installError) {
      return this.handleError(result, installError);
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
      return this.handleError(result, "Can not find cluster");
    }

    try {
      const { stdout, stderr } = await exec(`${this.helmPath} delete --kubeconfig ${k8sConfigFilePath} -n ${nameSpace} ${appName}`);
      result.status = 0;
      result.msg = `Delete helm app(${appName}) in namespace(${nameSpace}) of cluster(${clusterId}) successfully`;
      result.data = null;
    } catch(error){
      return this.handleError(result, `Can not delete helm app(${appName}) in namespace(${nameSpace}) of cluster(${clusterId})`);
    }
    return result;
  }
}

module.exports = HelmService;