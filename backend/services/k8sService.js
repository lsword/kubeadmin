const k8s = require('@kubernetes/client-node');

class K8sService {
  constructor(config) {
    this.kc = new k8s.KubeConfig();
    this.kc.loadFromString(config);
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
  // Add more methods for other Kubernetes interactions as needed
}

module.exports = K8sService;