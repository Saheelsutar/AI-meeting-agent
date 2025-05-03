import os
from google import genai
from fastapi import FastAPI
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from tools import audio_record, stop_record, transcribe_latest_recording, fetch_latest_transcript
from fastapi.middleware.cors import CORSMiddleware




memory = MemorySaver()
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")
tools = [audio_record, stop_record, transcribe_latest_recording, fetch_latest_transcript]


prompt = """You are EchoNote, an intelligent AI assistant that manages meeting recordings and transcripts.

Instructions:

1. Start Recording:
   - Begin OBS recording for audio by invoking audio_record tool.
   - Keep recording until I say "stop recording".

2. Stop and Transcribe:
   - When I say "stop recording":
     - Stop the OBS recording using the stop_record tool.
     - Use the transcribe_latest_recording tool to transcribe the latest recording.
     - Ensure:
       - The transcription includes speaker labels (e.g., Speaker 1, Speaker 2).
       - Save the transcript in MongoDB with a concise, meaningful meeting name inferred from the conversation content.

3. Post-Transcription:
   - Fetch the latest transcript using the fetch_latest_transcript tool.
   - Be prepared to answer any questions based on the latest meeting transcript.

Response Guidelines:
- Do not share the full transcript in your response.
- After executing the tools, respond with a short, grammatically correct confirmation without repeating words.
- Use speaker tags to provide clear, context-aware responses.
- If a question is unrelated to the meeting transcript, politely inform the user, then answer it using general knowledge."""


agent_executor = create_react_agent(llm, tools, checkpointer=memory, prompt=prompt)


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class UserInput(BaseModel):
    message: str

@app.post("/chat")
async def chat(user_input: UserInput):
    config = {"configurable": {"thread_id": "abc123"}}
    raw_response = ""
    
    for step in agent_executor.stream(
        {"messages": [HumanMessage(content=user_input.message)]},
        config,
        stream_mode="values",
    ):
        raw_response += step["messages"][-1].content

    # Filtering the raw response
    client = genai.Client(api_key=os.environ["GEMINI_API"])
    refined = client.models.generate_content(
        model="models/gemini-1.5-flash",
        contents=f"""
You are an AI assistant. The following is a raw response from a tool-invoking agent:
\"\"\"{raw_response}\"\"\"

Your Task:

1. Clean and Rewrite the Response
- Rewrite the raw response to be short, clear, and user-friendly.
- If the response indicates the question is unrelated to the meeting transcript:
  - Politely inform the user.
  - Then, answer the question based on general knowledge.

2. Content Filtering
- Remove any:
  - Tool debug messages or system-related output.
  - Stopped recording message

3. Response Style
- If the question is based on the meeting transcript, provide a direct, natural-sounding reply.
- Avoid repeating words.
- Ensure the final output is human-like, polished, and concise.

Output:
- Return only the final message intended for the user.
- Do not include tool output, annotations, or formatting beyond the plain reply.
"""

        )

    return {"response": refined.text.replace('\n', '').strip()}

