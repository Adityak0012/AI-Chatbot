from app.services.providers.base import BaseAIProvider

class AnthropicProvider(BaseAIProvider):
    def generate_response(self, prompt: str) -> str:
        # TODO: Implement Anthropic API call here
        return f"[Anthropic] Placeholder response to: {prompt}"
