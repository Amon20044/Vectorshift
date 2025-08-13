import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { InputNode } from './nodes/inputNode';
import { LLMNode } from './nodes/llmNode';
import { OutputNode } from './nodes/outputNode';
import { TextNode } from './nodes/textNode';
import { FilterNode } from './nodes/filterNode';
import { TransformNode } from './nodes/transformNode';
import { DelayNode } from './nodes/delayNode';
import { ApiNode } from './nodes/apiNode';
import { ConditionalNode } from './nodes/conditionalNode';

// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };
const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  filter: FilterNode,
  transform: TransformNode,
  delay: DelayNode,
  api: ApiNode,
  conditional: ConditionalNode,
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  deleteSelectedNodes: state.deleteSelectedNodes,
  cloneNode: state.cloneNode,
});

export const PipelineUI = () => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [isAltPressed, setIsAltPressed] = useState(false);
    const {
      nodes,
      edges,
      getNodeID,
      addNode,
      onNodesChange,
      onEdgesChange,
      onConnect,
      deleteSelectedNodes,
      cloneNode,
    } = useStore(selector, shallow);

    // Unified keyboard event handling
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Delete selected nodes
            if (event.key === 'Delete' || event.key === 'Backspace') {
                event.preventDefault();
                deleteSelectedNodes();
            }
              
        };

        const handleKeyUp = (event) => {
            if (event.key === 'Alt') {
                setIsAltPressed(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [deleteSelectedNodes]);

    // Node drag with Alt for duplication
    const onNodeDragStart = useCallback((event, node) => {
        if (isAltPressed) {
            const duplicatedNode = cloneNode(node.id, {
                x: node.position.x + 20,
                y: node.position.y + 20
            });
        }
    }, [isAltPressed, cloneNode]);

    // Selection change handler
    const onSelectionChange = useCallback(({ nodes, edges }) => {
        // Handle selection changes if needed
        console.log('Selected nodes:', nodes.length, 'Selected edges:', edges.length);
    }, []);

    const getInitNodeData = (nodeID, type) => {
      let nodeData = { id: nodeID, nodeType: `${type}` };
      return nodeData;
    }



    const onDrop = useCallback(
        (event) => {
          event.preventDefault();
    
          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          if (event?.dataTransfer?.getData('application/reactflow')) {
            const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const type = appData?.nodeType;
      
            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
              return;
            }
      
            const position = reactFlowInstance.project({
              x: event.clientX - reactFlowBounds.left,
              y: event.clientY - reactFlowBounds.top,
            });

            const nodeID = getNodeID(type);
            const newNode = {
              id: nodeID,
              type,
              position,
              data: getInitNodeData(nodeID, type),
            };
      
            addNode(newNode);
          }
        },
        [reactFlowInstance, getNodeID, addNode]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    return (
        <>
        <div ref={reactFlowWrapper} style={{width: '100vw', height: '70vh', flex: 1, backgroundColor: 'var(--color-gray-50)'}}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onInit={setReactFlowInstance}
                onNodeDragStart={onNodeDragStart}
                onSelectionChange={onSelectionChange}
                nodeTypes={nodeTypes}
                proOptions={proOptions}
                snapGrid={[gridSize, gridSize]}
                connectionLineType='smoothstep'
                multiSelectionKeyCode={['Meta', 'Ctrl']}
                deleteKeyCode={['Backspace', 'Delete']}
                selectionKeyCode={null}
                defaultEdgeOptions={{
                    style: { strokeWidth: 2, stroke: 'var(--color-primary)' },
                    type: 'smoothstep',
                    animated: true,
                    markerEnd: { type: 'arrowclosed', color: 'var(--color-primary)' }
                }}
            >
                <Background 
                    color="var(--color-gray-200)" 
                    gap={gridSize} 
                    size={1}
                />
                <Controls 
                    style={{
                        backgroundColor: 'var(--color-white)',
                        border: '1px solid var(--color-gray-200)',
                        borderRadius: 'var(--border-radius)',
                        boxShadow: 'var(--shadow-md)'
                    }}
                />
                <MiniMap 
                    style={{
                        backgroundColor: 'var(--color-white)',
                        border: '1px solid var(--color-gray-200)',
                        borderRadius: 'var(--border-radius)',
                        boxShadow: 'var(--shadow-md)'
                    }}
                    nodeColor="var(--color-primary)"
                    maskColor="var(--color-gray-100)"
                />
            </ReactFlow>
        </div>
        </>
    )
}
