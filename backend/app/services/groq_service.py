import json
from groq import Groq
from app.utils.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

MODEL = "llama-3.3-70b-versatile"


def call_groq(messages: list[dict], temperature: float = 0.7, max_tokens: int = 4096) -> str:
    """Base Groq call. Returns raw text response."""
    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content


def call_groq_json(system_prompt: str = None, user_prompt: str = None, messages: list[dict] = None) -> dict:
    """Call Groq and parse JSON response. Used for structured plan generation."""
    if not messages:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]
    
    raw = call_groq(messages, temperature=0.5, max_tokens=4096)

    # Robust JSON extraction: Find the first { and last }
    cleaned = raw.strip()
    start_idx = cleaned.find('{')
    end_idx = cleaned.rfind('}')
    
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        cleaned = cleaned[start_idx:end_idx+1]

    try:
        parsed = json.loads(cleaned)
        print(f"✅ AI Response successfully parsed as JSON.")
        return parsed
    except json.JSONDecodeError as e:
        print(f"❌ AI JSON Parse Error: {e}")
        print(f"--- RAW AI RESPONSE ---")
        print(raw)
        print(f"-----------------------")
        return {"error": "Failed to parse AI response into JSON.", "raw_response": cleaned}