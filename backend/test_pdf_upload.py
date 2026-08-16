import os
import sys
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fpdf import FPDF
import io

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.api.deps import get_current_user, get_db
from app.models.user import User

# Mock dependencies
def override_get_current_user():
    user = User(id="test-user-id", email="test@example.com", username="tester")
    return user

# We will let it use the real db for this test (or mock it if needed)
# Using TestClient
app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)

def create_dummy_pdf():
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="This is a dummy PDF file for testing text extraction.", ln=1, align='C')
    
    # Save to a byte string
    pdf_bytes = pdf.output(dest='S').encode('latin-1')
    return pdf_bytes

def main():
    print("Starting test...")
    try:
        import fpdf
    except ImportError:
        print("fpdf not installed, please install it or run in venv")
        return
        
    pdf_content = create_dummy_pdf()
    
    print("Uploading PDF to /chat endpoint...")
    response = client.post(
        "/chat",
        data={"prompt": "explain this pdf"},
        files={"files": ("test_doc.pdf", pdf_content, "application/pdf")}
    )
    
    print(f"Response status: {response.status_code}")
    if response.status_code != 200:
        print(f"Error detail: {response.json()}")
    else:
        print("Success!")

if __name__ == "__main__":
    main()
