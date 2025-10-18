
import os
import json
import time
from datetime import datetime

def hardcoded_ai_prediction(audio_file):
    """
    Hardcoded AI prediction for medical consultation.
    This simulates what a real AI model would output.
    """
    # Simulate AI processing time
    time.sleep(0.5)
    
    # Hardcoded prediction based on file name
    if "consultatie" in audio_file.lower():
        prediction = {
            "transcript": "Aorta la inel 8, aorta la sinusuri 12, aorta ascendentă 10, AS 13, VD 6, SIV 3, VS 20 pe 12, perete posterior 4, fracție de ejecție 60%."
        }
    return prediction

def process_audio_files():
    """Process consultatie.wav with hardcoded AI prediction."""
    print("Lab 1: Hardcoded AI Medical Consultation Analysis")
    print("=" * 60)
    
    # Process only consultatie.wav
    audio_file = "consultatie.wav"
    
    if not os.path.exists(audio_file):
        print("No consultatie.wav file found!")
        return
    
    print(f"Processing: {audio_file}")
    print("-" * 40)
    
    # Get hardcoded AI prediction
    prediction = hardcoded_ai_prediction(audio_file)
    
    # Display results
    print(f"AI Transcript: {prediction['transcript']}")
    print()
    
    # Store for saving
    all_predictions = {audio_file: prediction}
    
    # Save prediction to JSON file
    output_file = "lab1_hardcoded_predictions.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "lab": "Lab 1 - Hardcoded AI Prediction",
            "description": "Simulated AI prediction for medical consultation",
            "predictions": all_predictions
        }, f, ensure_ascii=False, indent=2)
    
    print(f"All predictions saved to: {output_file}")
    print(f"Processed {len(all_predictions)} file successfully")

def main():
    """Main function for Lab 1."""
    print("This is the hardcoded AI prediction system for Lab 1.")
    print()
    
    process_audio_files()

if __name__ == "__main__":
    main()
