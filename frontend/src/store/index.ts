import { createPinia } from 'pinia';
import useAppStore from './modules/app';
import useUserStore from './modules/user';
import useTabBarStore from './modules/tab-bar';
import useClusterStore from './modules/cluster';

const pinia = createPinia();

export { useAppStore, useUserStore, useTabBarStore, useClusterStore };
export default pinia;
