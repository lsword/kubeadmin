const k8s = require('@kubernetes/client-node');
const util = require('util');
const path = require('path');
const exec = util.promisify(require('child_process').exec);
const { getClusterConfigFile } = require('../utils/k8sConfig');
const { kubeadminDB, getClusterById } = require('../db');

class K8sService {
  constructor(clusterId, config) {
    this.clusterId = clusterId;
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

  async getNamespaceList() {
    try {

      const k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
      const namespaces = await k8sApi.listNamespace();
      const data=[];
      // console.log(namespaces.body.items)
      namespaces.body.items.forEach((item)=> {
        data.push(item.metadata.name);
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to list namespace: ${error.message}`);
    }
  }

  async getPodList(namespace) {
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

  async getDeploymentList(namespace) {
    try {
      const k8sApi = this.kc.makeApiClient(k8s.AppsV1Api);
      const response = await k8sApi.listNamespacedDeployment(namespace);
      return response.body.items;
    } catch (e) {
      throw new Error(`Failed to list deployments: ${error.message}`);
    }
  }

  async getStatefulSetList(namespace) {
    try {
      const k8sApi = this.kc.makeApiClient(k8s.AppsV1Api);
      const response = await k8sApi.listNamespacedStatefulSet(namespace);
      return response.body.items;
    } catch (e) {
      throw new Error(`Failed to list statefulsets: ${error.message}`);
    }
  }

  async getDaemonSetList(namespace) {
    try {
      const k8sApi = this.kc.makeApiClient(k8s.AppsV1Api);
      const response = await k8sApi.listNamespacedDaemonSet(namespace);
      return response.body.items;
    } catch (e) {
      throw new Error(`Failed to list daemonsets: ${error.message}`);
    }
  }

  async getServiceList(namespace) {
    try {
      const k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
      const response = await k8sApi.listNamespacedService(namespace);
      return response.body.items;
    } catch (e) {
      throw new Error(`Failed to list services: ${error.message}`);
    }
  }
  
  async getIngressList(namespace) {
    try {
      const k8sApi = this.kc.makeApiClient(k8s.NetworkingV1Api);
      const response = await k8sApi.listNamespacedIngress(namespace);
      return response.body.items;
    } catch (e) {
      throw new Error(`Failed to list ingresses: ${error.message}`);
    }
  }
  
  async getConfigMapList(namespace) {
    try {
      const k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
      const response = await k8sApi.listNamespacedConfigMap(namespace);
      return response.body.items;
    } catch (e) {
      throw new Error(`Failed to list configmaps: ${error.message}`);
    }
  }

  async getSecretList(namespace) {
    try {
      const k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
      const response = await k8sApi.listNamespacedSecret(namespace);
      return response.body.items;
    } catch (e) {
      throw new Error(`Failed to list secrets: ${error.message}`);
    }
  }

  async getPVCList(namespace) {
    try {
      const k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
      const response = await k8sApi.listNamespacedPersistentVolumeClaim(namespace);
      return response.body.items;
    } catch (e) {
      throw new Error(`Failed to list pvcs: ${error.message}`);
    }
  }

  async getStorageClassList(namespace) {
    try {
      const k8sApi = this.kc.makeApiClient(k8s.StorageV1Api);
      const response = await k8sApi.listStorageClass();
      return response.body.items;
    } catch (e) {
      throw new Error(`Failed to list pvcs: ${error.message}`);
    }
  }

  async getResources(clusterid, namespace) {
    const resources = {};
    const deploymentList = await this.getDeploymentList(namespace);
    const statefulsetList = await this.getStatefulSetList(namespace);
    const daemonsetList = await this.getDaemonSetList(namespace);
    const serviceList = await this.getServiceList(namespace);
    const ingressList = await this.getIngressList(namespace);
    const configmapList = await this.getConfigMapList(namespace);
    const secretList = await this.getSecretList(namespace);
    const pvcList = await this.getPVCList(namespace);

    resources.deployment = deploymentList.length;
    resources.statefulSet = statefulsetList.length;
    resources.daemonSet = daemonsetList.length;
    resources.service = serviceList.length;
    resources.ingress = ingressList.length;
    resources.configmap = configmapList.length;
    resources.secret = secretList.length;
    resources.PVC = pvcList.length;

    const k8sConfigFilePath = await getClusterConfigFile(clusterid);
    if (!k8sConfigFilePath) {
      return this.handleError(result, "Can not find cluster");
    }

    try {
      //获取已安装的应用
      const { stdout, stderr } = await exec(`${this.helmPath} list --kubeconfig ${k8sConfigFilePath} -n ${namespace} -o json`);
      var apps = JSON.parse(stdout);
      apps = apps.filter(item => item !== null);
      
      resources.apps = apps
    } catch(e) {
      console.log(e)
    }
  
    const podList = await this.getPodList(namespace);
    resources.pods = podList;
    
    return resources
  }
}

module.exports = K8sService;