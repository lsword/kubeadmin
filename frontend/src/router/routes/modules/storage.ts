import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const WORKLOAD: AppRouteRecordRaw = {
  path: '/storage',
  name: 'storage',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.storage',
    requiresAuth: true,
    icon: 'icon-storage',
    order: 7,
    title: '存储',
  },
  children: [
    {
      path: 'pvclist',
      name: 'pvclist',
      component: () => import('@/views/storage/pvclist/index.vue'),
      meta: {
        locale: 'menu.storage.pvclist',
        requiresAuth: true,
        roles: ['*'],
        title: 'PVCList',
      },
    },
    {
      path: 'pvc/:name',
      name: 'pvc',
      component: () => import('@/views/storage/pvcdetail/index.vue'),
      meta: {
        locale: 'menu.storage.pvcdetail',
        requiresAuth: true,
        roles: ['*'],
        hideInMenu: true,
        activeMenu: 'pvclist',
        title: 'PVC',
      },
    },
    {
      path: 'pvlist',
      name: 'pvlist',
      component: () => import('@/views/storage/pvlist/index.vue'),
      meta: {
        locale: 'menu.storage.pvlist',
        requiresAuth: true,
        roles: ['*'],
        title: 'PVList',
      },
    },
    {
      path: 'pv/:name',
      name: 'pv',
      component: () => import('@/views/storage/pvdetail/index.vue'),
      meta: {
        locale: 'menu.storage.pvdetail',
        requiresAuth: true,
        roles: ['*'],
        hideInMenu: true,
        activeMenu: 'pvlist',
        title: 'pvlist',
      },
    },
    {
      path: 'storageclasslist',
      name: 'storageclasslist',
      component: () => import('@/views/storage/storageclasslist/index.vue'),
      meta: {
        locale: 'menu.storage.storageclasslist',
        requiresAuth: true,
        roles: ['*'],
        title: 'StorageClass',
      },
    },
  ],
};

export default WORKLOAD;
