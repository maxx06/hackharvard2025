# Setup Instructions

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
GOOGLE_API_KEY=your_google_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

Get your API keys:
- Google AI (Gemini): https://makersuite.google.com/app/apikey
- ElevenLabs: https://elevenlabs.io/

### 3. Run the Backend

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Features

### AI Incremental Graph Updates

The system now supports LLM-powered incremental updates:

1. **Toggle AI Incremental Mode** in the graph interface
2. Type natural language commands like:
   - "add a chorus with synths"
   - "connect verse to chorus"
   - "delete the bass node"
   - "add drums at 140 BPM in the key of C"

3. The backend LLM (Gemini 2.0 Flash) will:
   - Analyze your current graph
   - Generate structured commands
   - Update the graph incrementally without regeneration

### Command Schema

The LLM returns commands in this format:

```json
{
  "commands": [
    {
      "action": "createNode",
      "params": {
        "id": "chorus",
        "label": "Chorus",
        "type": "section",
        "position": { "x": 400, "y": 100 }
      }
    },
    {
      "action": "connectNodes",
      "params": {
        "source": "verse",
        "target": "chorus",
        "relation": "next"
      }
    }
  ]
}
```

Supported actions:
- `createNode` - Add new nodes (sections, instruments, moods, etc.)
- `connectNodes` - Create edges between nodes
- `deleteById` - Remove nodes or edges by ID

