from abc import ABC, abstractmethod
from typing import List, Optional

class BaseAIProvider(ABC):
    
    @property
    def supports_vision(self) -> bool:
        """
        Indicates if the provider supports image analysis.
        """
        return False
        
    @abstractmethod
    def generate_response(self, prompt: str, images: Optional[List[str]] = None, model: Optional[str] = None) -> str:
        """
        Generate a response from the AI provider.
        """
        pass
