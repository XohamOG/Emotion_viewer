import os
import google.generativeai as genai
from dotenv import load_dotenv
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Load .env variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Google Gemini AI
genai.configure(api_key=GEMINI_API_KEY)

@api_view(["POST"])
def generate_questions(request):
    resume_text = request.data.get("resume_text", "")

    if not resume_text:
        return Response({"error": "No resume text provided"}, status=400)

    prompt = f"Based on the following resume text, generate 5 interview questions:\n\n{resume_text}\n\nInterview Questions:"

    model = genai.GenerativeModel("gemini-2.0-flash-thinking-exp-01-21")
    response = model.generate_content(prompt)

    if response and response.text:
        questions = response.text.strip().split("\n")
    else:
        questions = ["Sorry, could not generate questions."]

    return Response({"questions": questions})
