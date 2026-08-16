import os
import requests
from app.core.config import settings

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"))
except ImportError:
    pass


def search_web(query: str, max_results: int = 5) -> str:
    """
    Runs a web search via Tavily and returns a formatted context string
    of results (title, url, snippet) for injection into the AI prompt.
    Returns an empty string if the API key is missing or the request fails.
    """
    api_key = os.environ.get("TAVILY_API_KEY") or getattr(settings, "TAVILY_API_KEY", "")
    if not api_key:
        return ""

    try:
        response = requests.post(
            "https://api.tavily.com/search",
            json={
                "api_key": api_key,
                "query": query,
                "search_depth": "basic",
                "max_results": max_results,
                "include_answer": False,
            },
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()
        results = data.get("results", [])
        if not results:
            return ""

        formatted = "Here are relevant live web search results for the user's query:\n\n"
        for i, r in enumerate(results, 1):
            title = r.get("title", "Untitled")
            url = r.get("url", "")
            content = r.get("content", "")[:500]
            formatted += f"[{i}] {title}\nURL: {url}\nSnippet: {content}\n\n"
        formatted += "Use this information to answer the user's question accurately and cite sources by URL where relevant. If the search results don't contain the answer, say so rather than guessing."
        return formatted
    except Exception:
        return ""
