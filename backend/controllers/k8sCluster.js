const k8s = require('@kubernetes/client-node');
const { customAlphabet } = require('nanoid');
const { kubeadminDB, getClusterById } = require('../db');
const fs = require('fs');
const K8sService = require('../services/k8sService');


const nanoid = customAlphabet('abcdefghigklmnopqrstuvwxyz', 10)

getClusterInfo = async (config) => {
  try {
    const kc = new k8s.KubeConfig();
    kc.loadFromString(config);

    const k8sApi = kc.makeApiClient(k8s.VersionApi);
    const versionResponse = await k8sApi.getCode();

    return {
      version: versionResponse.body.gitVersion,
      address: kc.getCurrentCluster().server
    };
  } catch (error) {
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

    ctx.body = {
      status: 200,
      msg: 'Cluster added successfully.',
      code: 20000,
      data: { id: clusterId, name, createdAt }
    };
  } catch (error) {
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

    ctx.body = {
      status: 200,
      msg: 'Clusters retrieved successfully.',
      code: 20000,
      data: clusters
    };
  } catch (error) {
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

};

exports.clusterOverview = async (ctx) => {
  const { clusterId } = ctx.params;
  if (!clusterId) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: 'Cluster ID is required.',
      code: 1009,
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
    const cluster = await getClusterById(clusterId);
    if (!cluster) {
      ctx.status = 404;
      ctx.body = {
        status: 404,
        msg: 'Cluster not found.',
        code: 1013,
        data: null
      };
      return;
    }
    
    const k8sService = new K8sService(cluster.config);
    const pods = await k8sService.listPods(namespace);
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
    const cluster = await getClusterById(clusterId);
    if (!cluster) {
      ctx.status = 404;
      ctx.body = {
        status: 404,
        msg: 'Cluster not found.',
        code: 1013,
        data: null
      };
      return;
    }
    
    const k8sService = new K8sService(cluster.config);
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