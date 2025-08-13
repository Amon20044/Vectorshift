// store.js

import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';

export const useStore = create((set, get) => ({
    nodes: [],
    edges: [],
    nodeIDs: {},
    selectedNodes: [],
    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;
    },
    addNode: (node) => {
        set({
            nodes: [...get().nodes, node]
        });
    },
    deleteNode: (nodeId) => {
        set({
            nodes: get().nodes.filter(node => node.id !== nodeId),
            edges: get().edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId)
        });
    },
    
    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },
    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
    onConnect: (connection) => {
      set({
        edges: addEdge({
          ...connection, 
          type: 'smoothstep', 
          animated: true, 
          style: { strokeWidth: 2, stroke: 'var(--color-primary)' },
          markerEnd: { type: MarkerType.Arrow, height: '20px', width: '20px', color: 'var(--color-primary)' }
        }, get().edges),
      });
    },
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            node.data = { ...node.data, [fieldName]: fieldValue };
          }
          return node;
        }),
      });
    },
    setSelectedNodes: (nodeIds) => {
        set({ selectedNodes: nodeIds });
    },
    deleteSelectedNodes: () => {
      const selectedNodes = get().nodes.filter((node) => node.selected);
      const selectedNodeIds = selectedNodes.map((node) => node.id);
      set({
        nodes: get().nodes.filter((node) => !node.selected),
        edges: get().edges.filter((edge) => 
          !selectedNodeIds.includes(edge.source) && !selectedNodeIds.includes(edge.target)
        ),
      });
    },
    cloneNode: (nodeId) => {
      const nodeToClone = get().nodes.find(node => node.id === nodeId);
      if (!nodeToClone) return;
      
      // Create new node with offset position
      const newNode = {
        ...nodeToClone,
        id: get().getNodeID(nodeToClone.type.replace('custom', '').toLowerCase()),
        position: {
          x: nodeToClone.position.x + 50,
          y: nodeToClone.position.y + 50
        },
        selected: false,
        // Deep clone the data object
        data: { ...nodeToClone.data }
      };
      
      set({
        nodes: [...get().nodes, newNode]
      });
      
      return newNode.id;
    },
    cloneSelectedNodes: () => {
      const selectedNodes = get().nodes.filter((node) => node.selected);
      if (selectedNodes.length === 0) return;
      
      const clonedNodes = [];
      const nodeIdMap = new Map(); // Map old IDs to new IDs for edge cloning
      
      // Clone all selected nodes
      selectedNodes.forEach(node => {
        const newNodeId = get().getNodeID(node.type.replace('custom', '').toLowerCase());
        const clonedNode = {
          ...node,
          id: newNodeId,
          position: {
            x: node.position.x + 60,
            y: node.position.y + 60
          },
          selected: false,
          data: { ...node.data }
        };
        
        clonedNodes.push(clonedNode);
        nodeIdMap.set(node.id, newNodeId);
      });
      
      // Clone edges between selected nodes
      const selectedNodeIds = selectedNodes.map(node => node.id);
      const edgesToClone = get().edges.filter(edge => 
        selectedNodeIds.includes(edge.source) && selectedNodeIds.includes(edge.target)
      );
      
      const clonedEdges = edgesToClone.map(edge => ({
        ...edge,
        id: `${nodeIdMap.get(edge.source)}-${nodeIdMap.get(edge.target)}-${Date.now()}`,
        source: nodeIdMap.get(edge.source),
        target: nodeIdMap.get(edge.target),
        sourceHandle: edge.sourceHandle ? edge.sourceHandle.replace(edge.source, nodeIdMap.get(edge.source)) : null,
        targetHandle: edge.targetHandle ? edge.targetHandle.replace(edge.target, nodeIdMap.get(edge.target)) : null
      }));
      
      // Add cloned nodes and edges to store
      set({
        nodes: [...get().nodes, ...clonedNodes],
        edges: [...get().edges, ...clonedEdges]
      });
      
      return clonedNodes.map(node => node.id);
    },
    duplicateNode: (nodeId) => {
      // Alias for cloneNode for backward compatibility
      return get().cloneNode(nodeId);
    },
  }));
