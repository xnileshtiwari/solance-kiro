import base64
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from .solo_mode_prompt import grading_prompt
import time


load_dotenv()


def generate(model, input):
    print("Steps generator input " + input)
    print("Model " + model)

    client = genai.Client(
        api_key=os.environ.get("GOOGLE_API_KEY"),
    )

    model = model
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=input),
            ],
        ),
    ]
    tools = [
        types.Tool(
            function_declarations=[
                types.FunctionDeclaration(
                    name="grading_result",
                    description="The grading result for the student's answer",
                    parameters=genai.types.Schema(
                        type = genai.types.Type.OBJECT,
                        required = ["marks", "correction", "remarks"],
                        properties = {
                            "marks": genai.types.Schema(
                                type = genai.types.Type.INTEGER,
                                description = "Score out of 10",
                            ),
                            "correction": genai.types.Schema(
                                type = genai.types.Type.STRING,
                                description = "A closing insight, memory aid, or correction with the correct answer. ALWAYS populated. Use markdown and LaTeX.",
                            ),
                            "remarks": genai.types.Schema(
                                type = genai.types.Type.ARRAY,
                                description = "Short phrases for adaptive difficulty adjustment",
                                items = genai.types.Schema(
                                    type = genai.types.Type.STRING,
                                ),
                            ),
                        },
                    ),
                ),
            ])
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
        thinkingConfig = thinking_config,
        tools=tools,
        system_instruction=[
            types.Part.from_text(text= grading_prompt),
        ],
        temperature=1
    )

    response = client.models.generate_content(
        model=model,
        contents=contents,
        config=generate_content_config,

    )

    return response.candidates[0].content.parts[0].function_call.args

if __name__ == "__main__":
    q = """ {
  "question": "Solve for x: 2x + 4 = 10",
  "student_answer": "3"
    } """

    ques = "solve for x: 2x + 4 = 10"
    start_time = time.time()
    a = generate(model="gemini-2.5-pro", input=q)
    print(a)
    end_time = time.time()
    print(f"Time taken: {end_time - start_time} seconds")
