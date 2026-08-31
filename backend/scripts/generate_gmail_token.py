import os
import sys
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/gmail.modify']

def main():
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cred_path = os.path.join(backend_dir, "credentials.json")
    token_path = os.path.join(backend_dir, "token.json")
    
    if not os.path.exists(cred_path):
        print(f"\n[ERROR]: 'credentials.json' not found at {cred_path}")
        print("Please download your OAuth Client credentials from Google Cloud Console and place 'credentials.json' inside the 'backend/' folder.")
        sys.exit(1)

    print("\n=== Opening Browser for Gmail OAuth Authorization ===")
    flow = InstalledAppFlow.from_client_secrets_file(cred_path, SCOPES)
    creds = flow.run_local_server(port=0)
    
    with open(token_path, 'w') as token_file:
        token_file.write(creds.to_json())
        
    print(f"\n[SUCCESS]: Gmail OAuth token successfully generated and saved to '{token_path}'!")

if __name__ == '__main__':
    main()
