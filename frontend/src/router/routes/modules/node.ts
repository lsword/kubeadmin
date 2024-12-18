import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const Node: AppRouteRecordRaw = {
  path: '/node',
  name: 'node',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.node',
    requiresAuth: true,
    icon: 'icon-computer',
    order: 8,
    title: '节点',
    hideInMenu: false,
  },
  children: [
    {
      path: 'nodelist',
      name: 'node.nodelist',
      component: () => import('@/views/node/nodelist/index.vue'),
      meta: {
        locale: 'menu.node.nodelist',
        requiresAuth: true,
        roles: ['*'],
        title: '节点',
        activeMenu: 'node',
        hideInMenu: true,
      },
    },
    {
      path: 'node/:name',
      name: 'node.nodedetail',
      component: () => import('@/views/node/nodedetail/index.vue'),
      meta: {
        locale: 'menu.node.nodedetail',
        requiresAuth: true,
        roles: ['*'],
        title: '节点',
        hideInMenu: true,
      },
    },
  ],
};

export default Node;
