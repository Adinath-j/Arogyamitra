import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

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


def call_groq_json(system_prompt: str, user_prompt: str) -> dict:
    """Call Groq and parse JSON response. Used for structured plan generation."""
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
    raw = call_groq(messages, temperature=0.5, max_tokens=4096)

    # Strip markdown code fences if present
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        cleaned = "\n".join(lines[1:-1]) if lines[-1] == "```" else "\n".join(lines[1:])

    return json.loads(cleaned)