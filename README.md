# 🎙️ EchoNote — Smart AI Meeting Assistant

EchoNote is an intelligent, full-stack meeting assistant that automates audio recording, speaker-tagged transcription, and enables context-aware Q&A. It leverages OBS Studio, WhisperX, Gemini AI, and MongoDB to streamline your meeting workflow.

---

## ✨ Features

- 🎧 **Command-Based Recording**: Start and stop OBS audio recordings using simple text commands.
- 🗣 **Speaker-Tagged Transcription**: Uses WhisperX + PyAnnote for diarized transcription.
- 🧠 **AI-Generated Titles**: Infers concise, relevant meeting titles automatically.
- 💬 **Transcript Q&A**: Interact with your meeting using natural language after transcription.
- 🌐 **Full-Stack Architecture**: Next.js (frontend) + FastAPI (backend) + LangChain react agent + MongoDB.

---

## 🏗 Tech Stack

| Layer     | Technology                |
|-----------|---------------------------|
| Frontend  | Next.js, React, Tailwind  |
| Backend   | FastAPI, Python           |
| AI APIs   | Google Gemini             |
| DB        | MongoDB                   |
| Models    | WhisperX, PyAnnote        |

## 📁 Project Structure
```
Ai-meeting-agent/
├── backend/
│ ├── server.py # FastAPI backend + Langchain react agent
│ ├── tools.py # Custom LangChain tools 
│ └── requirements.txt # required python packages
├── meeting-agent/ # Next.js app
│ ├── app/
│ │ ├── page.tsx # Home page with feature overview
│ │ └── chat/page.tsx # Interactive chat interface
│ └── public/
│   ├── logo1.png
│   ├── cmd.gif
│   └── sp.gif
│
├── README.md

```
## How It Works
**Starting and Stopping Recordings:** The user can interact with the assistant by typing commands like "start" to begin recording and "stop" to stop the recording.

**Transcription Process:** Once the recording is stopped, the system automatically transcribes the audio, applies speaker diarization, and stores the transcript in MongoDB.

**Asking Questions:** After transcription, users can ask context-aware questions regarding the meeting transcript, and the assistant will provide answers based on the recorded conversation.

## Clone the repository 
```
git clone https://github.com/Saheelsutar/AI-meeting-agent.git
```
## Navigate to backend directory: 
```
cd backend
```
### Create a Virtual environment:Python version 3.12

## Installation
To set up the project and install all required dependencies, run the following command:

```sh
pip install -r requirements.txt
```

### Create .env file
```
GOOGLE_API_KEY=your gemini api key(1.5 flash)
MONGO_URL=your mongo cluster url
GEMINI_API=your gemini api key(2.0 flash)
HUGGING_FACE_ACCESS=your hugging face access key
```
### Start backend server:
```
fastapi dev server.py --port 3001
```

## Navigate to frontend directory:
```
cd meeting-agent
```
### Install packages:
```
npm install
```
### Start development server:
```
npm run dev
```
