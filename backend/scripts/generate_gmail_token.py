import os
import sys
import webbrowser
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose'
]

def main():
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cred_path = os.path.join(backend_dir, "credentials.json")
    token_path = os.path.join(backend_dir, "token.json")
    
    if not os.path.exists(cred_path):
        print(f"\n[ERROR]: 'credentials.json' not found at {cred_path}")
        sys.exit(1)

    print("\n========================================================")
    print("      GLOSSY GMAIL OAUTH AUTHORIZATION GENERATOR        ")
    print("========================================================\n")
    
    flow = InstalledAppFlow.from_client_secrets_file(cred_path, SCOPES)
    
    # Run local server on fixed port 8080 or random port
    print("[1/2] Launching OAuth callback listener on localhost...")
    print("[2/2] Opening browser for Google Sign-in...\n")
    
    try:
        creds = flow.run_local_server(port=8080, prompt='consent', access_type='offline')
    except Exception as e:
        print(f"[Notice]: Port 8080 busy, trying dynamic port fallback... ({e})")
        creds = flow.run_local_server(port=0, prompt='consent', access_type='offline')

    with open(token_path, 'w') as token_file:
        token_file.write(creds.to_json())
        
    print(f"\n🎉 [SUCCESS]: Gmail OAuth token successfully generated!")
    print(f"📁 Saved to: {token_path}")
    print("========================================================\n")

if __name__ == '__main__':
    main()
