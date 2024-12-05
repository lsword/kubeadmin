import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const WORKLOAD: AppRouteRecordRaw = {
  path: '/service',
  name: 'service',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.configdata',
    requiresAuth: true,
    icon: 'icon-book',
    order: 6,
    title: '服务',
  },
  children: [
    {
      path: 'configmaplist',
      name: 'configmaplist',
      component: () => import('@/views/configmap/configmaplist/index.vue'),
      meta: {
        locale: 'menu.configdata.configmaplist',
        requiresAuth: true,
        roles: ['*'],
        title: 'ConfigmapList',
      },
    },
    {
      path: 'configmap/:name',
      name: 'configmap',
      component: () => import('@/views/configmap/configmapdetail/index.vue'),
      meta: {
        locale: 'menu.configdata.configmapdetail',
        requiresAuth: true,
        roles: ['*'],
        hideInMenu: true,
        activeMenu: 'configmaplist',
        title: 'Configmap',
      },
    },
    {
      path: 'secretlist',
      name: 'secretlist',
      component: () => import('@/views/secret/secretlist/index.vue'),
      meta: {
        locale: 'menu.configdata.secretlist',
        requiresAuth: true,
        roles: ['*'],
        title: 'SecretList',
      },
    },
    {
      path: 'secret/:name',
      name: 'secret',
      component: () => import('@/views/secret/secretdetail/index.vue'),
      meta: {
        locale: 'menu.configdata.secretdetail',
        requiresAuth: true,
        roles: ['*'],
        hideInMenu: true,
        activeMenu: 'secretlist',
        title: 'Secret',
      },
    },
  ],
};

export default WORKLOAD;
