const k8s = require('@kubernetes/client-node');
const util = require('util');
const path = require('path');
const YAML = require('yaml');
const exec = util.promisify(require('child_process').exec);
const { getClusterConfigFile } = require('../utils/k8sConfig');

class MetricsService {
  constructor(config) {
    this.kc = new k8s.KubeConfig();
    this.kc.loadFromString(config);
    this.helmPath = path.resolve(__dirname, '../bin/helm');
  }
  
  async handleError(result, errorMsg, error) {
    console.error(`${errorMsg}:`, error);
    result.status = -1;
    result.msg = errorMsg;
    result.data = null;
    return result;
  }
  async getNamespaceMetrics(clusterId, nameSpace) {
    console.log("xxx")
    const result = {};

    const k8sConfigFilePath = await getClusterConfigFile(clusterId);
    if (!k8sConfigFilePath) {
      return this.handleError(result, "Can not find cluster");
    }

    try {
      const { stdout, stderr } = await exec(`${this.helmPath} list --kubeconfig ${k8sConfigFilePath} -n ${nameSpace} -o json`);
      const apps = JSON.parse(stdout);
      const appsPromises = apps
      .filter(item => item !== null)
      .map(async (app) => {
        console.log(app.name);
        
        const { stdout: manifestOut } = await exec(`${this.helmPath} get manifest ${app.name} --kubeconfig ${k8sConfigFilePath} -n ${nameSpace}`);
        const manifests = YAML.parseAllDocuments(manifestOut);
        manifests.forEach((item, index) => {
          const manifest = item.toJSON();
          if (manifest!==null && (manifest.kind === "Deployment" || manifest.kind === "DaemonSet" || manifest.kind === "StatefulSet")) {
            const labels = Object.keys(manifest.spec.selector.matchLabels).map(key => `${key}=${manifest.spec.selector.matchLabels[key]}`).join(",");
            console.log(labels);
          }
        });

        const appInfo = { name: app.name, cpu: 0, mem: 0, pods: [] };
        await Promise.allSettled(
          manifests
            .filter(item => item !== null && (item.kind === "Deployment" || item.kind === "DaemonSet" || item.kind === "StatefulSet"))
            .map(async (item) => {
              console.log(`${app.name}--${item.kind}`)
          }))
      })

      result.status = 0;
      result.msg = "ok";
      result.data = apps;
      return result;
    } catch(error){
      return this.handleError(result, "Can not list helm app of cluster");
    }
  }

}

module.exports = MetricsService;