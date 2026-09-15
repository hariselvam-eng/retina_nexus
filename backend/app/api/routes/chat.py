import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from google import genai
from google.genai import types


router = APIRouter(
    prefix="/chat",
    tags=["chat"],
)


class ChatRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
    )


class ChatResponse(BaseModel):
    response: str
    model: str


SYSTEM_PROMPT = """
You are Retina Assistant, the AI assistant inside RETINA-NEXUS,
a clinical intelligence workspace for diabetic retinopathy screening.

Your responsibilities:

1. Explain diabetic retinopathy in simple language.
2. Explain AI screening concepts and screening results.
3. Explain RetinaGuard and model confidence concepts.
4. Help users understand the screening workflow.
5. Explain clinical review, reports, analytics and model monitoring.
6. Help users navigate the RETINA-NEXUS application.
7. Answer general medical education questions carefully.

Important clinical safety rules:

- You are an AI assistant, not a doctor.
- Do not diagnose a patient.
- Do not claim that an AI screening result is a confirmed diagnosis.
- Encourage appropriate clinical review for patient-specific decisions.
- If the user asks about an emergency or severe symptoms,
  recommend seeking appropriate professional medical care.
- Do not invent patient results, medical records, model outputs,
  laboratory values, or clinical findings.

Answer clearly and concisely.
Use simple language when explaining medical concepts.
If useful, organize answers with short headings and bullet points.

You are specifically designed for the RETINA-NEXUS application.
"""


def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured."
        )

    return genai.Client(api_key=api_key)


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):

    model = os.getenv(
        "GEMINI_MODEL",
        "gemini-3.6-flash",
    )

    try:
        client = get_gemini_client()

        response = client.models.generate_content(
            model=model,
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part(
                            text=f"""
{SYSTEM_PROMPT}

User question:

{request.message}
"""
                        )
                    ],
                )
            ],
            config=types.GenerateContentConfig(
                temperature=0.4,
                max_output_tokens=700,
            ),
        )

        answer = response.text

        if not answer:
            raise RuntimeError(
                "Gemini returned an empty response."
            )

        return ChatResponse(
            response=answer.strip(),
            model=model,
        )

    except Exception as exc:
        print(
            f"[RETINA-NEXUS CHAT ERROR] "
            f"{type(exc).__name__}: {exc}"
        )

        raise HTTPException(
            status_code=502,
            detail={
                "message": "The AI assistant is temporarily unavailable.",
                "code": "GEMINI_REQUEST_FAILED",
            },
        )