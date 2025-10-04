from pydantic import BaseModel
from typing import List, Literal, Optional, Dict, Any

class Position(BaseModel):
    x: float
    y: float

class CreateNodeParams(BaseModel):
    id: str
    label: str
    type: str
    position: Optional[Position] = None
    key: Optional[str] = None
    bpm: Optional[int] = None
    section: Optional[str] = None

class ConnectNodesParams(BaseModel):
    source: str
    target: str
    relation: Optional[str] = None
    label: Optional[str] = None

class DeleteByIdParams(BaseModel):
    id: str

class GraphCommand(BaseModel):
    action: Literal["createNode", "connectNodes", "deleteById"]
    params: Dict[str, Any]

class GraphCommandsResponse(BaseModel):
    commands: List[GraphCommand]

class GraphNode(BaseModel):
    id: str
    type: str = "custom"
    data: Dict[str, Any]
    position: Position

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    type: Optional[str] = None
    label: Optional[str] = None
    animated: Optional[bool] = None
    style: Optional[Dict[str, Any]] = None

class CurrentGraph(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class GraphUpdateRequest(BaseModel):
    current_graph: CurrentGraph
    instruction: str

