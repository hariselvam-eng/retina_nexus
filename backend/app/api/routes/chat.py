import os

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from openai import OpenAI

load_dotenv()


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


def get_xai_client():
    api_key = os.getenv("XAI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "XAI_API_KEY is not configured."
        )

    return OpenAI(
        api_key=api_key,
        base_url=os.getenv(
            "XAI_BASE_URL",
            "https://api.x.ai/v1",
        ),
    )


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):

    model = os.getenv(
        "XAI_MODEL",
        "grok-4.6",
    )

    try:
        client = get_xai_client()

        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": request.message,
                },
            ],
            temperature=0.4,
            max_tokens=700,
        )

        answer = response.choices[0].message.content

        if not answer:
            raise RuntimeError(
                "Grok returned an empty response."
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
                "code": "XAI_REQUEST_FAILED",
            },
        )