import os
import random
import string
import time
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)


def generate_subject_id():
    """6-char lower-alphanumeric ID (letters+digits)."""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))


def insert_module(module_json: dict, table_name: str = "subject-cartridge", max_attempts: int = 5):
    """
    Insert module_json into Supabase table `table_name`.

    Returns: (inserted_row, subject_id)
    Raises: Exception with clear error on failure.
    """
    if "meta" not in module_json:
        raise ValueError("module_json must contain a 'meta' object")

    # make sure public is boolean (sanitize)
    module_json["meta"]["public"] = bool(module_json["meta"].get("public", False))

    attempts = 0
    last_error = None
    while attempts < max_attempts:
        attempts += 1
        subject_id = generate_subject_id()
        module_json["meta"]["subject_id"] = subject_id

        payload = {
            "subject_id": subject_id,
            "payload": module_json,
        }

        # perform insert
        response = supabase.table(table_name).insert(payload).execute()

        # response is a PostgrestResponse-like object:
        # - response.data
        # - response.error
        # - response.status_code
        # check for errors
        if getattr(response, "error", None):
            last_error = response.error

            # unique constraint on subject_id? retry
            # The exact message may vary; try to detect common unique violation signatures
            err_msg = str(response.error)
            if "unique" in err_msg.lower() or "duplicate" in err_msg.lower() or "already exists" in err_msg.lower():
                # try again with a new ID
                time.sleep(0.05)  # tiny backoff
                continue

            # RLS/permission error: surface a clearer message
            if getattr(response, "status_code", None) == 401 or "permission" in err_msg.lower() or "row-level security" in err_msg.lower():
                raise Exception(
                    "Insert failed due to permissions/RLS. "
                    "If you're running server-side, use a service_role key or adjust RLS policies. "
                    f"Supabase error: {response.error}"
                )

            # other DB error — raise with details
            raise Exception(f"Supabase insert error: {response.error}")

        # success: return first inserted row (response.data is usually a list)
        data = getattr(response, "data", None)
        if isinstance(data, list) and len(data) > 0:
            return data[0], subject_id
        # sometimes response.data might be a dict or None depending on returning mode
        if data:
            return data, subject_id

        # If no data but no error, still consider it success (204 / minimal) — return subject_id
        return None, subject_id

    # if we exit loop, all attempts failed due to collisions or repeated error
    raise Exception(f"Failed to insert after {max_attempts} attempts. Last error: {last_error}")


# Example usage (put under if __name__ == "__main__": in your script)
if __name__ == "__main__":
    module_json = {
        "meta": {
            "display_name": "Chemical Bonding",
            "subject": "chemistry",
            "description": "Understanding Ionic and Covalent bonds based on Chapter 4.",
            "created_by": "user_nilesh123",
            "public": False
        },
        "curriculum": [
            {"level": 1, "name": "Definitions", "concepts": ["Definition of Ion", "Cation vs Anion"], "question_style": "Multiple Choice or Short Answer"},
            {"level": 2, "name": "Identifying Bonds", "concepts": ["Electronegativity differences", "Metal vs Non-metal identification"], "question_style": "Scenario Analysis"},
            {"level": 3, "name": "Lewis Structures", "concepts": ["Octet Rule", "Drawing structures"], "question_style": "Problem Solving"}
        ]
    }

    inserted_row, sid = insert_module(module_json)
    print("Inserted subject_id:", sid)
    print("Inserted row:", inserted_row)
