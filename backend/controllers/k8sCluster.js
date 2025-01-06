const k8s = require('@kubernetes/client-node');
const { KubeConfig, Exec } = require('@kubernetes/client-node');
const { customAlphabet } = require('nanoid');
const { kubeadminDB, getClusterById } = require('../db');
const fs = require('fs');
const K8sService = require('../services/k8sService');
const logger = require('../utils/logger');

const nanoid = customAlphabet('abcdefghigklmnopqrstuvwxyz', 10)

var terminals = [];

getK8sService = async(clusterId) => {
  try {
    const cluster = await getClusterById(clusterId);
    if (!cluster) return null;
    const k8sService = new K8sService(clusterId, cluster.config);
    return k8sService;
  } catch(error) {
    return null;
  }
};

getClusterInfo = async (config) => {
  try {
    const kc = new k8s.KubeConfig();
    kc.loadFromString(config);

    const k8sApi = kc.makeApiClient(k8s.VersionApi);
    const versionResponse = await k8sApi.getCode();

    logger.info(`getClusterInfo ok: ${kc.getCurrentCluster().server}, ${versionResponse.body.gitVersion}`);
    return {
      version: versionResponse.body.gitVersion,
      address: kc.getCurrentCluster().server
    };
  } catch (error) {
    logger.error(`getClusterInfo failed: ${error}`);
    return null;
  }
}

getClusterNamespaces = async (config) => {
  try {
    const kc = new k8s.KubeConfig();
    kc.loadFromString(config);

    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

    const namespaces = await k8sApi.listNamespace();
    const data=[];
    // console.log(namespaces.body.items)
    namespaces.body.items.forEach((item)=> {
      data.push(item.metadata.name);
    });
    return data;
  } catch (error) {
    logger.error(`getClusterNamespaces failed: ${error}`);
    return [];
  }
}

exports.uploadFile = async (ctx) => {
  /*
  console.log("xxx")
  const file = ctx.request.body.file;
  if (!file) {
    ctx.status = 400;
    ctx.body = 'No file uploaded.';
    return;
  }
  ctx.body = {
    message: 'File uploaded successfully',
    filePath: file.path
  };
  */
  const response = {
    code: 20000,
    status: 'ok',
    msg: '',
    data: {}
  }
  ctx.body = response;
  ctx.status = 200;
};

exports.testConnection = async (ctx) => {
  const { config } = ctx.request.body;

  if (!config) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: 'No file uploaded.',
      code: 1001, // Custom error code for no file
      data: null
    };
    return;
  }

  clusterInfo = await getClusterInfo(config);
  
  if (!clusterInfo) {
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: 'Failed to connect to Kubernetes cluster',
      code: 50000, // Custom error code for connection failure
      data: null
    };
  }
  else {
    ctx.body = {
      status: 200,
      msg: 'Connection to Kubernetes cluster is successful',
      code: 20000, // Custom success code
      data: {
        version: clusterInfo.version,
        address: clusterInfo.address,
      }
    };
  }
};

