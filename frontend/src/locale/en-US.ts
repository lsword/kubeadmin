import localeMessageBox from '@/components/message-box/locale/en-US';
import localeLogin from '@/views/login/locale/en-US';

import localeWorkplace from '@/views/dashboard/workplace/locale/en-US';

import localeCluster from '@/views/clusterlist/locale/en-US';

import localePodlist from '@/views/workload/podlist/locale/en-US';
import localePod from '@/views/workload/pod/locale/en-US';

import localeApplist from '@/views/helm/applist/locale/en-US';

import localeStorelist from '@/views/appstore/storelist/locale/en-US';

import localeStoreAppList from '@/views/appstore/storeapplist/locale/en-US';

import localeStoreAppDetail from '@/views/appstore/storeappdetail/locale/en-US';

import localeComponentsConfigeditor from '@/components/configeditor/locale/en-US';

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
  'menu.appstore': 'AppStore',
  'menu.helm.applist': 'MyApps',
  ...localeSettings,
  ...localeMessageBox,
  ...localeLogin,
  ...localeWorkplace,
  ...localeCluster,
  ...localePodlist,
  ...localePod,
  ...localeApplist,
  ...localeStorelist,
  ...localeStoreAppList,
  ...localeStoreAppDetail,
  ...localeComponentsConfigeditor,
};
