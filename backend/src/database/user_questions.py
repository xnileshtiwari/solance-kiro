import os
import threading
from supabase import create_client, Client
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

class SolanceMemory:
    def __init__(self, user_id: str, subject_id: str):
        self.user_id = user_id
        self.subject_id = subject_id

    def _background_save(self, data: Dict[str, Any]):
        """
        Internal function to perform the actual network request.
        This runs in a separate thread.
        """
        try:
            supabase.table("user_interactions").insert(data).execute()
        except Exception as e:
            # You might want to log this to a file instead of print in production
            print(f"❌ [Background Error] Failed to save interaction: {e}")

    def save_interaction(self, question: str, score: int, remarks: List[str]):
        """
        Starts a background thread to save data.
        Returns IMMEDIATELY, does not block the main flow.
        """
        data = {
            "user_id": self.user_id,
            "subject_id": self.subject_id,
            "question": question,
            "score": score,
            "remarks": remarks
        }

        # Create a thread that targets the _background_save function
        # daemon=False ensures the data saves even if the main script finishes quickly
        save_thread = threading.Thread(target=self._background_save, args=(data,))
        save_thread.start()
        

    def get_history_for_llm(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Retrieves history. 
        NOTE: This remains BLOCKING because the LLM *needs* this data 
        before it can generate the next question.
        """
        try:
            response = supabase.table("user_interactions")\
                .select("question, score, remarks")\
                .eq("user_id", self.user_id)\
                .eq("subject_id", self.subject_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()

            interactions = response.data

            if not interactions:
                return []

            interactions.reverse()
            return interactions

        except Exception as e:
            print(f"❌ Error fetching history: {e}")
            return []

# --- TEST SCENARIO ---

# import time

# # Setup
# memory = SolanceMemory("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "math_algebra")

# # Simulate the end of a question
# print("1. Student finished question.")

# # This call is now non-blocking
# memory.save_interaction(
#     question="Solve for x: 2x = 10",
#     score=10,
#     remarks=["Fast response"]
# )

# # This will print immediately, likely before the "✅ [Background]" message appears
# print("2. Generating next question immediately (No waiting for DB)...")

# # Simulating the main program doing work while DB saves in background
# time.sleep(2) 
# print("3. Main program finished.")