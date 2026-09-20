import os
import base64
import requests
import json
from fastapi import HTTPException
from app.services.providers.base import BaseAIProvider
from app.core.config import settings

GEMINI_MODEL = "gemini-3.6-flash"
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"


class GeminiProvider(BaseAIProvider):
    @property
    def supports_vision(self) -> bool:
        return True

    def _get_api_key(self) -> str:
        key = getattr(settings, "GEMINI_API_KEY", "") or os.environ.get("GEMINI_API_KEY", "")
        if not key:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not set in environment variables.")
        return key

    def _read_image_base64(self, img_url: str) -> tuple[str, str]:
        if img_url.startswith("/"):
            img_url = img_url[1:]
        current_dir = os.path.dirname(os.path.abspath(__file__))  # providers/
        services_dir = os.path.dirname(current_dir)               # services/
        app_dir = os.path.dirname(services_dir)                   # app/
        backend_dir = os.path.dirname(app_dir)                    # backend/
        file_path = os.path.join(backend_dir, img_url)
        print(f"DEBUG image path: {file_path}", flush=True)
        if not os.path.exists(file_path):
            print(f"DEBUG file not found: {file_path}", flush=True)
            return "", "image/jpeg"
        ext = file_path.lower().rsplit(".", 1)[-1]
        mime_map = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg",
                    "gif": "image/gif", "webp": "image/webp"}
        mime_type = mime_map.get(ext, "image/jpeg")
        with open(file_path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8"), mime_type

    def _build_parts(self, prompt: str, images: list) -> list:
        parts = [{"text": prompt}]
        for img_url in (images or []):
            b64, mime = self._read_image_base64(img_url)
            if b64:
                parts.append({"inline_data": {"mime_type": mime, "data": b64}})
        return parts

    def _build_history_contents(self, history: list) -> list:
        import re
        contents = []
        for msg in (history or [])[:-1]:
            raw = str(msg.get("content", ""))
            text = re.sub(r'!\[.*?\]\(.*?\)', '', raw).strip()
            if not text:
                continue
            role = "user" if msg.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": text}]})
        while contents and contents[-1]["role"] == "model":
            contents.pop()
        return contents

    def generate_response(self, prompt: str, images: list = None, model: str = None, history: list = None) -> str:
        api_key = self._get_api_key()
        url = f"{GEMINI_BASE_URL}/{model or GEMINI_MODEL}:generateContent?key={api_key}"

        contents = self._build_history_contents(history)
        contents.append({"role": "user", "parts": self._build_parts(prompt, images)})

        payload = {"contents": contents}

        try:
            response = requests.post(url, json=payload, timeout=180.0)
            if response.status_code >= 400:
                try:
                    err_body = response.json()
                    err = err_body.get("error", {}).get("message") or str(err_body)
                except Exception:
                    err = response.text or f"HTTP {response.status_code}"
                print(f"DEBUG Gemini error {response.status_code}: {err}", flush=True)
                if response.status_code == 429:
                    raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait and try again.")
                if response.status_code in (401, 403):
                    raise HTTPException(status_code=500, detail=f"Invalid Gemini API key: {err}")
                raise HTTPException(status_code=502, detail=f"Gemini API error ({response.status_code}): {err}")

            data = response.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise HTTPException(status_code=502, detail="Gemini returned an empty response.")
            parts = candidates[0].get("content", {}).get("parts", [])
            return "".join(p.get("text", "") for p in parts).strip()

        except HTTPException:
            raise
        except requests.exceptions.Timeout:
            raise HTTPException(status_code=504, detail="Gemini request timed out.")
        except requests.exceptions.ConnectionError:
            raise HTTPException(status_code=503, detail="Cannot connect to Gemini API.")
        except requests.exceptions.RequestException as e:
            raise HTTPException(status_code=502, detail=f"Network error: {str(e)}")

    def generate_stream(self, prompt: str, images: list = None, model: str = None, history: list = None):
        api_key = self._get_api_key()
        url = f"{GEMINI_BASE_URL}/{model or GEMINI_MODEL}:generateContent?key={api_key}"
        contents = self._build_history_contents(history)
        contents.append({"role": "user", "parts": self._build_parts(prompt, images)})
        payload = {"contents": contents}
        try:
            response = requests.post(url, json=payload, timeout=180.0)
            if response.status_code >= 400:
                try:
                    err = response.json().get("error", {}).get("message", response.text)
                except Exception:
                    err = response.text
                raise HTTPException(status_code=502, detail=f"Gemini API error ({response.status_code}): {err}")
            data = response.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise HTTPException(status_code=502, detail="Gemini returned empty response.")
            parts = candidates[0].get("content", {}).get("parts", [])
            text = "".join(p.get("text", "") for p in parts).strip()
            if text:
                yield text
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Network error: {str(e)}")
