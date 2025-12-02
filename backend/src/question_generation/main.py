import base64
import os
from google import genai
from google.genai import types
from src.question_generation.question_prompt import question_generator_prompt
from dotenv import load_dotenv
import time
from src.database.user_questions import SolanceMemory
from src.database.gene_question import get_subject_details        


load_dotenv()

def generate(model, input_json, user_id, subject_id):

    memory = SolanceMemory(user_id, subject_id) 
    history = memory.get_history_for_llm()
    
    if input_json and isinstance(input_json, dict) and 'question' in input_json:
        # Map marks/score if needed
        score = input_json.get('marks', input_json.get('score', 0))
        
        memory.save_interaction(
            question=input_json.get('question', ''),
            score=score,
            remarks=input_json.get('remarks', [])
        )
        history.append(input_json)

    cartridge = get_subject_details(subject_id) 

    
    print(f"Question generator input: {input_json} {history}")

    client = genai.Client(
        api_key=os.environ.get("GOOGLE_API_KEY"),
    )

    model = model
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=str(input_json)),
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
            required = ["question", "level"],
            properties = {
                "question": genai.types.Schema(
                    type = genai.types.Type.STRING,
                ),
                "level": genai.types.Schema(
                    type = genai.types.Type.INTEGER,
                ),
            },
        ),
        system_instruction=[
            types.Part.from_text(text=question_generator_prompt(cartridge, history)),
        ],
    )

    response = client.models.generate_content(
        model=model,
        contents=contents,
        config=generate_content_config,
    )
    print("Question generator output " + response.candidates[0].content.parts[0].text)
    return response.candidates[0].content.parts[0].text


if __name__ == "__main__":
    start_time = time.time()
    a = generate(model="gemini-2.5-flash", input_json={}, user_id="a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", subject_id="wtle4d")
    print(a)
    end_time = time.time()
    print(end_time - start_time)
