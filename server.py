import sys
# Hack to disable torchcodec if it's installed but broken (common on Windows)
try:
    sys.modules["torchcodec"] = None
except Exception:
    pass

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import torch
import librosa
from pathlib import Path
from transformers import WhisperForConditionalGeneration, WhisperProcessor, pipeline
import shutil
import os
import tempfile
import gc

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================
# SETTINGS & MODEL LOADING
# ==============================================================

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

# Path to your checkpoints
CHECKPOINT_DIR = Path(r"H:\MIRPR\projects-maxonscribe\voice-to-text\checkpoints")

def get_latest_checkpoint():
    if not CHECKPOINT_DIR.exists():
        print(f"Warning: Checkpoint directory not found at {CHECKPOINT_DIR}")
        return "openai/whisper-small" # Fallback
    
    checkpoint_paths = sorted(
        [p for p in CHECKPOINT_DIR.iterdir() if p.is_dir() and p.name.startswith("checkpoint-")],
        key=lambda x: int(x.name.split("-")[1])
    )
    
    if not checkpoint_paths:
        print("No checkpoints found, using baseline.")
        return "openai/whisper-small"
        
    latest = checkpoint_paths[-1]
    print(f"Selected latest checkpoint: {latest}")
    return str(latest)

MODEL_PATH = get_latest_checkpoint()

def fix_generation_config(model):
    """Comprehensive fix for all generation config issues"""
    gen_config = model.generation_config
    
    # Fix all token IDs that might be lists/tensors
    for attr in ['eos_token_id', 'bos_token_id', 'pad_token_id', 'decoder_start_token_id']:
        value = getattr(gen_config, attr, None)
        if isinstance(value, (list, tuple)):
            fixed = value[0] if len(value) > 0 else 50257
            setattr(gen_config, attr, fixed)
        elif isinstance(value, torch.Tensor):
            fixed = int(value.item())
            setattr(gen_config, attr, fixed)
    
    # Fix suppress_tokens
    gen_config.suppress_tokens = []
    
    # Fix forced_decoder_ids
    if hasattr(gen_config, 'forced_decoder_ids'):
        if isinstance(gen_config.forced_decoder_ids, (list, torch.Tensor)):
            gen_config.forced_decoder_ids = None

print("⏳ Loading model...")
try:
    model = WhisperForConditionalGeneration.from_pretrained(MODEL_PATH)
    fix_generation_config(model)
    
    # Detect correct processor automatically from model size
    if getattr(model.config, "d_model", 0) >= 1280 or "large" in MODEL_PATH.lower():
        base_for_processor = "openai/whisper-large-v3"
    else:
        base_for_processor = "openai/whisper-small"

    print(f"⏳ Loading processor ({base_for_processor})...")
    processor = WhisperProcessor.from_pretrained(base_for_processor, language="ro", task="transcribe")

    print("⏳ Moving model to device...")
    model.to(device)

    print("⏳ Creating pipeline...")
    pipe = pipeline(
        "automatic-speech-recognition",
        model=model,
        tokenizer=processor.tokenizer,
        feature_extractor=processor.feature_extractor,
        device=0 if device == "cuda" else -1,
        torch_dtype=torch.float32,
    )
    print("✅ Model loaded and ready!")
except Exception as e:
    print(f"❌ Failed to load model: {e}")
    pipe = None

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    if not pipe:
        return {"error": "Model failed to load. Check server logs."}
    
    # Create a temporary file to save the uploaded audio
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        temp_filename = temp_file.name

    try:
        print(f"Transcribing {file.filename}...")
        
        # Load audio using librosa (more robust than transformers' internal ffmpeg call on Windows)
        # Re-sampling to 16000Hz as required by Whisper
        audio_array, _ = librosa.load(temp_filename, sr=16000, mono=True)
        
        # Run transcription
        output = pipe(
            audio_array,
            generate_kwargs={"language": "romanian", "task": "transcribe"},
            return_timestamps=True,
        )

        # Extract text
        text = ""
        if isinstance(output, dict):
            if "chunks" in output:
                text = " ".join(chunk["text"] for chunk in output["chunks"]) 
            elif "text" in output:
                text = output["text"]
                if isinstance(text, list):
                    text = " ".join(text)
        elif isinstance(output, list):
            text = " ".join(str(item) for item in output)
        else:
            text = str(output)

        print("Transcription complete.")
        return {"text": text}
        
    except Exception as e:
        print(f"Transcription error: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}
    finally:
        # Clean up
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
        
        # Optional: Memory cleanup if needed between requests
        # gc.collect()
        # if device == "cuda":
        #     torch.cuda.empty_cache()

if __name__ == "__main__":
    import uvicorn
    print("Starting server on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
