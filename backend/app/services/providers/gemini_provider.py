from app.services.providers.base import BaseAIProvider

class GeminiProvider(BaseAIProvider):
    @property
    def supports_vision(self) -> bool:
        return True

    def generate_response(self, prompt: str, images: list = None) -> str:
        # TODO: Implement Gemini API call here
        if images:
            return f"[Gemini Vision] Analyzed {len(images)} images for prompt: {prompt}"
        return f"[Gemini] Placeholder response to: {prompt}"
