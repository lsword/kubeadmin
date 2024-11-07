import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const APPSTORE: AppRouteRecordRaw = {
  path: '/appstore',
  name: 'appstore',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.appstore',
    requiresAuth: true,
    icon: 'icon-command',
    order: 3,
    title: '应用仓库',
    hideInMenu: false,
  },
  children: [
    {
      path: 'storelist',
      name: 'appstore.storelist',
      component: () => import('@/views/appstore/storelist/index.vue'),
      meta: {
        locale: 'menu.appstore',
        requiresAuth: true,
        activeMenu: 'appstore',
        roles: ['*'],
        title: '应用仓库',
        hideInMenu: true,
      },
    },
    {
      path: 'storeapplist/:storeid',
      name: 'appstore.storeapplist',
      component: () => import('@/views/appstore/storeapplist/index.vue'),
      meta: {
        locale: 'menu.appstore',
        requiresAuth: true,
        activeMenu: 'appstore.storelist',
        roles: ['*'],
        title: '应用仓库',
        hideInMenu: true,
      },
    },
    {
      path: 'storeappdetail/:storeid/:chartname',
      name: 'appstore.storeappdetail',
      component: () => import('@/views/appstore/storeappdetail/index.vue'),
      meta: {
        locale: 'menu.appstore',
        requiresAuth: true,
        activeMenu: 'appstore.storelist',
        roles: ['*'],
        title: '应用仓库',
        hideInMenu: true,
      },
    },
  ],
};

export default APPSTORE;
