import pyautogui
import time
from langchain_core.tools import tool 
import pygetwindow as gw    
import os
import glob
import whisperx
from pymongo import MongoClient
from langchain.tools import tool
from datetime import datetime
from google import genai
import pyannote.audio
import torch
import subprocess




@tool
def audio_record() -> str:
    """Starts OBS audio recording. No input required."""
    print("Opening OBS Studio...")
    pyautogui.hotkey('ctrl', 'alt', 'o')
    time.sleep(5)
    print("Starting recording...")
    pyautogui.hotkey('ctrl', 'r')
    print("OBS recording started.")
    pyautogui.hotkey('alt', 'space','n')
    return "Executed"
 

 
@tool
def stop_record() -> str:
    """Stops OBS audio recording"""
    try:
        obs_window = gw.getWindowsWithTitle("OBS")[0]  # Update if OBS window title is different

        obs_window.restore()      # In case it's minimized
        obs_window.maximize()     # Maximize the window
        obs_window.activate()     # Bring it to the front

        time.sleep(1.5)  # Allow time for focus and maximize to take effect
    except IndexError:
        return "Failed to stop recording: OBS not found."
    pyautogui.hotkey('ctrl', 'l')
    time.sleep(2)
    pyautogui.hotkey('alt', 'space','n')
    return "Executed"


@tool
def transcribe_latest_recording() -> str:
    """
    Once user tells to stop the recording, immediately transcribe the latest recording.
    Transcribes the latest .mkv video from the OBS recordings folder, applies speaker diarization,
    and stores the text along with the inferred meeting name in MongoDB.
    """
    input_dir = "C:/Users/Saheel/Videos"
    mkv_files = glob.glob(os.path.join(input_dir, "*.mkv"))
    if not mkv_files:
        return "No MKV files found in the recordings folder."

    latest_file = max(mkv_files, key=os.path.getmtime)

 
    audio_path = os.path.splitext(latest_file)[0] + ".wav"
    subprocess.run([
        "ffmpeg", "-y",
        "-i", latest_file,
        "-vn",
        "-acodec", "pcm_s16le",
        "-ar", "16000",
        "-ac", "1",
        audio_path
    ], check=True)

    #Load WhisperX model for transcription 
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print("running on:", device)
    model = whisperx.load_model("base", device=device, compute_type="float32")
    result = model.transcribe(audio_path)

    #Speaker diarization using PyAnnote
    pipeline = pyannote.audio.Pipeline.from_pretrained(
        "pyannote/speaker-diarization", 
        use_auth_token=os.getenv("HUGGING_FACE_ACCESS")
    )
    diarization = pipeline(audio_path)

  
    diarized_transcript = []
    for segment, _, speaker in diarization.itertracks(yield_label=True):
        words_in_segment = [
            word_info["text"]#will be stored if below conditions become true
            for word_info in result["segments"]#takes each segment 
            if segment.start <= word_info["start"] < segment.end#checks if it lies within the range
        ]
        speaker_text = " ".join(words_in_segment)
        diarized_transcript.append(f"[{speaker}] {speaker_text}")

    transcript_text = "\n".join(diarized_transcript)

    #Infer meeting name using Gemini
    client = genai.Client(api_key=os.environ['GEMINI_API'])
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=f"Suggest a concise and relevant title for the following meeting transcript:\n\n{transcript_text[:1000]}. Don't give multiple titles, give only one title as response"
    )
    meeting_name = response.text.replace('\n', "")

    #Store in MongoDB
    mongo_client = MongoClient(os.environ['MONGO_URL'])
    db = mongo_client["meetingtranscripts"]
    collection = db["transcripts"]

    doc = {
        "meeting_name": meeting_name,
        "transcript": transcript_text,
        "timestamp": datetime.now(),
        "source_file": os.path.basename(latest_file)
    }

    collection.insert_one(doc)
    return "Transcription Saved"



@tool
def fetch_latest_transcript() -> str:
    """Fetches the latest meeting transcript stored in MongoDB for Q&A."""
    mongo_client = MongoClient(os.environ['MONGO_URL'])
    db = mongo_client["meetingtranscripts"]
    collection = db["transcripts"]

    latest_doc = collection.find_one(sort=[("timestamp", -1)])

    if latest_doc:
        return latest_doc['transcript']
    else:
        return "No transcripts found."
