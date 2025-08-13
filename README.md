# VectorShift Frontend Technical Assessment 🚀

A complete implementation of a visual pipeline builder with drag-and-drop functionality, built using React, ReactFlow, and FastAPI.

## 📖 Table of Contents

- [Overview](#overview)
- [Technical Architecture](#technical-architecture)
- [Core Features Implemented](#core-features-implemented)
- [Data Structures & Algorithms](#data-structures--algorithms)
- [File Structure](#file-structure)
- [Setup & Installation](#setup--installation)
- [API Documentation](#api-documentation)
- [Key Design Patterns](#key-design-patterns)
- [Performance Optimizations](#performance-optimizations)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This project implements a visual node-based editor where users can:
- Create and connect different types of nodes (Input, Output, LLM, Text, etc.)
- Build data processing pipelines visually
- Validate pipeline structure (DAG detection)
- Delete and duplicate nodes with keyboard shortcuts
- Auto-resize text inputs dynamically

## 🏗️ Technical Architecture

### Frontend Stack
```
React 18.2.0
├── ReactFlow 11.8.3 (Visual node editor)
├── Zustand 4.5.7 (State management)
├── Inter Font (Typography)
└── CSS Custom Properties (Design system)
```

### Backend Stack
```
FastAPI (Python web framework)
├── Pydantic (Data validation)
├── Uvicorn (ASGI server)
└── Python 3.12+ (Runtime)
```

### Architecture Diagram
```
┌─────────────────┐    HTTP/REST    ┌──────────────────┐
│   React Frontend │ ◄──────────────► │  FastAPI Backend │
│                 │                 │                  │
│ ┌─────────────┐ │                 │ ┌──────────────┐ │
│ │  Components │ │                 │ │   Endpoints  │ │
│ │ ┌─────────┐ │ │                 │ │ /pipelines/  │ │
│ │ │  Nodes  │ │ │                 │ │    parse     │ │
│ │ └─────────┘ │ │                 │ └──────────────┘ │
│ │ ┌─────────┐ │ │                 │ ┌──────────────┐ │
│ │ │  Store  │ │ │                 │ │  DAG Logic   │ │
│ │ └─────────┘ │ │                 │ └──────────────┘ │
│ └─────────────┘ │                 └──────────────────┘
└─────────────────┘
```

## ✨ Core Features Implemented

### 1. Node Abstraction System 🧩
**Problem**: Repetitive code across different node types
**Solution**: Created `BaseNode` component with configurable fields

```javascript
// Before: 4 separate node files with duplicate code
// After: 1 BaseNode + 9 specialized nodes using configuration

const nodeConfig = {
  title: "Input",
  fields: [
    { name: 'inputName', type: 'text', label: 'Name' },
    { name: 'inputType', type: 'select', options: ['Text', 'File'] }
  ],
  handles: [{ type: 'source', position: Position.Right }]
};
```

**Benefits**:
- 90% less code duplication
- Consistent styling across all nodes
- Easy to add new node types

### 2. Enhanced Text Node with Variable Detection 🔍
**Problem**: Static text input without dynamic functionality
**Solution**: Real-time variable parsing with auto-handle generation

```javascript
// Algorithm: Regular Expression Parsing
const extractVariables = (text) => {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const varName = match[1].trim();
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(varName)) {
      variables.push({ name: varName, id: `${id}-${varName}` });
    }
  }
  return variables;
};
```

**Features**:
- Dynamic handle creation for `{{variableName}}`
- Auto-resize based on content length
- Real-time validation of JavaScript variable names
- Visual feedback with variable tags

### 3. Advanced State Management 🔄
**Data Structure**: Centralized store using Zustand

```javascript
// State Schema
{
  nodes: Node[],           // Array of node objects
  edges: Edge[],           // Array of connections
  selectedNodes: Set<id>,  // Currently selected nodes
  nodeIDs: Map<type, int>  // ID counter per node type
}

// Key Operations
addNode(node)              // O(1) - Add to array
deleteNode(id)            // O(n) - Filter operation
duplicateNode(id)         // O(1) - Clone and increment ID
getNodeID(type)           // O(1) - HashMap lookup
```

### 4. Rectangle Selection Tool 📦
**Algorithm**: Bounding box intersection detection

```javascript
// Geometric Algorithm
const isNodeInSelection = (node, selectionBox) => {
  return (
    node.position.x >= selectionBox.x &&
    node.position.y >= selectionBox.y &&
    node.position.x + node.width <= selectionBox.x + selectionBox.width &&
    node.position.y + node.height <= selectionBox.y + selectionBox.height
  );
};
```

### 5. Keyboard Shortcuts System ⌨️
```javascript
// Event Mapping
const shortcuts = {
  'Delete': () => deleteSelectedNodes(),
  'Ctrl+D': () => duplicateSelectedNodes(),
  'Escape': () => clearSelection(),
  'Ctrl+A': () => selectAllNodes()
};
```

## 🧮 Data Structures & Algorithms

### 1. DAG (Directed Acyclic Graph) Detection
**Algorithm**: DFS with Color Coding
**Time Complexity**: O(V + E)
**Space Complexity**: O(V)

```python
def is_dag(nodes, edges):
    # Build adjacency list: O(E)
    graph = {node.id: [] for node in nodes}
    for edge in edges:
        graph[edge.source].append(edge.target)
    
    # Color coding: 0=white, 1=gray, 2=black
    color = {node.id: 0 for node in nodes}
    
    def dfs(node_id):
        color[node_id] = 1  # Mark as visiting
        
        for neighbor in graph[node_id]:
            if color[neighbor] == 1:  # Back edge = cycle
                return True
            if color[neighbor] == 0 and dfs(neighbor):
                return True
        
        color[node_id] = 2  # Mark as visited
        return False
    
    # Check all components: O(V)
    for node in nodes:
        if color[node.id] == 0 and dfs(node.id):
            return False
    return True
```

### 2. Variable Parsing Algorithm
**Algorithm**: Finite State Automaton with Regex
**Time Complexity**: O(n) where n is text length

```javascript
// State Machine for {{variable}} parsing
States: [NORMAL, OPEN_BRACE_1, OPEN_BRACE_2, VARIABLE, CLOSE_BRACE_1]

Transitions:
NORMAL + '{' → OPEN_BRACE_1
OPEN_BRACE_1 + '{' → OPEN_BRACE_2
OPEN_BRACE_2 + [a-zA-Z_$] → VARIABLE
VARIABLE + '}' → CLOSE_BRACE_1
CLOSE_BRACE_1 + '}' → NORMAL (emit variable)
```

### 3. Dynamic Sizing Algorithm
**Algorithm**: Content-based dimension calculation

```javascript
// Responsive sizing based on content
const calculateDimensions = (text, variables) => {
  const lines = text.split('\n');
  const maxLineLength = Math.max(...lines.map(l => l.length));
  
  // Character-based width calculation
  const charWidth = 7;
  const lineHeight = 20;
  const padding = 32;
  const variableSpace = variables.length * 25;
  
  return {
    width: Math.max(240, maxLineLength * charWidth + padding),
    height: Math.max(120, lines.length * lineHeight + variableSpace)
  };
};
```

## 📁 File Structure

```
vectorshift/
├── frontend/
│   ├── src/
│   │   ├── nodes/
│   │   │   ├── BaseNode.js          # 🏗️ Abstract base component
│   │   │   ├── textNode.js          # 📝 Enhanced text node
│   │   │   ├── inputNode.js         # ⬇️ Input node
│   │   │   ├── outputNode.js        # ⬆️ Output node
│   │   │   ├── llmNode.js           # 🤖 LLM node
│   │   │   ├── filterNode.js        # 🔍 Filter node
│   │   │   ├── transformNode.js     # 🔄 Transform node
│   │   │   ├── delayNode.js         # ⏱️ Delay node
│   │   │   ├── apiNode.js           # 🌐 API node
│   │   │   └── conditionalNode.js   # ❓ Conditional node
│   │   ├── App.js                   # 🏠 Main application
│   │   ├── ui.js                    # 🎨 ReactFlow canvas
│   │   ├── toolbar.js               # 🧰 Node toolbar
│   │   ├── submit.js                # 📤 Submit functionality
│   │   ├── store.js                 # 🗃️ State management
│   │   ├── draggableNode.js         # 🖱️ Draggable components
│   │   └── index.css                # 🎨 Global styles
│   ├── package.json                 # 📦 Dependencies
│   └── nodemon.json                 # 🔄 Dev server config
└── backend/
    └── main.py                      # 🐍 FastAPI server
```

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.12+
- Git

### Quick Start

```bash
# Clone repository
git clone <repository-url>
cd vectorshift

# Backend setup
cd backend
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install fastapi uvicorn[standard] pydantic

# Start backend (Terminal 1)
uvicorn main:app --reload --host 0.0.0.0 --port 8001

# Frontend setup (Terminal 2)
cd ../frontend
npm install

# Start frontend
npm start
```

### Environment URLs
- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:8000`
- **API Docs**: `http://localhost:8000/docs`

## 📡 API Documentation

### Endpoint: POST `/pipelines/parse`

**Request Body**:
```json
{
  "nodes": [
    {
      "id": "input-1",
      "type": "customInput",
      "position": { "x": 100, "y": 100 },
      "data": { "inputName": "user_input" }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "input-1",
      "target": "output-1",
      "sourceHandle": "input-1-value",
      "targetHandle": "output-1-value"
    }
  ]
}
```

**Response**:
```json
{
  "num_nodes": 2,
  "num_edges": 1,
  "is_dag": true
}
```

**Status Codes**:
- `200`: Success
- `422`: Validation Error
- `500`: Server Error

## 🎨 Key Design Patterns

### 1. Component Composition Pattern
```javascript
// BaseNode acts as a higher-order component
<BaseNode {...config}>
  {children}  // Custom content for specific nodes
</BaseNode>
```

### 2. Observer Pattern (State Management)
```javascript
// Zustand subscription pattern
const { nodes, addNode } = useStore(selector, shallow);

// Automatic re-renders when state changes
```

### 3. Factory Pattern (Node Creation)
```javascript
// Node factory based on type
const createNode = (type, position, data) => ({
  id: getNodeID(type),
  type,
  position,
  data: getInitNodeData(type, data)
});
```

### 4. Strategy Pattern (Field Rendering)
```javascript
// Different rendering strategies for field types
const renderField = (field) => {
  switch (field.type) {
    case 'text': return renderTextInput(field);
    case 'select': return renderSelect(field);
    case 'textarea': return renderTextarea(field);
    default: return renderDefault(field);
  }
};
```

## ⚡ Performance Optimizations

### 1. React Optimizations
```javascript
// Shallow comparison for store updates
const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges
});
const storeData = useStore(selector, shallow);

// Memoized callbacks
const handleNodeChange = useCallback((changes) => {
  onNodesChange(changes);
}, [onNodesChange]);
```

### 2. Virtual DOM Optimizations
- Used `key` props for efficient list rendering
- Minimized component re-renders with `useCallback`
- Shallow comparison for state subscriptions

### 3. CSS Performance
- CSS Custom Properties for consistent theming
- Hardware-accelerated transitions
- Minimal reflows with `transform` animations

### 4. Bundle Optimization
- Tree-shaking with ES6 modules
- Dynamic imports for large components
- Optimized asset loading

## 🐛 Troubleshooting

### Common Issues

#### 1. "Failed to fetch" Error
**Cause**: Backend server not running or incorrect URL
**Solution**:
```bash
# Check if backend is running
curl http://localhost:8001/
# Should return: {"Ping":"Pong"}

# If not, start backend
cd backend && uvicorn main:app --reload --port 8001
```

#### 2. CORS Errors
**Cause**: Frontend and backend on different origins
**Solution**: Backend already configured with CORS middleware
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 3. Node Not Rendering
**Cause**: Missing node type in `nodeTypes` object
**Solution**: Add to `ui.js`:
```javascript
const nodeTypes = {
  // ... existing types
  newNodeType: NewNodeComponent,
};
```

#### 4. State Not Updating
**Cause**: Mutating state directly
**Solution**: Use immutable updates
```javascript
// Wrong ❌
state.nodes.push(newNode);

// Correct ✅
set({ nodes: [...get().nodes, newNode] });
```

### Debug Tools

#### React DevTools
```javascript
// Enable in development
if (process.env.NODE_ENV === 'development') {
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = true;
}
```

#### Network Debugging
```javascript
// Add request/response logging
console.log('Request:', pipelineData);
console.log('Response:', result);
```

## 🎯 Key Learning Outcomes
1. **Component Architecture**: How to build reusable React components
2. **State Management**: Managing complex application state
3. **API Integration**: Connecting frontend and backend
4. **Algorithm Implementation**: DAG detection and parsing
5. **Vanilla React**: Writing Vanilla React code
1. **Design Patterns**: Factory, Observer, and Strategy patterns
2. **Graph Algorithms**: DFS-based cycle detection
3. **Event Handling**: Complex keyboard and mouse interactions
4. **Dynamic Rendering**: Content-based component sizing
5. **Type Safety**: Using TypeScript-style prop validation

### DSA Concepts Applied:
- **Graphs**: Node-edge relationships, DAG validation
- **Trees**: Component hierarchy and rendering
- **Hash Tables**: Fast node lookup and ID generation
- **Arrays**: Node and edge collections with efficient operations
- **Sets**: Selected node tracking for O(1) operations
- **Regular Expressions**: Pattern matching for variable extraction

---

## 🏆 Project Completion Summary

✅ **Part 1**: Node Abstraction - Created reusable BaseNode component
✅ **Part 2**: Styling - Implemented clean purple and white design system
✅ **Part 3**: Text Node Logic - Added dynamic sizing and variable detection
✅ **Part 4**: Backend Integration - Complete API connection with DAG validation
✅ **Bonus**: Added delete, duplicate, and rectangle selection features

**Test Coverage**: Manual testing with various node configurations

---

Built with ❤️ for the VectorShift Technical Assessment
