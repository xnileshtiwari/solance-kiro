import base64
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from .steps_prompt_generator import steps_generator_prompt
import time


load_dotenv()


def generate(model, input):
    print("Steps generator input " + input)

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
                    name="step",
                    description="This includes the next atomic steps to solve questions",
                    parameters=genai.types.Schema(
                        type = genai.types.Type.OBJECT,
                        required = ["next_step"],
                        properties = {
                            "next_step": genai.types.Schema(
                                type = genai.types.Type.STRING,
                                description = "The next instruction or question for the student",
                            ),
                        },
                    ),
                ),
                types.FunctionDeclaration(
                    name="final_answer",
                    description="This can only be used at the end of the solution to provide results",
                    parameters=genai.types.Schema(
                        type = genai.types.Type.OBJECT,
                        required = ["marks", "tip", "remarks"],
                        properties = {
                            "marks": genai.types.Schema(
                                type = genai.types.Type.INTEGER,
                                description = "Score out of 10",
                            ),
                            "tip": genai.types.Schema(
                                type = genai.types.Type.STRING,
                                description = "A concise personalized tip or feedback for the student",
                            ),
                            "remarks": genai.types.Schema(
                                type = genai.types.Type.ARRAY,
                                description = "List of remarks made by the student, or empty array if no remarks",
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
            types.Part.from_text(text= steps_generator_prompt),
        ],
        temperature=1
    )

    response = client.models.generate_content(
        model=model,
        contents=contents,
        config=generate_content_config,
    )
    print("Steps generator output " + str(response.candidates[0].content.parts[0].function_call.args))


    return response.candidates[0].content.parts[0].function_call.args

if __name__ == "__main__":
    q = """ {
  "question": "Solve for x: 2x + 4 = 10",
  "conversation_history": [
    {
      "step": 1,
      "your_prompt": "Move +4 to the other side. What is 2x = ?",
      "student_answer": "6"
    },
    {
      "step": 2,
      "your_prompt": "Now divide both sides by 2. What is x = ?",
      "student_answer": "3"
    }
  ]
} """

    ques = "solve for x: 2x + 4 = 10"
    start_time = time.time()
    a = generate(model="gemini-3-pro-preview", input=q)
    print(a)
    end_time = time.time()
    print(f"Time taken: {end_time - start_time} seconds")
