import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const WORKLOAD: AppRouteRecordRaw = {
  path: '/clusteroverview',
  name: 'clusteroverview',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.clusteroverview',
    requiresAuth: true,
    icon: 'icon-dashboard',
    order: 1,
    title: '工作负载',
    hideInMenu: false,
  },
  children: [
    {
      path: '/clusteroverview',
      name: 'clusteroverview',
      component: () => import('@/views/clusteroverview/index.vue'),
      meta: {
        locale: 'menu.clusteroverview',
        requiresAuth: true,
        activeMenu: 'clusteroverview',
        roles: ['*'],
        title: '工作负载-POD',
        hideInMenu: true,
      },
    },
  ],
};

export default WORKLOAD;
