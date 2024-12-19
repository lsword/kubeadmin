export interface ClusterState {
  id?: string;
  name?: string;
  version?: string;
  address?: string;
  namespaces?: string[];
  curNamespace?: string;
}
