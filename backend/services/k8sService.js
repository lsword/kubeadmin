const k8s = require('@kubernetes/client-node');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

class K8sService {
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

  async listPods(namespace) {
    try {
      const k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
      const response = await k8sApi.listNamespacedPod(namespace);
      return response.body.items;
    } catch (error) {
      throw new Error(`Failed to list pods: ${error.message}`);
    }
  }

  async getPodDetail(namespace, podname) {
    try {
      const k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
      const response = await k8sApi.readNamespacedPod(podname, namespace);
      return response.body;
    } catch (error) {
      throw new Error(`Failed to list pods: ${error.message}`);
    }
  }

}

module.exports = K8sService;