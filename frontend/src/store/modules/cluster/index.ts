import { defineStore } from 'pinia';
import api from '@/api/cluster';
import { ClusterState } from './types';

// Helper function to save state to localStorage
function saveState(key: string, state: any) {
  localStorage.setItem(key, JSON.stringify(state));
}

// Helper function to load state from localStorage
function loadState(key: string) {
  const state = localStorage.getItem(key);
  return state ? JSON.parse(state) : null;
}

const useClusterStore = defineStore('cluster', {
  /*
  state: (): ClusterState => ({
    id: undefined,
    name: undefined,
    version: undefined,
    namespaces: undefined,
  }),
  */
  state: (): ClusterState => ({
    id: loadState('cluster')?.id || undefined,
    name: loadState('cluster')?.name || undefined,
    version: loadState('cluster')?.version || undefined,
    namespaces: loadState('cluster')?.namespaces || undefined,
    curNamespace: loadState('cluster')?.curNamespace || undefined,
  }),

  getters: {
    ClusterInfo(state: ClusterState): ClusterState {
      return { ...state };
    },
  },

  actions: {
    // Set cluster's information
    setInfo(partial: Partial<ClusterState>) {
      this.$patch(partial);
    },

    // Reset cluster's information
    resetInfo() {
      this.$reset();
    },

    // Get cluster's information
    async select(id:string) {
      const res = await api.getCluster(id);
      console.log(res.data)
      this.setInfo(res.data as ClusterState);
      saveState('cluster', this.$state);
    },

    save() {
      saveState('cluster', this.$state);
    }
  }
});

export default useClusterStore;
