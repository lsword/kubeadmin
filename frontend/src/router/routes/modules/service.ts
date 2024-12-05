import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const WORKLOAD: AppRouteRecordRaw = {
  path: '/service',
  name: 'service',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.service',
    requiresAuth: true,
    icon: 'icon-share-alt',
    order: 5,
    title: '服务',
  },
  children: [
    {
      path: 'servicelist',
      name: 'servicelist',
      component: () => import('@/views/service/servicelist/index.vue'),
      meta: {
        locale: 'menu.service.servicelist',
        requiresAuth: true,
        roles: ['*'],
        title: '服务',
      },
    },
    {
      path: 'service/:name',
      name: 'service',
      component: () => import('@/views/service/servicedetail/index.vue'),
      meta: {
        locale: 'menu.service.servicedetail',
        requiresAuth: true,
        roles: ['*'],
        hideInMenu: true,
        activeMenu: 'servicelist',
        title: '工作负载-POD',
      },
    },
    {
      path: 'ingresslist',
      name: 'ingresslist',
      component: () => import('@/views/service/ingresslist/index.vue'),
      meta: {
        locale: 'menu.service.ingresslist',
        requiresAuth: true,
        roles: ['*'],
        title: '服务',
      },
    },
    {
      path: 'ingress/:name',
      name: 'ingress',
      component: () => import('@/views/service/ingressdetail/index.vue'),
      meta: {
        locale: 'menu.service.ingressdetail',
        requiresAuth: true,
        roles: ['*'],
        hideInMenu: true,
        activeMenu: 'ingresslist',
        title: 'Ingress',
      },
    },
  ],
};

export default WORKLOAD;
