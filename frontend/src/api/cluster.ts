// frontend/src/api/cluster.ts
import axios from 'axios';

const urlPrefix: string = import.meta.env.VITE_API_PREFIX

export interface Cluster {
  id: string;
  name: string;
  address: string;
  version: string;
  created_at: string;
  status: string;
}

export interface K8sPod {
  [x: string]: any;
};

export interface AppStore {
  [x: string]: any;
};

// Define the function to call the testConnection API
export const testConnection = async (data: FormData) => {
  const resp = await axios.post(`${urlPrefix}/api/k8s/testConnection`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return resp.data;
};

export const addCluster = async (data: FormData) => {
  const resp = await axios.post(`${urlPrefix}/api/k8s/cluster`, data,
    { 
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return resp.data;
};

export const getClusters = async() => {
  const resp = await axios.get(`${urlPrefix}/api/k8s/clusters`);
  return resp.data;
};

const deleteCluster = async (clusterId: string) => {
  const resp = await axios.delete(`${urlPrefix}/api/k8s/cluster/${clusterId}`);
  return resp.data;
};

export const getCluster = async(clusterID: string) => {
  const resp = await axios.get(
    `${urlPrefix}/api/k8s/cluster/${clusterID}`
  );
  return resp.data;
}

export const getNamespaces = async (clusterID: string) => {
  const resp = await axios.get(
    `${urlPrefix}/api/k8s/namespaces/${clusterID}`
  );
  return resp.data;
}

export const getClusterOverview = async (clusterId: string) => {
  const resp = await axios.get(`${urlPrefix}/api/k8s/clusterOverview/${clusterId}`);
  return resp.data;
};

export const getPodList =  async(clusterID: string, nameSpace: string) => {
  const resp = await axios.get(
    `${urlPrefix}/api/k8s/pods/${clusterID}/${nameSpace}`
  );
  return resp.data;
};

export const getPodDetail = async(clusterID: string, nameSpace: string, podName: string) => {
  const resp = await axios.get(
    `${urlPrefix}/api/k8s/pod/${clusterID}/${nameSpace}/${podName}`
  );
  return resp.data;
};


export const getHelmAppList = async (clusterID: string, namespace: string) => {
  const resp = await axios.get(`${urlPrefix}/api/helm/apps/${clusterID}/${namespace}`);
  return resp.data;
};

export const getHelmApp = async (appName: string, clusterID: string, namespace: string) => {
  const resp = await axios.get(`${urlPrefix}/api/helm/app/${clusterID}/${namespace}/${appName}`);
  return resp.data;
};

export const deleteHelmApp = async (appName: string, clusterID: string, namespace: string) => {
  const resp = await axios.delete(`${urlPrefix}/api/helm/app/${clusterID}/${namespace}/${appName}`);
  return resp.data;
};

export const postHelmAppInstall = async (appname: string, chartname: string, chartversion: string, chartrepo: string, clusterid: string, namespace: string, values: string) => {
  const resp = await axios.post(
    `${urlPrefix}/api/helm/app`,
    JSON.stringify({
      appname: `${appname}`,
      chartname: `${chartname}`,
      chartversion: `${chartversion}`,
      chartrepo: `${chartrepo}`,
      clusterid: `${clusterid}`,
      namespace: `${namespace}`,
      values: `${values}`,
    }),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  return resp.data;
}

export const getNameSpaceMetrics = async (clusterID: string, namespace: string) => {
  const resp = await axios.get(`${urlPrefix}/api/metrics/namespace/${clusterID}/${namespace}`);
  return resp.data;
};

export const getNameSpaceResources = async (clusterID: string, namespace: string) => {
  const resp = await axios.get(`${urlPrefix}/api/k8s/resources/${clusterID}/${namespace}`);
  return resp.data;
};

export const getStorageClassList = async (clusterID: string) => {
  const resp = await axios.get(`${urlPrefix}/api/k8s/storageclasses/${clusterID}`);
  return resp.data;
};

export const getNodeList = async (clusterID: string) => {
  const resp = await axios.get(`${urlPrefix}/api/k8s/nodes/${clusterID}`);
  return resp.data;
};

export const postServiceType = async(clusterID: string, namespace: string, name: string, type: string) => {
  return axios.post(
    `${urlPrefix}/api/k8s/${clusterID}/service/servicetype`,
    JSON.stringify({
      namespace,
      name,
      type,
    }),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

export default { 
  testConnection, 
  addCluster, 
  getClusters, 
  deleteCluster, 
  getCluster, 
  getNamespaces, 
  getClusterOverview, 
  getPodList, 
  getPodDetail, 
  getHelmAppList, 
  getNameSpaceMetrics,
  getNameSpaceResources,
 };
