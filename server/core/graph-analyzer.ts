/**
 * Graph Analyzer Schema and Logic
 * Designed to ingest social media interactions and output the "shortest path to viral influence"
 */

export interface SocialInteraction {
  sourceId: string;
  sourceType: 'user' | 'post';
  targetId: string;
  targetType: 'user' | 'post';
  type: 'like' | 'retweet' | 'reply' | 'follow';
  timestamp: number;
  weight: number;
  sentiment?: number; // -1 to 1
}

export interface NodeMetadata {
  id: string;
  handle: string;
  influenceScore: number;
  tags: string[];
}

export const GraphSchema = {
  description: "Graph mapping for social influence nodes",
  nodes: {
    id: "string",
    label: "string",
    influence: "number",
    reach: "number"
  },
  edges: {
    from: "string",
    to: "string",
    weight: "number", // engagement strength
    sentiment: "number" // -1 to 1
  }
};

export class GraphAnalyzer {
  private nodes: Map<string, NodeMetadata> = new Map();
  private adjList: Map<string, { targetId: string, weight: number }[]> = new Map();

  ingest(interaction: SocialInteraction) {
    if (!this.adjList.has(interaction.sourceId)) {
      this.adjList.set(interaction.sourceId, []);
    }
    
    // Calculate cost: Higher interaction weight and positive sentiment = lower cost
    const sentimentFactor = (interaction.sentiment || 0) + 1.1; // Ensure > 0
    const cost = 1 / (interaction.weight * sentimentFactor);
    
    this.adjList.get(interaction.sourceId)?.push({ 
      targetId: interaction.targetId, 
      weight: cost 
    });
  }

  /**
   * Calculates the optimal influence path using Dijkstra's algorithm.
   * Prioritizes paths with high engagement and positive sentiment.
   */
  async findInfluencePath(startHandle: string, targetHandle: string) {
    const distances: Map<string, number> = new Map();
    const previous: Map<string, string | null> = new Map();
    const nodes = new Set<string>();

    // Initialization
    distances.set(startHandle, 0);
    nodes.add(startHandle);

    // Collect all nodes
    for (const [source, edges] of this.adjList) {
      nodes.add(source);
      for (const edge of edges) nodes.add(edge.targetId);
    }

    for (const node of nodes) {
      if (node !== startHandle) distances.set(node, Infinity);
      previous.set(node, null);
    }

    const unvisited = new Set(nodes);

    while (unvisited.size > 0) {
      // Get node with smallest distance
      let current: string | null = null;
      for (const node of unvisited) {
        if (current === null || (distances.get(node) || Infinity) < (distances.get(current) || Infinity)) {
          current = node;
        }
      }

      if (current === null || distances.get(current) === Infinity) break;
      if (current === targetHandle) break;

      unvisited.delete(current);

      const neighbors = this.adjList.get(current) || [];
      for (const neighbor of neighbors) {
        if (!unvisited.has(neighbor.targetId)) continue;
        
        const alt = (distances.get(current) || 0) + neighbor.weight;
        if (alt < (distances.get(neighbor.targetId) || Infinity)) {
          distances.set(neighbor.targetId, alt);
          previous.set(neighbor.targetId, current);
        }
      }
    }

    // Reconstruct path
    const path: string[] = [];
    let u: string | null = targetHandle;
    while (u !== null) {
      path.unshift(u);
      u = previous.get(u) || null;
    }

    if (path[0] !== startHandle) {
      return { error: 'No path found', confidence: 0 };
    }

    return {
      path,
      totalCost: distances.get(targetHandle),
      estimatedReach: Math.floor(1000000 / (distances.get(targetHandle) || 1)),
      confidence: Math.max(0.1, 1 - ((distances.get(targetHandle) || 0) * 0.1))
    };
  }
}
