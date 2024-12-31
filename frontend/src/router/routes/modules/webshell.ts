import { AppRouteRecordRaw } from '../types';

const WEBSHELL: AppRouteRecordRaw = {
  path: '/webshell',
  name: 'webshell',
  component: undefined,
  meta: {
    locale: 'webshell',
    requiresAuth: true,
    icon: 'icon-thunderbolt',
    hideInMenu: true,
    order: 99,
    title: '{podname}'
  },
  children: [
    {
      path: '/webshell/:podname/:containername',
      name: 'webshell.webshell',
      component: () => import('@/views/webshell/index.vue'),
      meta: {
        locale: 'webshell',
        requiresAuth: true,
        roles: ['*'],
        hideInMenu: true,
        activeMenu: "webshell",
        title: '{containername}-{podname}'
      },
    },
  ],
};

export default WEBSHELL;

