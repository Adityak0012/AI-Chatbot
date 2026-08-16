import os
import uuid
import requests
from fastapi import HTTPException

def generate_image_hf(prompt: str) -> str:
    API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell"
    headers = {}
    
    hf_token = os.environ.get("HUGGINGFACE_API_KEY") or os.environ.get("HF_TOKEN")
    if hf_token:
        headers["Authorization"] = f"Bearer {hf_token}"
        
    payload = {"inputs": prompt}
    response = requests.post(API_URL, headers=headers, json=payload)
    
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {response.text}")
        
    # __file__ is backend/app/services/providers/image_provider.py
    # dirname x3 is backend/app
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    unique_filename = f"{uuid.uuid4().hex}.png"
    file_path = os.path.join(upload_dir, unique_filename)
    
    with open(file_path, "wb") as f:
        f.write(response.content)
        
    file_url = f"/static/uploads/{unique_filename}"
    return f"![Generated Image]({file_url})"
