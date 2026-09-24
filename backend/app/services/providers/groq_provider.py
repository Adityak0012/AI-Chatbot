import os
import base64
import requests
from fastapi import HTTPException
from app.services.providers.base import BaseAIProvider
from app.core.config import settings

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"))
    load_dotenv(".env")
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

    def generate_response(self, prompt: str, images: list = None, model: str = None, history: list = None) -> str:
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

        selected_model = model or getattr(settings, "GROQ_MODEL", "openai/gpt-oss-120b")

        messages = []
        if history:
            for msg in history[:-1]:
                import re
                content_val = re.sub(r'!\[.*?\]\(.*?\)', '', str(msg["content"])).strip()
                if not content_val:
                    continue
                messages.append({
                    "role": "user" if msg["role"] == "user" else "assistant",
                    "content": content_val
                })

        if images and len(images) > 0:
            from app.services.providers.gemini_provider import GeminiProvider
            gemini = GeminiProvider()
            return gemini.generate_response(prompt, images=images, model="gemini-1.5-flash", history=history)
        else:
            messages.append({"role": "user", "content": prompt})

        payload = {
            "model": selected_model,
            "messages": messages
        }

        try:
            response = requests.post(url, headers=headers, json=payload, timeout=180.0)

            if response.status_code == 429:
                raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait a moment and try again.")

            if response.status_code == 401:
                raise HTTPException(status_code=500, detail="Invalid Groq API key. Please check your configuration.")

            if response.status_code == 503:
                raise HTTPException(status_code=503, detail="Groq API is temporarily unavailable. Please try again later.")

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
                raise HTTPException(status_code=502, detail="AI returned an empty response. Please try again.")

            message = choices[0].get("message", {})
            content = str(message.get("content", "")).strip()

            if not content:
                raise HTTPException(status_code=502, detail="AI returned an empty response. Please try again.")

            return content

        except HTTPException:
            raise
        except requests.exceptions.Timeout:
            raise HTTPException(status_code=504, detail="Request timed out. The AI is taking too long to respond. Please try again.")
        except requests.exceptions.ConnectionError:
            raise HTTPException(status_code=503, detail="Cannot connect to Groq API. Please check your internet connection.")
        except requests.exceptions.RequestException as e:
            raise HTTPException(status_code=502, detail=f"Network error while communicating with Groq: {str(e)}")

    def generate_stream(self, prompt: str, images: list = None, model: str = None, history: list = None):
        api_key = os.environ.get("GROQ_API_KEY") or getattr(settings, "GROQ_API_KEY", None)
        if not api_key:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY is not set.")

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        selected_model = model or getattr(settings, "GROQ_MODEL", "openai/gpt-oss-120b")

        messages = []
        if history:
            for msg in history[:-1]:
                import re
                content_val = re.sub(r'!\[.*?\]\(.*?\)', '', str(msg["content"])).strip()
                if not content_val:
                    continue
                messages.append({
                    "role": "user" if msg["role"] == "user" else "assistant",
                    "content": content_val
                })

        if images and len(images) > 0:
            from app.services.providers.gemini_provider import GeminiProvider
            gemini = GeminiProvider()
            yield from gemini.generate_stream(prompt, images=images, model="gemini-1.5-flash", history=history)
            return
        else:
            messages.append({"role": "user", "content": prompt})

        payload = {
            "model": selected_model,
            "messages": messages,
            "stream": True
        }

        try:
            response = requests.post(url, headers=headers, json=payload, timeout=180.0, stream=True)
            response.raise_for_status()
            for line in response.iter_lines():
                if line:
                    line = line.decode("utf-8")
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        import json
                        try:
                            chunk = json.loads(data)
                            delta = chunk.get("choices", [{}])[0].get("delta", {})
                            content = delta.get("content", "")
                            if content:
                                yield content
                        except json.JSONDecodeError:
                            continue
        except HTTPException:
            raise
        except requests.exceptions.Timeout:
            raise HTTPException(status_code=504, detail="Request timed out. Please try again.")
        except requests.exceptions.ConnectionError:
            raise HTTPException(status_code=503, detail="Cannot connect to Groq API. Please check your internet connection.")
        except requests.exceptions.RequestException as e:
            raise HTTPException(status_code=502, detail=f"Network error: {str(e)}")
