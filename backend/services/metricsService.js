const k8s = require('@kubernetes/client-node');
const util = require('util');
const path = require('path');
const YAML = require('yaml');
const exec = util.promisify(require('child_process').exec);
const { getClusterConfigFile } = require('../utils/k8sConfig');

class MetricsService {
  constructor(config) {
    this.kc = new k8s.KubeConfig();
    console.log(config);
    this.kc.loadFromString(config);
    // this.k8sMetricsClient = this.kc.makeApiClient(k8s.MetricsV1Beta1Api);
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

      const { stdout, stderr } = await exec(`${this.helmPath} list --kubeconfig ${k8sConfigFilePath} -n ${nameSpace} -o json`);
      const apps = JSON.parse(stdout);
      const appsPromises = apps
      .filter(item => item !== null)
      .map(async (app) => {
        console.log(app.name);
        const appInfo = { name: app.name, cpu: 0, mem: 0, pods: [] };
        topPodsRes.map((pod) => {
          if (pod.Pod.metadata.name.startsWith(app.name)) {
            const podInfo = { name: pod.Pod.metadata.name, cpu: 0, mem: 0 };
            podInfo.cpu = pod.CPU.CurrentUsage * 1000;
            podInfo.mem = Number(pod.Memory.CurrentUsage)/1024/1024;
            appInfo.pods.push(podInfo);
            appInfo.cpu += podInfo.cpu;
            appInfo.mem += podInfo.mem;
          }
        })
        console.log(appInfo);
        appsMetrics.push(appInfo);
        /*
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
          })
        )
        */
      })

      /*
      const podsColumns = topPodsRes.map((pod) => {
        return {
            POD: pod.Pod.metadata.name,
            'CPU(cores)': pod.CPU.CurrentUsage,
            'MEMORY(bytes)': pod.Memory.CurrentUsage,
        };
      });
      console.log('Top pods');
      console.table(podsColumns);
      console.log(topPodsRes1[0].Containers);
      */

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