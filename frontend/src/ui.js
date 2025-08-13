import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, Background, MiniMap, SelectionMode } from 'reactflow';
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
// Displays the drag-and-drop UI with Rectangle Selection Tool
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
    const [isSpacePressed, setIsSpacePressed] = useState(false);
    const [selectionMode, setSelectionMode] = useState(SelectionMode.Partial);
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
            // Skip keyboard shortcuts if user is typing in an input field
            const isTypingInInput = event.target.tagName === 'INPUT' || 
                                   event.target.tagName === 'TEXTAREA' || 
                                   event.target.contentEditable === 'true' ||
                                   event.target.getAttribute('contenteditable') === 'true';
            
            if (isTypingInInput) {
                return; // Let the input handle the event normally
            }
            
            // Delete selected nodes (only when not typing)
            if (event.key === 'Delete' || event.key === 'Backspace') {
                event.preventDefault();
                deleteSelectedNodes();
            }
            
            // Alt key for duplication
            if (event.key === 'Alt') {
                setIsAltPressed(true);
            }
            
            // Space key for panning mode (disable selection temporarily)
            if (event.key === ' ') {
                setIsSpacePressed(true);
            }
        };

        const handleKeyUp = (event) => {
            // Skip if user is typing in an input field
            const isTypingInInput = event.target.tagName === 'INPUT' || 
                                   event.target.tagName === 'TEXTAREA' || 
                                   event.target.contentEditable === 'true' ||
                                   event.target.getAttribute('contenteditable') === 'true';
            
            if (isTypingInInput) {
                return; // Let the input handle the event normally
            }
            
            if (event.key === 'Alt') {
                setIsAltPressed(false);
            }
            if (event.key === ' ') {
                setIsSpacePressed(false);
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

    // Selection change handler with enhanced logging
    const onSelectionChange = useCallback(({ nodes, edges }) => {
        console.log('🎯 Selection changed:', {
            nodes: nodes.length,
            edges: edges.length,
            selectedNodes: nodes.map(n => ({ id: n.id, type: n.type }))
        });
        
        // Update selection mode based on current selection
        if (nodes.length > 1) {
            console.log('📦 Multi-node selection active');
        }
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
            {/* Selection Mode Indicator */}
            <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 1000,
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
            }}>
                <div style={{
                    padding: '6px 12px',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#8b5cf6',
                    border: '1px solid #e5e7eb'
                }}>
                    🎯 Rectangle Selection: {isSpacePressed ? 'OFF (Panning)' : 'ON'}
                </div>
                <div style={{
                    padding: '6px 12px',
                    backgroundColor: isAltPressed ? '#8b5cf6' : 'white',
                    color: isAltPressed ? 'white' : '#6b7280',
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontWeight: '500',
                    border: '1px solid #e5e7eb'
                }}>
                    📋 Alt: {isAltPressed ? 'Duplication Ready' : 'Hold to Duplicate'}
                </div>
            </div>

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
                multiSelectionKeyCode={['Meta', 'Ctrl', 'Shift']}
                deleteKeyCode={['Backspace', 'Delete']}
                selectionKeyCode={null}
                panOnDrag={isSpacePressed}
                selectionMode={selectionMode}
                selectNodesOnDrag={false}
                defaultEdgeOptions={{
                    style: { 
                        strokeWidth: 2, 
                        stroke: 'var(--color-primary)',
                        cursor: 'pointer'
                    },
                    type: 'smoothstep',
                    animated: true,
                    markerEnd: { type: 'arrowclosed', color: 'var(--color-primary)' }
                }}
                style={{
                    cursor: isSpacePressed ? 'grab' : 'default'
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
                    nodeColor={(node) => {
                        if (node.selected) return '#8b5cf6';
                        switch(node.type) {
                            case 'text': return '#8b5cf6';
                            case 'customInput': return '#10b981';
                            case 'customOutput': return '#ef4444';
                            case 'llm': return '#f59e0b';
                            default: return 'var(--color-primary)';
                        }
                    }}
                    maskColor="var(--color-gray-100)"
                />
            </ReactFlow>
            
            {/* Instructions overlay */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                padding: '12px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                fontSize: '11px',
                color: '#6b7280',
                maxWidth: '300px',
                lineHeight: '1.4',
                border: '1px solid #e5e7eb'
            }}>
                <div style={{ fontWeight: '600', color: '#8b5cf6', marginBottom: '6px' }}>
                    🎯 Selection Tools:
                </div>
                <div><strong>Drag:</strong> Rectangle select multiple nodes</div>
                <div><strong>Ctrl/Cmd+Click:</strong> Multi-select individual nodes</div>
                <div><strong>Alt+Drag:</strong> Duplicate node while dragging</div>
                <div><strong>Space:</strong> Hold to pan (disable selection)</div>
                <div><strong>Delete:</strong> Remove selected items</div>
            </div>
        </div>
        </>
    )
}
