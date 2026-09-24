from app.core.config import settings
from app.services.providers.base import BaseAIProvider
from app.services.providers.openai_provider import OpenAIProvider
from app.services.providers.ollama_provider import OllamaProvider
from app.services.providers.gemini_provider import GeminiProvider
from app.services.providers.anthropic_provider import AnthropicProvider
from app.services.providers.groq_provider import GroqProvider
from app.services.providers.image_provider import generate_image_hf

IMAGE_KEYWORDS = ["generate image", "create image", "draw", "make a picture", "create artwork", "generate an image", "make an image", "generate a", "create a", "make a", "show me a", "draw a", "image of", "photo of", "picture of"]
class ProviderFactory:
    """Factory to instantiate the configured AI provider."""
    
    @staticmethod
    def get_provider(provider_name: str) -> BaseAIProvider:
        providers = {
            "openai": OpenAIProvider,
            "ollama": OllamaProvider,
            "gemini": GeminiProvider,
            "anthropic": AnthropicProvider,
            "groq": GroqProvider,
        }
        provider_class = providers.get(provider_name.lower())
        if not provider_class:
            raise ValueError(f"Unsupported AI Provider: {provider_name}")
        return provider_class()

def _clean_image_prompt(prompt: str) -> str:
    return f"high quality, realistic, detailed, {prompt}"

def generate_ai_response(prompt: str, images: list = None, model: str = None, history: list = None) -> str:
    prompt_lower = prompt.lower()
    if any(keyword in prompt_lower for keyword in IMAGE_KEYWORDS):
        try:
            return generate_image_hf(_clean_image_prompt(prompt))
        except Exception as e:
            return f"Error generating image: {e}"
    provider = ProviderFactory.get_provider(settings.AI_PROVIDER)
    return provider.generate_response(prompt, images=images, model=model, history=history)

def generate_ai_stream(prompt: str, images: list = None, model: str = None, history: list = None):
    print(f"DEBUG ai_stream: images={images}", flush=True)
    prompt_lower = prompt.lower()
    if any(keyword in prompt_lower for keyword in IMAGE_KEYWORDS):
        try:
            result = generate_image_hf(_clean_image_prompt(prompt))
            yield result
            return
        except Exception as e:
            yield f"Error generating image: {e}"
            return
    provider = ProviderFactory.get_provider(settings.AI_PROVIDER)
    yield from provider.generate_stream(prompt, images=images, model=model, history=history)