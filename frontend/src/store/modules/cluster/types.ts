export interface ClusterState {
  id?: string;
  name?: string;
  version?: string;
  namespaces?: string[];
  curNamespace?: string;
}
