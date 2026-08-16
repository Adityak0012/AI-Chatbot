import os
import base64
import requests
from fastapi import HTTPException
from app.services.providers.base import BaseAIProvider
from app.core.config import settings


class OllamaProvider(BaseAIProvider):
    @property
    def supports_vision(self) -> bool:
        vision_models = ["llava", "llava:7b", "llava:13b", "qwen2.5-vl", "minicpm-v", "bakllava"]
        return settings.OLLAMA_MODEL.lower() in vision_models

    def _get_image_base64(self, img_url: str) -> str:
        if img_url.startswith("/"):
            img_url = img_url[1:]
            
        current_dir = os.path.dirname(__file__)
        app_dir = os.path.dirname(os.path.dirname(current_dir))
        file_path = os.path.join(app_dir, img_url)
        
        if os.path.exists(file_path):
            with open(file_path, "rb") as f:
                return base64.b64encode(f.read()).decode('utf-8')
        return ""

    def generate_response(self, prompt: str, images: list = None) -> str:
        url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"

        payload = {
            "model": settings.OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False
        }

        if images and len(images) > 0:
            b64_images = []
            for img in images:
                b64 = self._get_image_base64(img)
                if b64:
                    b64_images.append(b64)
            if b64_images:
                payload["images"] = b64_images
                # Automatically switch to llava if current model is not a vision model
                if not self.supports_vision:
                    payload["model"] = "llava"

        try:
            response = requests.post(
                url,
                json=payload,
                timeout=180.0
            )

            response.raise_for_status()

            data = response.json()
            
            if "response" not in data:
                raise HTTPException(
                    status_code=502,
                    detail="Invalid response from Ollama server."
                )

            raw_response = data.get("response", "")
            
            if isinstance(raw_response, list):
                raw_response = "\n".join(str(item) for item in raw_response)
            elif isinstance(raw_response, dict):
                raw_response = raw_response.get("content", raw_response.get("message", str(raw_response)))
                
            return str(raw_response).strip()

        except requests.exceptions.Timeout:
            raise HTTPException(
                status_code=504,
                detail="Request to Ollama server timed out."
            )

        except requests.exceptions.ConnectionError:
            raise HTTPException(
                status_code=503,
                detail="Connection refused: Ollama server is unavailable."
            )

        except requests.exceptions.RequestException as e:
            raise HTTPException(
                status_code=502,
                detail=f"Error communicating with Ollama: {str(e)}"
            )