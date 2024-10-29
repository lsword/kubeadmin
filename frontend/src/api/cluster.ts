// frontend/src/api/cluster.ts
import axios from 'axios';

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

// Define the function to call the testConnection API
const testConnection = (data: FormData) => {
  return axios.post('/api/k8s/testConnection', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};


const addCluster = async (data: FormData) => {
  return axios.post(`/api/k8s/cluster`, data,
    { 
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

const getClusters = async() => {
  return axios.get<Cluster[]>(`/api/k8s/clusters`);
};

const deleteCluster = async (clusterId: string) => {
  return axios.delete(`/api/k8s/cluster/${clusterId}`);
};

const getCluster = async(clusterID: string) => {
  return axios.get<Cluster>(
    `/api/k8s/cluster/${clusterID}`
  );
}

export function getNamespaces(clusterID: string) {
  return axios.get<string[]>(
    `/api/k8s/namespaces/${clusterID}`
  );
}

const getClusterOverview = async (clusterId: string) => {
  return axios.get<Cluster>(`/api/k8s/clusterOverview/${clusterId}`);
};

export function getPodList(clusterID: string, nameSpace: string) {
  return axios.get<K8sPod[]>(
    `/api/k8s/pods/${clusterID}/${nameSpace}`
  );
};

export function getPodDetail(clusterID: string, nameSpace: string, podName: string) {
  return axios.get<K8sPod>(
    `/api/k8s/pod/${clusterID}/${nameSpace}/${podName}`
  );
};

export const getHelmAppList = async (clusterID: string, namespace: string) => {
  return axios.get(`/api/helm/apps/${clusterID}/${namespace}`);
};

export const getAppStoreList = async () => {
  return axios.get(`/api/appstore/stores`);
};

export const getAppStore = async (storeID: string) => {
  return axios.get(`/api/appstore/store/${storeID}`);
};

export const getAppStoreAppList = async (appstoreID: string) => {
  return axios.get(`/api/appstore/apps/${appstoreID}`);
};

export const getAppStoreAppVersions = async (appstoreID: string, chartName: string) => {
  return axios.get(`/api/appstore/appversions/${appstoreID}/${chartName}`);
};

export const getAppStoreAppInfo = async (appstoreID: string, chartName: string ,chartVersion: string) => {
  return axios.get(`/api/appstore/app/${appstoreID}/${chartName}/${chartVersion}`);
};

export function getNodeList() {
  return null;
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
  getAppStoreList,
  getAppStore,
  getAppStoreAppList, 
  getAppStoreAppVersions,
  getAppStoreAppInfo,
 };
