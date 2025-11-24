from google.genai import types
from google import genai
import os
from dotenv import load_dotenv
import json

load_dotenv()


order_vegetables_declaration = {
    "name": "order_vegetables",
    "description": "Used to order the vegetables.",
    "parameters": {
        "type": "object",
        "properties": {
            "vegetable_name": {
                "type": "string",
                "description": "name of the vegetable",
            },
            "quantity": {
                "type": "integer",
                "description": "quantity in KG for one 1 KG is 1",
            },
        },
        "required": ["vegetable_name", "quantity"],
    },
}


# Define a function that the model can call to control smart lights
set_light_values_declaration = {
    "name": "set_light_values",
    "description": "Sets the brightness and color temperature of a light.",
    "parameters": {
        "type": "object",
        "properties": {
            "brightness": {
                "type": "integer",
                "description": "Light level from 0 to 100. Zero is off and 100 is full brightness",
            },
            "color_temp": {
                "type": "string",
                "enum": ["daylight", "cool", "warm"],
                "description": "Color temperature of the light fixture, which can be `daylight`, `cool` or `warm`.",
            },
        },
        "required": ["brightness", "color_temp"],
    },
}

# This is the actual function that would be called based on the model's suggestion
def set_light_values(brightness: int, color_temp: str) -> dict[str, int | str]:
    """Set the brightness and color temperature of a room light. (mock API).

    Args:
        brightness: Light level from 0 to 100. Zero is off and 100 is full brightness
        color_temp: Color temperature of the light fixture, which can be `daylight`, `cool` or `warm`.

    Returns:
        A dictionary containing the set brightness and color temperature.
    """
    return {"brightness": brightness, "colorTemperature": color_temp}




# Configure the client and tools
client = genai.Client(
    api_key = os.environ.get("GOOGLE_API_KEY"),
)
tools = types.Tool(function_declarations=[set_light_values_declaration, order_vegetables_declaration])
config = types.GenerateContentConfig(tools=[tools])

# Define user prompt
contents = [
  {
    "role": "user",
    "parts": [
      {
        "text": "Turn the lights down to a romantic level"
      }
    ]
  },
  {
    "role": "model",
    "parts": [
      {
        "function_call": {
          "name": "set_light_values",
          "args": {
            "brightness": 20,
            "color_temp": "warm"
          }
        }
      }
    ]
  },
  {
    "role": "user",
    "parts": [
      {
        "function_response": {
          "name": "set_light_values",
          "response": {
            "result": {
              "brightness": 20,
              "colorTemperature": "warm"
            }
          }
        }
      }
    ]
  },
  {
    "role": "user",
    "parts": [
      {
        "text": "order 1 kg tomatoes"
      }
    ]
  },
  {
    "role": "user",
    "parts": [
      {
        "function_response": {
          "name": "set_light_values",
          "response": {
            "result": {
              "brightness": 20,
              "colorTemperature": "warm"
            }
          }
        }
      },
      {
        "function_response": {
          "name": "order_vegetables",
          "response": {
            "result": "2 kg Tomato has been ordered"
          }
        }
      }
    ]
  },
  {
    "role": "user",
    "parts": [
      {
        "text": "what are the things you have done? how much tomatoes ordered? have you made any mistake"
      }
    ]
  }
]

# Send request with function declarations
response = client.models.generate_content(
    model="models/gemini-2.5-flash",
    contents=contents,
    config=config,
)










print(response)

print("\n" * 5 + "=" * 20 + "Function call config from model" + "=" * 20)


print(response.candidates[0].content.parts[0].function_call)

print("\n" * 5 +"=" * 20 + "Function call result" + "=" * 20)


# Extract tool call details, it may not be in the first part.
tool_call = response.candidates[0].content.parts[0].function_call

if tool_call.name == "set_light_values":
    result = set_light_values(**tool_call.args)
    print(f"Function execution result: {result}")



print("\n" * 5 + "=" * 20 + "Assistant response" + "=" * 20)

# Create a function response part
function_response_part = types.Part.from_function_response(
    name=tool_call.name,
    response={"result": result},
)

function_response_part_2 = types.Part.from_function_response(
    name="order_vegetables",
    response={"result": "Tomato has been ordered"},
)

print("=" * 50)


# Append function call and result of the function execution to contents
model_talk = contents.append(response.candidates[0].content) # Append the content from the model's response.
tool_cont = contents.append(types.Content(role="user", parts=[function_response_part])) # Append the function response
contents.append(types.Content(role="user", parts=[types.Part(text="order 1 kg tomatoes")]))

response_two = client.models.generate_content(
    model="gemini-2.5-flash",
    config=config,
    contents=contents,
)



contents.append(types.Content(role="user", parts=[function_response_part, function_response_part_2])) # Append the function response
contents.append(types.Content(role="user", parts=[types.Part(text="what are the things you have done?")]))

print(json.dumps ([str(c) for c in contents], indent=3))


final_response = client.models.generate_content(
    model="gemini-2.5-flash",
    config=config,
    contents=contents,
)

print(final_response.text)


# Convert contents to JSON-serializable format
def content_to_dict(content):
    """Convert a Content object to a dictionary."""
    parts_list = []
    for part in content.parts:
        part_dict = {}
        if part.text:
            part_dict["text"] = part.text
        elif part.function_call:
            part_dict["function_call"] = {
                "name": part.function_call.name,
                "args": dict(part.function_call.args)
            }
        elif part.function_response:
            part_dict["function_response"] = {
                "name": part.function_response.name,
                "response": dict(part.function_response.response)
            }
        parts_list.append(part_dict)
    
    return {
        "role": content.role,
        "parts": parts_list
    }

# Convert all contents to JSON-serializable format
contents_json = [content_to_dict(content) for content in contents]

# Save to file
with open("content.json", "w") as f:
    json.dump(contents_json, f, indent=2)

# print("\n" + "=" * 20 + "Contents saved to content.json" + "=" * 20)
