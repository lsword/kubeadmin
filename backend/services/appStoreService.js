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

  createResponse(code, msg, data = null) {
    return { code, msg, data };
  }

  async testConnection(type, address) {
    if (type === 'chartmuseum') return this.testConnectionOfChartmuseum(address);
    return this.createResponse(-1, `Unknown store type: ${type}`);
  }

  async testConnectionOfChartmuseum(address) {
    try {
      const response = await axios.get(address);
      if (response.status === 200) {
        return this.createResponse(0, `okok`);
      }
    } catch(error) {
      return this.createResponse(-1, `nonono`);
    }
    return this.createResponse(-1, `nonono`);
  }

  async listApps() {
    if (this.store.type === 'chartmuseum') return this.listAppsOfChartmuseum();
    return this.createResponse(-1, `Unknown store type: ${this.store.type}`);
  }

  async listAppsOfChartmuseum() {
    try {
      const response = await axios.get(this.store.address);
      return this.createResponse(0, 'ok', response.data);
    } catch (error) {
      return this.createResponse(-1, 'Failed to retrieve charts from ChartMuseum', { error: error.message});
    }
  }

  async getAppVersions(appname) {
    if (this.store.type === 'chartmuseum') return this.getChartmuseumAppVersions(appname);
    return this.createResponse(-1, `Unknown store type: ${this.store.type}`);
  }

  async getChartmuseumAppVersions(appname) {
    try {
      const response = await axios.get(`${this.store.address}/${appname}`);
      // console.log(`${this.store.address}/${appname}`)
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
      return this.createResponse(0, 'ok', appVersions);
      
    } catch (error) {
      return this.createResponse(-1, 'Failed to retrieve chart versions from ChartMuseum', { error: error.message});
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