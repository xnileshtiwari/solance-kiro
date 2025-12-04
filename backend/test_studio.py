import sys
import os
import json

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

from studio.main import generate

def test_chat_flow():
    print("\n--- Testing Chat Flow ---")
    
    # Step 1: User initiates
    input_data = {
        "user_input": "I want to learn about Quantum Physics.",
        "history": []
    }
    response = generate(model="gemini-2.5-pro", input_data=input_data)
    print("Step 1 Response:", response)
    
    if "tool" in response and response["tool"] == "conversation":
        print("AI asked a question:", response["args"]["message"])
        
        # Step 2: User responds
        input_data["history"].append({"user": input_data["user_input"], "model": response["args"]["message"]})
        input_data["user_input"] = "I am a complete beginner."
        
        response = generate(model="gemini-2.5-pro", input_data=input_data)
        print("Step 2 Response:", response)
        
        if "tool" in response and response["tool"] == "cartridge_schema":
            print("Success! Cartridge generated.")
            print(json.dumps(response["args"], indent=2))
        elif "tool" in response and response["tool"] == "conversation":
             print("AI asked another question:", response["args"]["message"])
        else:
            print("Unexpected response in Step 2")
            
    else:
        print("Unexpected response in Step 1")

def test_file_upload():
    print("\n--- Testing File Upload ---")
    # Mock file URI (in a real scenario, this would be a valid GS URI or uploaded file)
    # Since we can't easily upload a file to Gemini here without a real key/file, 
    # we will simulate the structure but expect it might fail if the URI is invalid.
    # However, we can test the code path.
    
    # For this test, we'll just check if the function accepts the input without crashing
    # and tries to call the model.
    
    input_data = {
        "user_input": "Create a course from this file.",
        "file": {
            "uri": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", # Public dummy PDF
            "mime_type": "application/pdf"
        },
        "history": []
    }
    
    try:
        response = generate(model="gemini-2.0-flash-exp", input_data=input_data)
        print("File Upload Response:", response)
    except Exception as e:
        print(f"Caught expected exception (likely due to invalid API key or URI access): {e}")

if __name__ == "__main__":
    test_chat_flow()
    # test_file_upload() # Commented out as we might not have a valid file URI accessible to the model
