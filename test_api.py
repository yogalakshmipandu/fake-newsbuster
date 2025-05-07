import requests
import json

def test_api():
    # Test URL
    url = "https://www.bbc.com/news"
    
    # API endpoint
    api_url = "http://localhost:5000/analyze"
    
    # Prepare request data
    data = {
        "url": url
    }
    
    try:
        # Make POST request
        response = requests.post(api_url, json=data)
        
        # Print response
        print("\nResponse Status Code:", response.status_code)
        print("Response Body:")
        print(json.dumps(response.json(), indent=2))
        
    except requests.exceptions.RequestException as e:
        print(f"Error making request: {str(e)}")

if __name__ == "__main__":
    test_api() 