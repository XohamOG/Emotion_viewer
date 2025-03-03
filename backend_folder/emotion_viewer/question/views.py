import os
import google.generativeai as genai
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)

@csrf_exempt
def upload_resume(request):
    if request.method == 'POST' and request.FILES.get('resume'):
        resume_file = request.FILES['resume']

        # Convert PDF file to binary data
        pdf_bytes = resume_file.read()

        # Extract text using Gemini API
        resume_text = extract_text_with_gemini(pdf_bytes)

        if not resume_text:
            return JsonResponse({"error": "Failed to extract text from PDF"}, status=500)

        # Process extracted text and generate questions
        resume_data = parse_resume_with_gemini(resume_text)
        questions = generate_interview_questions(resume_data)

        return JsonResponse({"questions": questions})

    return JsonResponse({"error": "Invalid request"}, status=400)

def extract_text_with_gemini(pdf_bytes):
    """Uses Gemini API to extract text from a PDF file."""
    model = genai.GenerativeModel("gemini-2.0-flash-thinking-exp-01-21")
    
    response = model.generate_content(["Extract text from this PDF:", pdf_bytes])

    if response and response.text:
        return response.text.strip()
    
    return None

def parse_resume_with_gemini(text):
    """Uses Gemini API to extract structured resume data."""
    model = genai.GenerativeModel("gemini-2.0-flash-thinking-exp-01-21")

    prompt = f"""Extract and return structured JSON data from the following resume text.
                 Identify 'Skills' and 'Experience' sections. 
                 Return JSON in this format:
                 {{"Skills": ["Skill1", "Skill2"], "Experience": ["Job1", "Job2"]}}.

                 Resume Text:
                 {text}
              """
    
    response = model.generate_content(prompt)

    if response and response.text:
        try:
            return eval(response.text)  # Convert JSON-like response to Python dict
        except:
            return {"Skills": [], "Experience": []}

    return {"Skills": [], "Experience": []}

def generate_interview_questions(resume_data):
    """Generates AI-based interview questions from resume data."""
    model = genai.GenerativeModel("gemini-2.0-flash-thinking-exp-01-21")

    skills = resume_data.get("Skills", [])
    experience = resume_data.get("Experience", [])

    questions = []

    if skills:
        skill_prompt = f"Generate 5 advanced and unique technical interview questions for a candidate skilled in {', '.join(skills)}."
        response = model.generate_content(skill_prompt)
        questions.extend(response.text.strip().split("\n") if response.text else [])

    if experience:
        exp_prompt = f"Generate 3 in-depth interview questions based on these work experiences: {', '.join(experience)}."
        response = model.generate_content(exp_prompt)
        questions.extend(response.text.strip().split("\n") if response.text else [])

    return questions
