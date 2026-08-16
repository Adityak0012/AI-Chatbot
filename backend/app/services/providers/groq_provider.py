import os
import base64
import requests
from fastapi import HTTPException
from app.services.providers.base import BaseAIProvider
from app.core.config import settings

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), ".env"))
except ImportError:
    pass

class GroqProvider(BaseAIProvider):
    @property
    def supports_vision(self) -> bool:
        return True

    def _get_image_base64_url(self, img_url: str) -> str:
        if img_url.startswith("/"):
            img_url = img_url[1:]
            
        current_dir = os.path.dirname(__file__)
        app_dir = os.path.dirname(os.path.dirname(current_dir))
        file_path = os.path.join(app_dir, img_url)
        
        if os.path.exists(file_path):
            ext = file_path.lower().split('.')[-1]
            mime_type = f"image/{ext}" if ext in ["png", "jpeg", "gif", "webp"] else "image/jpeg"
            if ext == "jpg":
                mime_type = "image/jpeg"
                
            with open(file_path, "rb") as f:
                b64_data = base64.b64encode(f.read()).decode('utf-8')
                return f"data:{mime_type};base64,{b64_data}"
        return ""

    def generate_response(self, prompt: str, images: list = None, model: str = None) -> str:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key and hasattr(settings, "GROQ_API_KEY"):
            api_key = getattr(settings, "GROQ_API_KEY")

        if not api_key:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY is not set in environment variables.")

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        selected_model = model or "openai/gpt-oss-120b"

        messages = []
        if images and len(images) > 0:
            # Vision requires a vision-capable model regardless of the
            # user's text-model choice, since only one is currently available.
            selected_model = "qwen/qwen3.6-27b"

            content = [{"type": "text", "text": prompt}]
            for img in images:
                b64_url = self._get_image_base64_url(img)
                if b64_url:
                    content.append({
                        "type": "image_url",
                        "image_url": {
                            "url": b64_url
                        }
                    })
            messages.append({"role": "user", "content": content})
        else:
            messages.append({"role": "user", "content": prompt})

        payload = {
            "model": selected_model,
            "messages": messages
        }

        try:
            response = requests.post(url, headers=headers, json=payload, timeout=180.0)
            if response.status_code >= 400:
                try:
                    error_body = response.json()
                    error_detail = error_body.get("error", {}).get("message", response.text)
                except ValueError:
                    error_detail = response.text
                raise HTTPException(
                    status_code=502,
                    detail=f"Groq API error ({response.status_code}): {error_detail}"
                )
            data = response.json()

            choices = data.get("choices", [])
            if not choices:
                raise HTTPException(status_code=502, detail="Invalid response from Groq server.")

            message = choices[0].get("message", {})
            return str(message.get("content", "")).strip()

        except requests.exceptions.Timeout:
            raise HTTPException(status_code=504, detail="Request to Groq API timed out.")
        except requests.exceptions.ConnectionError:
            raise HTTPException(status_code=503, detail="Connection refused: Groq API is unavailable.")
        except requests.exceptions.RequestException as e:
            raise HTTPException(status_code=502, detail=f"Error communicating with Groq: {str(e)}")
