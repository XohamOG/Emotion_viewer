import json
import fitz  # PyMuPDF for extracting text from PDF
import google.generativeai as genai
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from dotenv import load_dotenv
import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import re
from fpdf import FPDF

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)

@csrf_exempt
def upload_resume(request):
    """Handles resume upload, extracts structured information, and sends questions to frontend."""
    if request.method == "POST" and request.FILES.get("resume"):
        uploaded_file = request.FILES["resume"].read()

        # Extract text from PDF
        extracted_text = extract_text_from_pdf(uploaded_file)
        if not extracted_text:
            return JsonResponse({"error": "Failed to extract text from resume"}, status=400)

        # Process text with Gemini AI
        structured_data = parse_resume_with_gemini(extracted_text)

        # Generate interview questions (list)
        interview_questions = generate_interview_questions(structured_data)

        # ✅ Send questions as JSON array (list)
        return JsonResponse({"questions": interview_questions}, status=200)

    return JsonResponse({"error": "Invalid request"}, status=400)


def extract_text_from_pdf(pdf_bytes):
    """Extracts text from a PDF file using PyMuPDF."""
    pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = "\n".join(page.get_text("text") for page in pdf_document)

    return text.strip() if text else None

def parse_resume_with_gemini(text):
    """Extracts structured resume data using Gemini API."""
    model = genai.GenerativeModel("gemini-2.0-flash-thinking-exp-01-21")

    prompt = f"""
    You are an advanced AI specialized in resume analysis. Extract structured data from the following resume and categorize the details accurately.

    ### **Extraction Guidelines:**
    - Identify **Skills**: Include only technical and soft skills mentioned in the resume.
    - Identify **Experience**: Extract only work experience (job titles, company names, and roles) in chronological order.

    ### **Output Format (JSON):**
    Return a valid JSON object with this structure:
    {{
    "Skills": ["Skill1", "Skill2", "Skill3"],
    "Experience": ["Job Title at Company1", "Job Title at Company2"]
    }}

    Ensure the output is **correctly formatted JSON** with no additional text.

    Resume:
    {text}
    """

    response = model.generate_content(prompt)

    if response and response.text:
        try:
            # Ensure valid JSON extraction (handling Gemini's extra text)
            json_match = re.search(r"\{.*\}", response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())  # Extract only the JSON part
        except json.JSONDecodeError:
            pass  # If JSON parsing fails, return empty data

    return {"Skills": [], "Experience": []}  # Default if parsing fails

def generate_interview_questions(data):
    """Generates interview questions based on extracted resume data."""
    skills = ", ".join(data.get("Skills", []))
    experience = ", ".join(data.get("Experience", []))

    if not skills and not experience:
        return ["Describe your background and strengths."]

    prompt = f"""
You are an expert interviewer generating technical and behavioral interview questions. 
Based on the following candidate details, generate interview questions categorized into three difficulty levels:

Candidate Details:
- Skills: {skills}
- Experience: {experience}

Question Guidelines:
- Generate 12 questions in total:
  - 4 Simple (basic knowledge, definitions, general concepts)
  - 4 Medium (practical applications, real-world problem-solving)
  - 4 Difficult (complex problem-solving, advanced optimizations, deep expertise)
- Include both technical and behavioral questions.
- Return the questions in a structured JSON format.

Example Output:
{{
  "Simple": [
    "What is Python, and how is it used?",
    "Can you define Machine Learning in simple terms?",
    "What are the key differences between lists and tuples in Python?",
    "What are the basic responsibilities of a software engineer?"
  ],
  "Medium": [
    "Can you explain how Django's ORM works?",
    "Describe a project where you implemented machine learning. What challenges did you face?",
    "How would you optimize a database query in an application?",
    "Tell me about a time you had to work in a team to solve a problem."
  ],
  "Difficult": [
    "How would you implement a custom deep learning model for text classification?",
    "Explain the time complexity of different sorting algorithms and when to use them.",
    "How would you scale a Django application to handle a million users?",
    "Tell me about the most challenging bug you’ve fixed in a production system."
  ]
}}

Ensure the output strictly follows the JSON format without additional explanations.
"""


    model = genai.GenerativeModel("gemini-2.0-flash-thinking-exp-01-21")
    response = model.generate_content(prompt)

    return response.text.split("\n") if response and response.text else ["What are your strengths?"]