import localeMessageBox from '@/components/message-box/locale/zh-CN';
import localeLogin from '@/views/login/locale/zh-CN';

import localeWorkplace from '@/views/dashboard/workplace/locale/zh-CN';

import localeCluster from '@/views/clusterlist/locale/zh-CN';
import localeClusterOverview from '@/views/clusteroverview/locale/zh-CN';

import localePodlist from '@/views/workload/podlist/locale/zh-CN';
import localePod from '@/views/workload/pod/locale/zh-CN';

import localeApplist from '@/views/helm/applist/locale/zh-CN';
import localeApp from '@/views/helm/app/locale/zh-CN';

import localeStorelist from '@/views/appstore/storelist/locale/zh-CN';

import localeStoreAppList from '@/views/appstore/storeapplist/locale/zh-CN';

import localeStoreAppDetail from '@/views/appstore/storeappdetail/locale/zh-CN';

import localeComponentsConfigeditor from '@/components/configeditor/locale/zh-CN';

import localeNodeList from '@/views/node/nodelist/locale/zh-CN';

import localeSettings from './zh-CN/settings';

export default {
  'menu.dashboard': '仪表盘',
  'menu.server.dashboard': '仪表盘-服务端',
  'menu.server.workplace': '工作台-服务端',
  'menu.server.monitor': '实时监控-服务端',
  'menu.list': '列表页',
  'menu.result': '结果页',
  'menu.exception': '异常页',
  'menu.form': '表单页',
  'menu.profile': '详情页',
  'menu.visualization': '数据可视化',
  'menu.user': '个人中心',
  'menu.arcoWebsite': 'Arco Design',
  'menu.faq': '常见问题',
  'navbar.docs': '文档中心',
  'navbar.action.locale': '切换为中文',
  'navbar.cluster': '集群',
  'navbar.namespace': '命名空间',
  'menu.clusteroverview': '概览',
  'menu.workload': '工作负载',
  'menu.workload.podlist': 'Pods',
  'menu.workload.deploymentlist': 'Deployments',
  'menu.service': '服务',
  'menu.service.servicelist': 'Services',
  'menu.service.ingresslist': 'Ingresses',
  'menu.storage': '存储',
  'menu.storage.pvclist': 'PVCs',
  'menu.storage.pvlist': 'PVs',
  'menu.storage.storageclasslist': 'StorageClasses',
  'menu.configdata': '配置数据',
  'menu.configdata.configmaplist': 'ConfigMap',
  'menu.configdata.secretlist': 'Secret',
  'menu.appstore': '应用仓库',
  'menu.helm.applist': '我的应用',
  'menu.helm.app': "MyApp",
  'menu.node': "主机节点",
  ...localeSettings,
  ...localeMessageBox,
  ...localeLogin,
  ...localeWorkplace,
  ...localeCluster,
  ...localeClusterOverview,
  ...localePodlist,
  ...localePod,
  ...localeApplist,
  ...localeApp,
  ...localeStorelist,
  ...localeStoreAppList,
  ...localeStoreAppDetail,
  ...localeComponentsConfigeditor,
  ...localeNodeList,
};
