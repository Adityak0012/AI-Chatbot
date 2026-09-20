from app.core.config import settings
from app.services.providers.base import BaseAIProvider
from app.services.providers.openai_provider import OpenAIProvider
from app.services.providers.ollama_provider import OllamaProvider
from app.services.providers.gemini_provider import GeminiProvider
from app.services.providers.anthropic_provider import AnthropicProvider
from app.services.providers.groq_provider import GroqProvider
from app.services.providers.image_provider import generate_image_hf

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

def generate_ai_response(prompt: str, images: list = None, model: str = None, history: list = None) -> str:
    """
    Selects the configured AI provider and generates a response for the given prompt.
    """
    prompt_lower = prompt.lower()
    image_keywords = ["generate image", "create image", "draw", "make a picture", "create artwork"]
    if any(keyword in prompt_lower for keyword in image_keywords):
        try:
            return generate_image_hf(prompt)
        except Exception as e:
            return f"Error generating image: {e}"

    provider_name = "gemini" if images else settings.AI_PROVIDER
    provider = ProviderFactory.get_provider(provider_name)
    effective_model = None if images else model
    return provider.generate_response(prompt, images=images, model=effective_model, history=history)

def generate_ai_stream(prompt: str, images: list = None, model: str = None, history: list = None):
    print(f"DEBUG ai_stream: images={images}", flush=True)
    provider_name = "gemini" if images else settings.AI_PROVIDER
    provider = ProviderFactory.get_provider(provider_name)
    effective_model = None if images else model
    yield from provider.generate_stream(prompt, images=images, model=effective_model, history=history)
