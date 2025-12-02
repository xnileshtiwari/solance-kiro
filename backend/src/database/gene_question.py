import os
from supabase import create_client, Client
from dotenv import load_dotenv
from postgrest.exceptions import APIError

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)


def get_subject_details(subject_id: str):
    """
    Fetch a single module from subject-cartridge by subject_id.

    Returns JSON:
    {
      "name": "...",                 # from meta.display_name
      "subject": "...",
      "curriculum": [ { full items... } ]
    }
    
    Returns None if subject_id is not found.
    """
    try:
        response = (
            supabase.table("subject-cartridge")
            .select("payload")
            .eq("subject_id", subject_id)
            .single()
            .execute()
        )

        data = response.data
        if not data:
            return None
        
        payload = data["payload"]
        meta = payload.get("meta", {})
        curriculum = payload.get("curriculum", [])

        # Construct required output
        result = {
            "name": meta.get("display_name"),   # renamed display_name → name
            "subject": meta.get("subject"),
            "description": meta.get("description"),
            "curriculum": curriculum            # pass through exactly as stored
        }
        
        return result
        
    except APIError as e:
        # Handle PostgREST errors (e.g., PGRST116 when no rows found)
        # APIError stores the error dict as a string in args[0]
        try:
            import ast
            error_str = e.args[0] if e.args else "{}"
            error_dict = ast.literal_eval(error_str) if isinstance(error_str, str) else error_str
            error_code = error_dict.get('code') if isinstance(error_dict, dict) else None
        except (ValueError, SyntaxError):
            error_code = None
            error_dict = str(e)
        
        if error_code == 'PGRST116':
            print(f"Warning: No subject found with subject_id '{subject_id}'")
            return None
        else:
            print(f"API Error: {error_dict}")
            raise
    except Exception as e:
        print(f"Unexpected error fetching subject details: {e}")
        raise


# Example usage
if __name__ == "__main__":
    sid = "wtle4d"  # or generated ID
    details = get_subject_details(sid)

    import json
    if details:
        print(json.dumps(details, indent=2))
    else:
        print(f"No subject found with ID: {sid}")
