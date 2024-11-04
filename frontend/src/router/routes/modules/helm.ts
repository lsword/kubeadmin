import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const HELMAPPS: AppRouteRecordRaw = {
  path: '/helm',
  name: 'helm',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.helm.applist',
    requiresAuth: true,
    icon: 'icon-apps',
    order: 2,
    title: '我的应用',
    hideInMenu: false,
  },
  children: [
    {
      path: 'applist',
      name: 'helm.applist',
      component: () => import('@/views/helm/applist/index.vue'),
      meta: {
        locale: 'menu.helm.applist',
        requiresAuth: true,
        // activeMenu: 'helm',
        roles: ['*'],
        title: '我的应用',
        hideInMenu: false,
      },
    },
    {
      path: 'app/:name',
      name: 'helm.app',
      component: () => import('@/views/helm/app/index.vue'),
      meta: {
        locale: 'menu.helm.app',
        requiresAuth: true,
        // activeMenu: 'helm',
        roles: ['*'],
        title: '我的应用',
        hideInMenu: false,
      },
    },
  ],
};

export default HELMAPPS;
