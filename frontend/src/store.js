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
    duplicateNode: (nodeId, position) => {
        const nodeToClone = get().nodes.find(node => node.id === nodeId);
        if (nodeToClone) {
            const newNodeId = get().getNodeID(nodeToClone.type);
            const duplicatedNode = {
                ...nodeToClone,
                id: newNodeId,
                position: position || {
                    x: nodeToClone.position.x + 20,
                    y: nodeToClone.position.y + 20
                },
                data: { ...nodeToClone.data }
            };
            set({
                nodes: [...get().nodes, duplicatedNode]
            });
            return duplicatedNode;
        }
        return null;
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
    deleteNode: (nodeId) => {
      set({
        nodes: get().nodes.filter((node) => node.id !== nodeId),
        edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      });
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
  }));
