// const { exec } = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');

class HelmService {
  async listApps(configFilePath, namespace) {
        /*
    const helmPath = path.resolve(__dirname, '../bin/helm');
    return helmPath;
    */
    try {
      const helmPath = path.resolve(__dirname, '../bin/helm');
      const { stdout, stderr } = await exec(`${helmPath} list --kubeconfig ${configFilePath} -n ${namespace} -o json`);
      const apps = JSON.parse(stdout);
      console.log(configFilePath);
      return apps;
    } catch(error){
      console.log(error)
      return [];
    }

  }
}

module.exports = HelmService;