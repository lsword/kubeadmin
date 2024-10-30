const axios = require('axios');
const path = require('path');
const fs = require('fs');
const compressing = require('compressing');
const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('abcdefghigklmnopqrstuvwxyz', 10)

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

  async getAppPackagePath(appname, appversion) {
    if (this.store.type === 'chartmuseum') return this.getChartmuseumAppPackagePath(appname, appversion);
    return null;
  }

  async getChartmuseumAppPackagePath(appname, appversion) {
    const chartUrl = `${this.store.address.replace('/api/', '/')}/${appname}-${appversion}.tgz`;

    try {
      const response = await axios.get(chartUrl, {
        responseType: 'arraybuffer'
      })
      const buffer = response.data;
      const tmpDir = path.resolve(__dirname, '../tmp/chart', nanoid());
      fs.mkdirSync(tmpDir, { recursive: true });
      try {
        await compressing.tgz.uncompress(buffer, tmpDir);
        return tmpDir;
      } catch(error) {
        return null;
      }
    }catch(error) {
      return null;
    }
  }
}

module.exports = AppStoreService;