const axios = require('axios');

class AppStoreService {
  constructor(storeInfo) {
    this.store = storeInfo;
  }

  async listApps() {
    if (this.store.type === 'chartmuseum') return this.listAppsOfChartmuseum();
    return null;
  }

  async listAppsOfChartmuseum() {
    try {
      const response = await axios.get(this.store.address);
      const charts = response.data;
      // console.log(charts);
      return charts;
    } catch (error) {
      console.error('Failed to retrieve charts from ChartMuseum:', error.message);
      throw new Error('Failed to retrieve charts from ChartMuseum');
    }
  }

  async getAppVersions(appname) {
    if (this.store.type === 'chartmuseum') return this.getChartmuseumAppVersions(appname);
    return null;
  }

  async getChartmuseumAppVersions(appname) {
    try {
      const response = await axios.get(`${this.store.address}/${appname}`);
      // const charts = response.data;
      const appVersions = [];
      response.data.forEach(ver => {
        const appVersion = {};
        appVersion.name = ver.name;
        appVersion.version = ver.version;
        appVersion.apiVersion = ver.apiVersion;
        appVersion.appVersion = ver.appVersion;
        appVersion.created = ver.created;
        appVersion.description = ver.description;
        appVersions.push(appVersion);
      });
      console.log(appVersions);
      return appVersions;
    } catch (error) {
      console.error('Failed to retrieve charts from ChartMuseum:', error.message);
      throw new Error('Failed to retrieve charts from ChartMuseum');
    }
  }
}

module.exports = AppStoreService;