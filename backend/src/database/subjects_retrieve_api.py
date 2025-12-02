import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)


def fetch_cartridge(user_id: str):
    """
    Fetch modules from 'subject-cartridge' where:
        - payload.meta.public == true
        OR
        - payload.meta.created_by == user_id
    
    Returns a JSON list of simplified objects:
        {
          "subject_id": "...",
          "display_name": "...",
          "subject": "...",
          "description": "...",
          "curriculum_concepts": ["...", "..."]
        }
    """

    # Step 1: Fetch all matching rows using OR filters
    # Supabase requires two separate filters combined using .or()
    response = (
        supabase.table("subject-cartridge")
        .select("subject_id, payload")
        .or_(
            f"payload->meta->>public.eq.true,payload->meta->>created_by.eq.{user_id}"
        )
        .execute()
    )

    rows = response.data or []

    # Step 2: Transform into simplified JSON
    results = []

    for row in rows:
        payload = row["payload"]
        meta = payload.get("meta", {})
        curriculum = payload.get("curriculum", [])

        # flatten only concepts
        concepts = []
        for item in curriculum:
            if isinstance(item, dict) and "concepts" in item:
                concepts.extend(item["concepts"])

        results.append({
            "subject_id": row["subject_id"],
            "display_name": meta.get("display_name"),
            "subject": meta.get("subject"),
            "description": meta.get("description"),
            "curriculum_concepts": concepts
        })
        

    return results


# Example usage:
if __name__ == "__main__":
    user_id = "user_nilesh123"

    data = fetch_cartridge(user_id)
    import json
    print(json.dumps(data, indent=2))