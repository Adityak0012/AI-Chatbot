from app.services.providers.base import BaseAIProvider

class OpenAIProvider(BaseAIProvider):
    def generate_response(self, prompt: str) -> str:
        # TODO: Implement OpenAI API call here
        return f"[OpenAI] Placeholder response to: {prompt}"
