import { VulnJson } from '@npmcli/arborist';
import { NpmAuditJSON } from './types/index.js';

/**
 * @description Given a node in a graph structure, get all chains from the dependency nodes of that node to the end point
 * Note: There may be cycles in the graph structure, when encountering a cycle, the node where the cycle is located can be used as the end point directly
 */
export function getDepChains(node: VulnJson, globalNodeMap: NpmAuditJSON['vulnerabilities']) {
  // Store all found dependency chains
  const chains: string[][] = [];

  // Current DFS path (used for cycle detection)
  const currentPath: string[] = [];

  /**
   * Depth-first search function
   */
  function dfs(currentNode: VulnJson) {
    if (!currentNode) return;

    // Check if a cycle is formed (current node is already in the path)
    if (currentPath.includes(currentNode.name)) {
      chains.push([...currentPath]);
      return;
    }

    // Add current node to path
    currentPath.unshift(currentNode.name);

    // If there are no dependency nodes, it means the end point is reached
    if (!currentNode.effects || currentNode.effects.length === 0) {
      chains.push([...currentPath]);
    } else {
      // Recursively process all dependency nodes
      for (const effect of currentNode.effects) {
        dfs(globalNodeMap[effect]);
      }
    }
    // Backtrack: remove current node
    currentPath.shift();
  }

  // Start DFS from the given node
  dfs(node);

  return chains;
}
