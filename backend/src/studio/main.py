import base64
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from .studio_prompt import studio_prompt
import time

load_dotenv()

def generate(model, input_data):
    """
    Generates response for Studio.
    
    Args:
        model: Model name
        input_data: Dict containing:
            - history: List of conversation steps
            - user_input: Current user message
            - file: Optional dict with 'uri' and 'mime_type'
    """
    print("Studio generator input", input_data)
    print("Model", model)

    client = genai.Client(
        api_key=os.environ.get("GOOGLE_API_KEY"),
    )

    # Construct history
    contents = []
    
    # Add history if present
    if "history" in input_data and input_data["history"]:
        for item in input_data["history"]:
            # User part
            contents.append(types.Content(
                role="user",
                parts=[types.Part.from_text(text=item.get("user", ""))]
            ))
            # Model part
            contents.append(types.Content(
                role="model",
                parts=[types.Part.from_text(text=item.get("model", ""))]
            ))

    # Current user input parts
    current_parts = []
    
    # Add file if present
    if "file" in input_data and input_data["file"]:
        file_data = input_data["file"]
        current_parts.append(types.Part.from_uri(
            file_uri=file_data["uri"],
            mime_type=file_data["mime_type"]
        ))
    
    # Add text input
    if "user_input" in input_data:
        current_parts.append(types.Part.from_text(text=input_data["user_input"]))
        
    contents.append(types.Content(
        role="user",
        parts=current_parts
    ))

    # Define tools
    tools = [
        types.Tool(
            function_declarations=[
                types.FunctionDeclaration(
                    name="conversation",
                    description="Use this to chat with the user and gather requirements.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        required=["message"],
                        properties={
                            "message": genai.types.Schema(
                                type=genai.types.Type.STRING,
                                description="The response message to the user.",
                            ),
                        },
                    ),
                ),
                types.FunctionDeclaration(
                    name="cartridge_schema",
                    description="Generate the final course structure (cartridge).",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        required=["meta", "curriculum"],
                        properties={
                            "meta": genai.types.Schema(
                                type=genai.types.Type.OBJECT,
                                required=["subject", "display_name", "description", "language", "public"],
                                properties={
                                    "subject": genai.types.Schema(type=genai.types.Type.STRING),
                                    "display_name": genai.types.Schema(type=genai.types.Type.STRING),
                                    "description": genai.types.Schema(type=genai.types.Type.STRING),
                                    "language": genai.types.Schema(type=genai.types.Type.STRING),
                                    "created_by": genai.types.Schema(type=genai.types.Type.STRING, description="UUID of the creator"),
                                    "public": genai.types.Schema(type=genai.types.Type.BOOLEAN),
                                },
                            ),
                            "curriculum": genai.types.Schema(
                                type=genai.types.Type.ARRAY,
                                items=genai.types.Schema(
                                    type=genai.types.Type.OBJECT,
                                    required=["level", "name", "description", "concepts", "question_style"],
                                    properties={
                                        "level": genai.types.Schema(type=genai.types.Type.INTEGER),
                                        "name": genai.types.Schema(type=genai.types.Type.STRING),
                                        "description": genai.types.Schema(type=genai.types.Type.STRING),
                                        "concepts": genai.types.Schema(
                                            type=genai.types.Type.ARRAY,
                                            items=genai.types.Schema(type=genai.types.Type.STRING)
                                        ),
                                        "question_style": genai.types.Schema(type=genai.types.Type.STRING),
                                    },
                                ),
                            ),
                        },
                    ),
                ),
            ]
        )
    ]

    thinking_config = None
    if model == "gemini-2.0-flash-thinking-exp-1219":
        thinking_config = types.ThinkingConfig(
            include_thoughts=True
        )
    
    generate_content_config = types.GenerateContentConfig(
        thinking_config=thinking_config,
        tools=tools,
        system_instruction=[
            types.Part.from_text(text=studio_prompt),
        ],
        temperature=1
    )

    response = client.models.generate_content(
        model=model,
        contents=contents,
        config=generate_content_config,
    )

    print("=" * 20 + " Studio output " + "=" * 20)
    try:
        # Check if we have valid candidates
        if not response.candidates or len(response.candidates) == 0:
            print("No candidates in response")
            return {"error": "No response generated"}
        
        candidate = response.candidates[0]
        
        # Check if content exists
        if not candidate.content or not candidate.content.parts:
            print("No content parts in response")
            return {"error": "Empty response from model"}
        
        # Iterate through all parts to find function call or collect text
        text_parts = []
        for part in candidate.content.parts:
            # Check if this part has a function call
            if hasattr(part, 'function_call') and part.function_call:
                args = part.function_call.args
                func_name = part.function_call.name
                print("=" * 20 + " subject generated " + "=" * 20)
                print("Function call", func_name, args)    
                return {"tool": func_name, "args": args}
            
            # Collect text from this part
            if hasattr(part, 'text') and part.text:
                text_parts.append(part.text)
        
        # If no function call found, return collected text
        if text_parts:
            combined_text = "\n".join(text_parts)
            print("Text response:", combined_text[:200] + "..." if len(combined_text) > 200 else combined_text)
            return {"text": combined_text}
        
        # No function call and no text - return error
        print("No function call or text in response parts")
        return {"error": "No valid content in response"}
            
    except Exception as e:
        print(f"Error parsing response: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

if __name__ == "__main__":
    # Test case
    test_input = {
        "user_input": "I want to learn about Quantum Physics, start from basics.",
        "history": []
    }
    
    start_time = time.time()
    # Using a model that supports tools (flash or pro)
    a = generate(model="gemini-2.0-flash-exp", input_data=test_input)
    print(a)
    end_time = time.time()
    print(f"Time taken: {end_time - start_time} seconds")
