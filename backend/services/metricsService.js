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
    this.k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
    this.k8sMetricsClient = new k8s.Metrics(this.kc);
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
    const result = {};

    const k8sConfigFilePath = await getClusterConfigFile(clusterId);
    if (!k8sConfigFilePath) {
      return this.handleError(result, "Can not find cluster");
    }

    try {
      const appsMetrics = [];
      const topPodsRes = await k8s.topPods(this.k8sApi, this.k8sMetricsClient, nameSpace);
      const unknownAppInfo = { name: 'unknown', cpu: 0, mem: 0, pods: [] };
      const unknownApp = { name: 'unknown', namespace: nameSpace, };
      const { stdout, stderr } = await exec(`${this.helmPath} list --kubeconfig ${k8sConfigFilePath} -n ${nameSpace} -o json`);
      const apps = JSON.parse(stdout);
      apps.push(unknownApp);
      apps.filter(item => item !== null)
      .map(async (app) => {
        const appInfo = { name: app.name, cpu: 0, mem: 0, pods: [] };
        topPodsRes.map((pod) => {
          const podInfo = { name: pod.Pod.metadata.name, cpu: 0, mem: 0 };
          podInfo.cpu = pod.CPU.CurrentUsage * 1000;
          podInfo.mem = Number(pod.Memory.CurrentUsage)/1024/1024;
          if (pod.Pod.metadata.name.startsWith(app.name)) {
            appInfo.pods.push(podInfo);
            appInfo.cpu += podInfo.cpu;
            appInfo.mem += podInfo.mem;
          }
        })
        appsMetrics.push(appInfo);
      })

      topPodsRes.map((pod) => {
        var matchapp = 0;
        apps.filter(item => item !== null).map(async (app) => {
          if (pod.Pod.metadata.name.startsWith(app.name)) matchapp++;
        })
        if (matchapp === 0) {
          const podInfo = { name: pod.Pod.metadata.name, cpu: pod.CPU.CurrentUsage * 1000, mem: Number(pod.Memory.CurrentUsage)/1024/1024 };
          unknownAppInfo.pods.push(podInfo);
          unknownAppInfo.cpu += podInfo.cpu;
          unknownAppInfo.mem += podInfo.mem;
      }
      })
      if (unknownAppInfo.pods.length >0)
        appsMetrics.push(unknownAppInfo);

      result.status = 0;
      result.msg = "ok";
      result.data = appsMetrics;
      return result;
    } catch(error){
      console.log(error)
      return this.handleError(result, "Can not list helm app of cluster");
    }
  }

}

module.exports = MetricsService;