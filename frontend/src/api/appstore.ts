import axios from 'axios';

const urlPrefix: string = import.meta.env.VITE_API_PREFIX

const getAppStoreList = async () => {
  const resp = await axios.get(`${urlPrefix}/api/appstore/stores`);
  return resp.data;
};

const getAppStore = async (storeID: string) => {
  const resp = await axios.get(`${urlPrefix}/api/appstore/store/${storeID}`);
  return resp.data;
};

const getAppStoreAppList = async (appstoreID: string) => {
  const resp = await axios.get(`${urlPrefix}/api/appstore/store/apps/${appstoreID}`);
  return resp.data;
};

const getAppStoreAppVersions = async (appstoreID: string, chartName: string) => {
  const resp = await axios.get(`${urlPrefix}/api/appstore/store/appversions/${appstoreID}/${chartName}`);
  return resp.data;
};

const getAppStoreAppInfo = async (appstoreID: string, chartName: string ,chartVersion: string) => {
  const resp = await axios.get(`${urlPrefix}/api/appstore/store/app/${appstoreID}/${chartName}/${chartVersion}`);
  return resp.data;
};

const testAppStoreConnection = async (data: FormData) => {
  const resp = await axios.post(`${urlPrefix}/api/appstore/store/testConnection`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return resp.data;
};

const addAppStore = async (data: FormData) => {
  const resp = await axios.post(`${urlPrefix}/api/appstore/store`, data,
    { 
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return resp.data;
};

const deleteAppStore = async (appstoreID: string) => {
  const resp = await axios.delete(`${urlPrefix}/api/appstore/store/${appstoreID}`);
  return resp.data;
};

export default { 
  getAppStoreList,
  getAppStore,
  getAppStoreAppList, 
  getAppStoreAppVersions,
  getAppStoreAppInfo,
  testAppStoreConnection,
  addAppStore,
  deleteAppStore,
 };
