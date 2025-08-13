from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import json

app = FastAPI()

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

class NodeData(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Any] = {}

class EdgeData(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: str = None
    targetHandle: str = None

class PipelineData(BaseModel):
    nodes: List[NodeData]
    edges: List[EdgeData]

def is_dag(nodes: List[NodeData], edges: List[EdgeData]) -> bool:
    """
    Check if the graph formed by nodes and edges is a Directed Acyclic Graph (DAG).
    Uses DFS-based cycle detection with color coding:
    - White (0): Unvisited node
    - Gray (1): Currently being processed (in recursion stack)  
    - Black (2): Completely processed
    """
    if not nodes or not edges:
        return True  # Empty graph or no edges means it's a DAG
    
    # Build adjacency list
    graph = {node.id: [] for node in nodes}
    for edge in edges:
        if edge.source in graph and edge.target in graph:
            graph[edge.source].append(edge.target)
    
    # Color coding for DFS: 0=white, 1=gray, 2=black
    color = {node.id: 0 for node in nodes}
    
    def has_cycle_dfs(node_id):
        color[node_id] = 1  # Mark as gray (being processed)
        
        for neighbor in graph[node_id]:
            if color[neighbor] == 1:  # Back edge found - cycle detected
                return True
            if color[neighbor] == 0 and has_cycle_dfs(neighbor):
                return True
                
        color[node_id] = 2  # Mark as black (completely processed)
        return False
    
    # Check all components
    for node in nodes:
        if color[node.id] == 0:
            if has_cycle_dfs(node.id):
                return False
    
    return True

@app.get('/')
def read_root():
    return {'Ping': 'Pong'}

@app.post('/pipelines/parse')
def parse_pipeline(pipeline: PipelineData):
    try:
        # Console log the incoming data for debugging
        print("=" * 50)
        print("INCOMING PIPELINE DATA:")
        print(f"Number of nodes: {len(pipeline.nodes)}")
        print(f"Number of edges: {len(pipeline.edges)}")
        
        print("\nNODES:")
        for i, node in enumerate(pipeline.nodes):
            print(f"  {i+1}. ID: {node.id}, Type: {node.type}, Data: {node.data}")
        
        print("\nEDGES:")
        for i, edge in enumerate(pipeline.edges):
            print(f"  {i+1}. {edge.source} -> {edge.target}")
            print(f"      Source Handle: {edge.sourceHandle}")
            print(f"      Target Handle: {edge.targetHandle}")
        
        print("=" * 50)
        
        # Calculate metrics
        num_nodes = len(pipeline.nodes)
        num_edges = len(pipeline.edges)
        is_dag_result = is_dag(pipeline.nodes, pipeline.edges)
        
        print(f"RESULT: Nodes={num_nodes}, Edges={num_edges}, Is_DAG={is_dag_result}")
        
        # Return the required format
        return {
            "num_nodes": num_nodes,
            "num_edges": num_edges,
            "is_dag": is_dag_result
        }
    
    except Exception as e:
        print(f"ERROR processing pipeline: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing pipeline: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
