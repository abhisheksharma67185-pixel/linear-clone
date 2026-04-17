"use server";

import * as api from "@/lib/api";

export async function listClustersAction(projectId: string) {
  return api.listClusters(projectId);
}

export async function getClusterAction(clusterId: string) {
  return api.getCluster(clusterId);
}

export async function triggerClusterDiscoveryAction(projectId: string) {
  await api.triggerClusterDiscovery(projectId);
}
