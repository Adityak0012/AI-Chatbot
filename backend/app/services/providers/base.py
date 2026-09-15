from abc import ABC, abstractmethod
from typing import List, Optional, Generator

class BaseAIProvider(ABC):
    
    @property
    def supports_vision(self) -> bool:
        """
        Indicates if the provider supports image analysis.
        """
        return False
        
    @abstractmethod
    def generate_response(self, prompt: str, images: Optional[List[str]] = None, model: Optional[str] = None, history: Optional[List] = None) -> str:
        """
        Generate a response from the AI provider.
        """
        pass

    def generate_stream(self, prompt: str, images: Optional[List[str]] = None, model: Optional[str] = None, history: Optional[List] = None) -> Generator[str, None, None]:
        yield self.generate_response(prompt, images=images, model=model, history=history)
