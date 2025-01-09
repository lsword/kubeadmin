import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const WORKLOAD: AppRouteRecordRaw = {
  path: '/workload',
  name: 'workload',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.workload',
    requiresAuth: true,
    icon: 'icon-list',
    order: 4,
    title: '工作负载',
  },
  children: [
    {
      path: 'podlist',
      name: 'podlist',
      component: () => import('@/views/workload/podlist/index.vue'),
      meta: {
        locale: 'menu.workload.podlist',
        requiresAuth: true,
        roles: ['*'],
        title: '工作负载-PodList',
      },
    },
    {
      path: 'pod/:name',
      name: 'pod',
      component: () => import('@/views/workload/pod/index.vue'),
      meta: {
        locale: 'menu.workload.pod',
        requiresAuth: true,
        roles: ['*'],
        hideInMenu: true,
        activeMenu: 'podlist',
        title: '工作负载-Pod',
      },
    },
    {
      path: 'deploymentlist',
      name: 'deploymentlist',
      component: () => import('@/views/workload/deploymentlist/index.vue'),
      meta: {
        locale: 'menu.workload.deploymentlist',
        requiresAuth: true,
        roles: ['*'],
        title: '工作负载-DeploymentList',
      },
    },
    {
      path: 'deployment/:name',
      name: 'deployment',
      component: () => import('@/views/workload/deployment/index.vue'),
      meta: {
        locale: 'menu.workload.deployment',
        requiresAuth: true,
        roles: ['*'],
        hideInMenu: true,
        activeMenu: 'deploymentlist',
        title: '工作负载-Deployment',
      },
    },
  ],
};

export default WORKLOAD;
