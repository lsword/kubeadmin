import localeMessageBox from '@/components/message-box/locale/en-US';
import localeLogin from '@/views/login/locale/en-US';

import localeWorkplace from '@/views/dashboard/workplace/locale/en-US';

import localeCluster from '@/views/clusterlist/locale/en-US';
import localeClusterOverview from '@/views/clusteroverview/locale/en-US';

import localePodlist from '@/views/workload/podlist/locale/en-US';
import localePod from '@/views/workload/pod/locale/en-US';

import localeApplist from '@/views/helm/applist/locale/en-US';

import localeApp from '@/views/helm/app/locale/en-US';

import localeStorelist from '@/views/appstore/storelist/locale/en-US';

import localeStoreAppList from '@/views/appstore/storeapplist/locale/en-US';

import localeStoreAppDetail from '@/views/appstore/storeappdetail/locale/en-US';

import localeComponentsConfigeditor from '@/components/configeditor/locale/en-US';

import localeNodeList from '@/views/node/nodelist/locale/en-US';

import localeSettings from './en-US/settings';

export default {
  'menu.dashboard': 'Dashboard',
  'menu.server.dashboard': 'Dashboard-Server',
  'menu.server.workplace': 'Workplace-Server',
  'menu.server.monitor': 'Monitor-Server',
  'menu.list': 'List',
  'menu.result': 'Result',
  'menu.exception': 'Exception',
  'menu.form': 'Form',
  'menu.profile': 'Profile',
  'menu.visualization': 'Data Visualization',
  'menu.user': 'User Center',
  'menu.arcoWebsite': 'Arco Design',
  'menu.faq': 'FAQ',
  'navbar.docs': 'Docs',
  'navbar.action.locale': 'Switch to English',
  'navbar.cluster': 'Cluster',
  'navbar.namespace': 'Namespace',
  'menu.clusteroverview': 'Overview',
  'menu.workload': 'Workload',
  'menu.workload.podlist': 'Pods',
  'menu.workload.deploymentlist': 'Deployments',
  'menu.service': 'Service',
  'menu.service.servicelist': 'Services',
  'menu.service.ingresslist': 'Ingresses',
  'menu.storage': 'Storage',
  'menu.storage.pvclist': 'PVCs',
  'menu.storage.pvlist': 'PVs',
  'menu.storage.storageclasslist': 'StorageClasses',
  'menu.configdata': 'ConfigData',
  'menu.configdata.configmaplist': 'ConfigMap',
  'menu.configdata.secretlist': 'Secret',
  'menu.appstore': 'AppStore',
  'menu.helm.applist': 'MyApps',
  'menu.helm.app': "MyApp",
  'menu.node': "Node",
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
