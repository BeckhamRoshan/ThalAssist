import requests
from bs4 import BeautifulSoup
import re

# Debug script to check the eRaktKosh API responses
BASE_URL = "https://eraktkosh.mohfw.gov.in/BLDAHIMS/bloodbank"

def debug_states_response():
    """Debug the states API response"""
    print("=== DEBUGGING STATES API ===")
    url = f"{BASE_URL}/stateBloodBanks.cnt?stateCode=0"
    headers = {"User-Agent": "Mozilla/5.0"}
    
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        print(f"Status Code: {resp.status_code}")
        print(f"Content-Type: {resp.headers.get('content-type', 'Unknown')}")
        print(f"Response Length: {len(resp.text)}")
        print(f"First 500 characters:\n{resp.text[:500]}")
        print("="*50)
        
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, "html.parser")
            options = soup.find_all("option")
            print(f"Total options found: {len(options)}")
            
            states = []
            for i, opt in enumerate(options):
                val = opt.get("value")
                text = opt.text.strip()
                print(f"Option {i}: value='{val}', text='{text}'")
                
                if val and val.isdigit():
                    states.append({"stateCode": int(val), "stateName": text})
            
            print(f"\nParsed States ({len(states)}):")
            for state in states:
                print(f"  {state['stateCode']}: {state['stateName']}")
                
            # Check for Tamil Nadu specifically
            tamil_nadu_variants = ["Tamil Nadu", "TAMIL NADU", "Tamilnadu", "TN"]
            print(f"\nLooking for Tamil Nadu variants:")
            for variant in tamil_nadu_variants:
                found = False
                for state in states:
                    if variant.lower() in state["stateName"].lower():
                        print(f"  Found '{variant}' as: {state['stateName']} (Code: {state['stateCode']})")
                        found = True
                        break
                if not found:
                    print(f"  '{variant}' not found")
                    
            return states
        else:
            print(f"Failed to fetch states. Status: {resp.status_code}")
            return []
    except Exception as e:
        print(f"Error fetching states: {e}")
        return []

def debug_token_fetch():
    """Debug the token fetching process"""
    print("\n=== DEBUGGING TOKEN FETCH ===")
    url = f"{BASE_URL}/stockAvailability.cnt"
    headers = {"User-Agent": "Mozilla/5.0"}
    
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        print(f"Status Code: {resp.status_code}")
        print(f"Response Length: {len(resp.text)}")
        
        # Look for the token pattern
        token_pattern = r"abfhttf=([a-zA-Z0-9]+)"
        matches = re.findall(token_pattern, resp.text)
        print(f"Token matches found: {matches}")
        
        if matches:
            token = matches[0]
            print(f"Extracted token: {token}")
        else:
            print("No token found. Searching for similar patterns...")
            # Search for any patterns that might be tokens
            potential_tokens = re.findall(r"([a-zA-Z]+=[a-zA-Z0-9]+)", resp.text)
            print(f"Potential token patterns: {potential_tokens[:10]}")  # First 10
            
    except Exception as e:
        print(f"Error fetching token: {e}")

def test_improved_state_matching():
    """Test improved state name matching"""
    print("\n=== TESTING IMPROVED STATE MATCHING ===")
    
    # Fetch states first
    states = debug_states_response()
    
    if not states:
        print("No states fetched, cannot test matching")
        return
    
    def improved_get_state_code(state_name: str, states_list):
        """Improved state matching function"""
        state_name = state_name.strip().lower()
        
        # Direct match
        for state in states_list:
            if state_name == state["stateName"].lower():
                return state["stateCode"]
        
        # Partial match
        for state in states_list:
            if state_name in state["stateName"].lower():
                return state["stateCode"]
        
        # Reverse partial match
        for state in states_list:
            if state["stateName"].lower() in state_name:
                return state["stateCode"]
        
        # Remove common words and try again
        clean_input = state_name.replace("state", "").replace("of", "").strip()
        for state in states_list:
            clean_state = state["stateName"].lower().replace("state", "").replace("of", "").strip()
            if clean_input == clean_state or clean_input in clean_state:
                return state["stateCode"]
        
        return None
    
    # Test cases
    test_cases = ["Tamil Nadu", "TAMIL NADU", "Tamilnadu", "TN", "Karnataka", "Kerala"]
    
    for test_case in test_cases:
        result = improved_get_state_code(test_case, states)
        print(f"Testing '{test_case}': {result}")

if __name__ == "__main__":
    debug_states_response()
    debug_token_fetch()
    test_improved_state_matching()