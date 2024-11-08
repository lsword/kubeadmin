import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const WORKLOAD: AppRouteRecordRaw = {
  path: '/cluster',
  name: 'cluster',
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
      path: 'overview',
      name: 'cluster.overview',
      component: () => import('@/views/clusteroverview/index.vue'),
      meta: {
        locale: 'menu.clusteroverview',
        requiresAuth: true,
        activeMenu: 'cluster',
        roles: ['*'],
        title: '工作负载-POD',
        hideInMenu: true,
      },
    },
  ],
};

export default WORKLOAD;