exports.addCluster = async (ctx) => {
  const { name, config } = ctx.request.body;

  if (!name || !config) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: 'Cluster name and certificate file are required.',
      code: 1003,
      data: null
    };
    return;
  }

  try {
    let clusterInfo = await getClusterInfo(config);
    console.log(clusterInfo)
    if (!clusterInfo) {
      ctx.status = 200;
      ctx.body = {
        status: 500,
        msg: 'Failed to connect to Kubernetes cluster',
        code: 50000, // Custom error code for connection failure
        data: null
      };
      return;
    }
  
    const clusterId = nanoid();
    const createdAt = new Date().toISOString();

    const db = await kubeadminDB();

    // Synchronous-like insertion using async/await
    await db.run(
      `INSERT INTO clusters (id, name, config, address, version, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [clusterId, name, config, clusterInfo.address, clusterInfo.version, createdAt]
    );

    logger.info(`addCluster successed`);

    ctx.body = {
      status: 200,
      msg: 'Cluster added successfully.',
      code: 20000,
      data: { id: clusterId, name, createdAt }
    };
  } catch (error) {
    logger.error(`addCluster failed: ${error}`);
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: 'Failed to connect to Kubernetes cluster.',
      code: 1002,
      data: { error: error.message }
    };
  }
};

exports.getClusters = async (ctx) => {
  try {
    const db = await kubeadminDB();
    const clusters = await db.all('SELECT id, name, address, version, created_at FROM clusters');
    logger.info(`getClusters successed`);
    ctx.body = {
      status: 200,
      msg: 'Clusters retrieved successfully.',
      code: 20000,
      data: clusters
    };
  } catch (error) {
    console.log(error)
    logger.error(`getClusters failed: ${error}`);
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: 'Failed to retrieve clusters.',
      code: 1005,
      data: { error: error.message }
    };
  }
};

exports.getCluster = async (ctx) => {
  const { clusterId } = ctx.params;

  if (!clusterId) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: 'Cluster ID is required.',
      code: 1006,
      data: null
    };
    return;
  }

  try {
    const db = await kubeadminDB();
    const cluster = await db.get('SELECT id, name, config, address, version, created_at FROM clusters WHERE id = ?', clusterId);
    if (!cluster) {
      ctx.status = 404;
      ctx.body = {
        status: 404,
        msg: 'Cluster not found.',
        code: 40400,
        data: null
      };
      return;
    }
    const data = {};
    data.id = cluster.id;
    data.name = cluster.name;
    data.address = cluster.address;
    data.curNamespace = "";
    data.namespaces = await getClusterNamespaces(cluster.config);
    if (data.namespaces.length > 0 ) {
      data.curNamespace = data.namespaces[0];
    }
    ctx.body = {
      status: 200,
      msg: 'Cluster retrieved successfully.',
      code: 20000,
      data: data,
    };
  } catch (error) {
    logger.error(`getCluster failed: ${error}`);
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: 'Failed to retrieve clusters.',
      code: 1005,
      data: { error: error.message }
    };
  }
};

exports.deleteCluster = async (ctx) => {
  const { clusterId } = ctx.params;

  if (!clusterId) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: 'Cluster ID is required.',
      code: 1006,
      data: null
    };
    return;
  }

  try {
    const db = await kubeadminDB();
    const result = await db.run('DELETE FROM clusters WHERE id = ?', clusterId);

    if (result.changes === 0) {
      ctx.status = 404;
      ctx.body = {
        status: 404,
        msg: 'Cluster not found.',
        code: 1007,
        data: null
      };
      return;
    }

    ctx.body = {
      status: 200,
      msg: 'Cluster deleted successfully.',
      code: 2003,
      data: null
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: 'Failed to delete cluster.',
      code: 1008,
      data: { error: error.message }
    };
  }
};

exports.getNamespaces = async (ctx) => {
  const { clusterId } = ctx.params;
  if (!clusterId) {
    ctx.body = {
      code: -1,
      msg: 'Cluster ID is required.',
      data: null
    };
    return;
  }

  try {
    const k8sService = await getK8sService(clusterId);
    if (!k8sService) {
      ctx.status = 200;
      ctx.body = {
        code: -1,
        msg: 'Cluster not found.',
        data: null
      };
      return;
    }
    
    const namespaces = await k8sService.getNamespaceList();
    ctx.status = 200;
    ctx.body = {
      code: -1,
      msg: 'Cluster not found.',
      data: namespaces
    };
  }
  catch(error) {
    ctx.status = 200;
    ctx.body = {
      code: -1,
      msg: 'Cluster not found.',
      data: null
    };
  }
  /*
  const cluster = await getClusterById(clusterId);
  if (!cluster) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: 'Cluster ID is required.',
      code: 1009,
      data: null
    };
    return;
  }

  ctx.body = {
    status: 200,
    msg: 'Cluster namespaces retrieved successfully.',
    code: 20000,
    data: await getClusterNamespaces(cluster.config),
  };
  */

};

exports.clusterOverview = async (ctx) => {
  const { clusterId } = ctx.params;
  if (!clusterId) {
    ctx.body = {
      code: -1,
      msg: 'Cluster ID is required.',
      data: null
    };
    return;
  }

  try {
    const db = await kubeadminDB();
    // const cluster = await db.get('SELECT * FROM clusters WHERE id = ?', clusterId);
    console.log(clusterId);
    const cluster = await db.get('SELECT id, name, address, version, created_at FROM clusters WHERE id = ?', clusterId);
    const resdata = {};

    if (!cluster) {
      ctx.status = 404;
      ctx.body = {
        status: 404,
        msg: 'Cluster not found.',
        code: 1010,
        data: null
      };
      return;
    }

    // resdata.id = cluster.id;
    resdata.name = cluster.name;
    resdata.curNamespace = "default";
    ctx.body = {
      status: 200,
      msg: 'Cluster overview retrieved successfully.',
      code: 20000,
      data: resdata
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: 'Failed to retrieve cluster overview.',
      code: 1011,
      data: { error: error.message }
    };
  }
};

//listNamespacedPod
exports.getNamespacedPods = async (ctx) => {
  const { clusterId, namespace } = ctx.params;

  if (!clusterId || !namespace) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: 'Cluster ID and namespace are required.',
      code: 1012,
      data: null
    };
    return;
  }

  try {
    const k8sService = await getK8sService(clusterId);
    if (!k8sService) {
      ctx.status = 200;
      ctx.body = {
        code: -1,
        msg: 'Cluster not found.',
        data: null
      };
      return;
    }
    
    const pods = await k8sService.getPodList(namespace);
    ctx.body = {
      status: 200,
      msg: 'Pods retrieved successfully.',
      code: 20000,
      data: pods
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: 'Failed to retrieve pods.',
      code: 1014,
      data: { error: error.message }
    };
  }
};

exports.getNamespacedPodDetail = async (ctx) => {
  const { clusterId, namespace, podname } = ctx.params;

  if (!clusterId || !namespace || !podname) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: 'Cluster ID, namespace, and podname are required.',
      code: 1012,
      data: null
    };
    return;
  }

  try {
    const k8sService = await getK8sService(clusterId);
    if (!k8sService) {
      ctx.status = 200;
      ctx.body = {
        code: -1,
        msg: 'Cluster not found.',
        data: null
      };
      return;
    }
    const pods = await k8sService.getPodDetail(namespace, podname);
    ctx.body = {
      status: 200,
      msg: 'Pods retrieved successfully.',
      code: 20000,
      data: pods
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: 'Failed to retrieve pods.',
      code: 1014,
      data: { error: error.message }
    };
  }
};

exports.getNamespacedResources = async (ctx) => {
  const { clusterId, namespace } = ctx.params;

  if (!clusterId || !namespace) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: 'Cluster ID, namespace, and podname are required.',
      code: 1012,
      data: null
    };
    return;
  }

  try {
    const k8sService = await getK8sService(clusterId);
    if (!k8sService) {
      ctx.status = 200;
      ctx.body = {
        code: -1,
        msg: 'Cluster not found.',
        data: null
      };
      return;
    }
    
    const resources = await k8sService.getResources(clusterId, namespace);
    
    ctx.body = {
      status: 200,
      msg: 'Resources retrieved successfully.',
      code: 20000,
      data: resources
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: 'Failed to retrieve pods.',
      code: 1014,
      data: { error: error.message }
    };
  }
}

exports.getStorageClasses = async (ctx) => {
  const { clusterId } = ctx.params;

  if (!clusterId) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: 'Cluster ID are required.',
      code: 1012,
      data: null
    };
    return;
  }

  try {
    const k8sService = await getK8sService(clusterId);
    if (!k8sService) {
      ctx.status = 200;
      ctx.body = {
        code: -1,
        msg: 'Cluster not found.',
        data: null
      };
      return;
    }

    const k8sStorageClasses = await k8sService.getStorageClassList(clusterId);
    ctx.body = {
      status: 200,
      msg: 'StorageClasses retrieved successfully.',
      code: 20000,
      data: k8sStorageClasses
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: 'Failed to retrieve storageclasses.',
      code: 1014,
      data: { error: error.message }
    };
  }
};

exports.getNodes = async (ctx) => {
  const { clusterId } = ctx.params;

  if (!clusterId) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: 'Cluster ID are required.',
      code: 1012,
      data: null
    };
    return;
  }

  try {
    const k8sService = await getK8sService(clusterId);
    if (!k8sService) {
      ctx.status = 200;
      ctx.body = {
        code: -1,
        msg: 'Cluster not found.',
        data: null
      };
      return;
    }

    const k8sStorageClasses = await k8sService.getNodeList(clusterId);
    ctx.body = {
      status: 200,
      msg: 'Nodes retrieved successfully.',
      code: 20000,
      data: k8sStorageClasses
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: 'Failed to retrieve nodes.',
      code: 1014,
      data: { error: error.message }
    };
  }
};

exports.postServiceType = async (ctx) => {
  const { clusterId } = ctx.params;

  if (!clusterId) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: 'Cluster ID are required.',
      code: 1012,
      data: null
    };
    return;
  }
  var reqbody = ctx.request.body;

  console.log(reqbody)
  try {
    const k8sService = await getK8sService(clusterId);
    if (!k8sService) {
      ctx.status = 200;
      ctx.body = {
        code: -1,
        msg: 'Cluster not found.',
        data: null
      };
      return;
    }

    const result = await k8sService.postServiceType(reqbody.namespace, reqbody.name, reqbody.type);
    console.log(result);
    ctx.body = {
      status: 200,
      msg: 'Nodes retrieved successfully.',
      code: 20000,
      data: null
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 500,
      msg: 'Failed to update Service Type .',
      code: 1014,
      data: { error: error.message }
    };
  }
}  

exports.deletePod = async (ctx) => {
  const { clusterId, namespace, podName, force } = ctx.params;

  ctx.status = 200;
  try {
    const k8sService = await getK8sService(clusterId);
    const result = await k8sService.deletePod(namespace, podName, force);
    ctx.body = {
      code: result.code,
      msg: result.msg,
      data: null
    };
  } catch (error) {
    ctx.body = {
      code: -1,
      msg: 'deletePod error.',
      data: { error: error.message }
    };
  }
};

exports.newTerminal = async (ctx) => {
  const stream = require('stream');
  const stdout = new stream.PassThrough();
  const stderr = new stream.PassThrough();
  const stdin = new stream.PassThrough();
 
  let exec = undefined;
  let resizeData = undefined;

  const textDecoder = new TextDecoder();
  ctx.websocket.on('message', async (input) => {
    try {
      const data = JSON.parse(textDecoder.decode(input));
      if (data.type === 'init') {
        try {
          const cluster = await getClusterById(data.clusterid);
          const kc = new k8s.KubeConfig();
          kc.loadFromString(cluster.config);
          exec = new Exec(kc);
          exec.exec(
            data.namespace,
            data.podname,
            data.containername, //undefined,
            ['sh'],
            stdout,
            stderr,
            stdin,
            true, // tty
            (status) => {
              if (status.status !== 'Success') {
                ctx.websocket.send(`Error: ${status.message}`);
              }
            }
          );
          stdout.on('data', (data) => ctx.websocket.send(data));
          stderr.on('data', (data) => ctx.websocket.send(data));
          if (resizeData) {
            stdout.rows = resizeData.rows;
            stdout.columns = resizeData.cols;
            stdout.emit('resize');
            stderr.rows = resizeData.rows;
            stderr.columns = resizeData.cols;
            stderr.emit('resize');
            stdin.rows = resizeData.rows;
            stdin.columns = resizeData.cols;
            stdin.emit('resize');
  
          }
        } catch (error) {
          console.log(`Failed to start shell: ${error.message}`)
          ctx.websocket.send(`Failed to start shell: ${error.message}`);
        }
      }
      else if (data.type === 'resize') {
        resizeData = {};
        resizeData.cols = data.cols;
        resizeData.rows = data.rows;
        if (exec) {
          console.log("resize exec:", resizeData.cols, resizeData.rows)
          stdout.rows = resizeData.rows;
          stdout.columns = resizeData.cols;
          stdout.emit('resize');
          stderr.rows = resizeData.rows;
          stderr.columns = resizeData.cols;
          stderr.emit('resize');
          stdin.rows = resizeData.rows;
          stdin.columns = resizeData.cols;
          stdin.emit('resize');
        }
      } else {
        stdin.write(input); // Append newline character
      }
    } catch (e) {
      stdin.write(input); // Fallback for non-JSON input
    }
  });

  ctx.websocket.on('close', () => {
    stdin.end();
  });
}

exports.resizeTerminal = async (ctx) => {
  const { terminalId } = ctx.params;
}

exports.terminal = async (ctx) => {
  const { terminalId } = ctx.params;
}