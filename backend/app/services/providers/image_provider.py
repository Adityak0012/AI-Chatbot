import os, uuid, requests
from fastapi import HTTPException

def generate_image_hf(prompt: str) -> str:
    url = f"https://image.pollinations.ai/prompt/{requests.utils.quote(prompt)}?nologo=true&nofeed=true&model=flux&width=1024&height=1024"
    response = requests.get(url, timeout=60)
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Image generation failed")
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.png"
    with open(os.path.join(upload_dir, filename), "wb") as f:
        f.write(response.content)
    return f"![Generated Image](/static/uploads/{filename})"
