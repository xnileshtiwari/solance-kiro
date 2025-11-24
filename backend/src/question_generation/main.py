import base64
import os
from google import genai
from google.genai import types
from .question_prompt import question_generator_prompt
from dotenv import load_dotenv
import time

load_dotenv()

def generate(model, input_json):
    client = genai.Client(
        api_key=os.environ.get("GOOGLE_API_KEY"),
    )

    model = model
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=input_json),
            ],
        ),
    ]
    thinking_config = None
    if model == "gemini-3-pro-preview":
        thinking_config = types.ThinkingConfig(
            thinkingLevel= "HIGH"

        )
    else: 
        thinking_config = types.ThinkingConfig(
            thinking_budget=8000
            )
    
    generate_content_config = types.GenerateContentConfig(
        thinking_config= thinking_config,
        response_mime_type="application/json",
        response_schema=genai.types.Schema(
            type = genai.types.Type.OBJECT,
            required = ["question"],
            properties = {
                "question": genai.types.Schema(
                    type = genai.types.Type.STRING,
                ),
            },
        ),
        system_instruction=[
            types.Part.from_text(text=f"{question_generator_prompt}"),
        ],
    )

    response = client.models.generate_content(
        model=model,
        contents=contents,
        config=generate_content_config,
    )
    return response.candidates[0].content.parts[0].text

if __name__ == "__main__":
    start_time = time.time()
    a = generate(model="gemini-2.5-flash", input_json="no data")
    print(a)
    end_time = time.time()
    print(end_time - start_time)
