from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
import os
import re
import shutil
import uuid

from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.models.attachment import Attachment
from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.services.web_search import search_web
from fastapi import Body
from app.models.project import Project
from app.schemas.chat import (
    ChatRequest, 
    ChatResponse, 
    ChatSessionResponse, 
    ChatSessionDetailResponse,
    ChatSessionUpdateRequest,
    ChatMessageResponse
)
from app.services.ai_service import generate_ai_response, generate_ai_stream
from fastapi.responses import StreamingResponse as FastAPIStreamingResponse
import json
from app.utils.file_utils import get_file_category, is_allowed_file, extract_text_content

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

from typing import List, Optional

@router.post("")
def chat_with_ai(
    prompt: str = Form(...),
    effort: str = Form("medium"),
    model: str = Form(None),
    session_id: Optional[str] = Form(None),
    project_id: Optional[str] = Form(None),
    skill: Optional[str] = Form(None),
    web_search: bool = Form(False),
    stream: bool = Form(False),
    files: Optional[List[UploadFile]] = File(default=[]),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"DEBUG: /chat called — prompt='{prompt[:30]}', session_id={session_id}", flush=True)
    prompt = prompt.strip()
    if not prompt and not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt cannot be empty."
        )
        
    chat_session = None
    
    if session_id:
        chat_session = db.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id
        ).first()
        if not chat_session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )
    else:
        title = prompt[:50] + ("..." if len(prompt) > 50 else "")
        if not title and files:
            title = "Image Upload"
        chat_session = ChatSession(user_id=current_user.id, title=title, project_id=project_id, ai_titled=False)
        db.add(chat_session)
        db.commit()
        db.refresh(chat_session)
        session_id = chat_session.id

    uploaded_image_urls = []
    uploaded_file_links = []
    file_context_parts = []
    if files:
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "uploads")
        os.makedirs(upload_dir, exist_ok=True)
        for file in files:
            if not file.filename:
                continue
            print(f"DEBUG: Received file - filename: {file.filename}, content_type: {file.content_type}", flush=True)
            if not is_allowed_file(file.filename, file.content_type):
                raise HTTPException(status_code=400, detail=f"File type not supported: {file.filename}")
            
            ext = os.path.splitext(file.filename)[1]
            unique_filename = f"{uuid.uuid4().hex}{ext}"
            file_path = os.path.join(upload_dir, unique_filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            file_url = f"/static/uploads/{unique_filename}"
            file_category = get_file_category(file.filename, file.content_type)

            db.add(Attachment(
                user_id=current_user.id,
                session_id=session_id,
                filename=file.filename,
                file_path=file_url,
                file_type=file_category,
                mime_type=file.content_type,
                size=os.path.getsize(file_path)
            ))

            if file_category == "image":
                uploaded_image_urls.append(file_url)
            else:
                uploaded_file_links.append((file.filename, file_url))
                extracted_text = extract_text_content(file_path, file_category)
                print(f"DEBUG: Extracted text length: {len(extracted_text) if extracted_text else 0} characters", flush=True)
                if extracted_text:
                    truncated = extracted_text[:8000]
                    file_context_parts.append(f"[Content of attached file: {file.filename}]\n{truncated}")

    db_content = prompt
    for img_url in uploaded_image_urls:
        db_content = f"![Attached Image]({img_url})\n\n" + db_content
    for filename, file_url in uploaded_file_links:
        db_content = f"[📄 {filename}]({file_url})\n\n" + db_content

    user_message = ChatMessage(
        session_id=session_id,
        role="user",
        content=db_content
    )
    db.add(user_message)
    db.commit()

    ai_prompt = prompt
    if file_context_parts:
        ai_prompt = prompt + "\n\n" + "\n\n".join(file_context_parts)

    personalization_parts = []
    if current_user.nickname:
        personalization_parts.append(f"The user's preferred name is \"{current_user.nickname}\". Address them by this name when it feels natural.")
    if current_user.occupation:
        personalization_parts.append(f"The user's occupation is \"{current_user.occupation}\". Tailor examples and explanations to this context when relevant.")
    if current_user.custom_instructions:
        personalization_parts.append(f"The user has given you these standing instructions for how to respond: {current_user.custom_instructions}")

    effort_instructions = {
        "low": "Keep your response brief and to the point. Skip lengthy explanations, background context, or extra examples unless explicitly asked.",
        "medium": "",
        "high": "Think carefully and give a thorough, detailed response. Cover edge cases, explain your reasoning, and include relevant examples where useful.",
    }
    effort_instruction = effort_instructions.get(effort, "")
    if effort_instruction:
        personalization_parts.append(effort_instruction)

    SKILL_INSTRUCTIONS = {
        "frontend": "Act as a senior frontend development expert (HTML, CSS, JavaScript, React, Vue, accessibility, performance, responsive design). Give detailed, practical, code-backed answers and proactively point out edge cases, bugs, or better patterns relevant to frontend work.",
        "backend": "Act as a senior backend development expert (APIs, databases, server architecture, authentication, scalability, security). Give detailed, practical, code-backed answers and proactively point out edge cases or architectural issues.",
        "data_science": "Act as a senior data science expert (statistics, data cleaning, pandas/numpy, visualization, experiment design, model evaluation). Give detailed, methodical, example-driven answers.",
        "devops": "Act as a senior DevOps expert (CI/CD, containers, Kubernetes, cloud infrastructure, monitoring, automation). Give detailed, practical, step-by-step answers.",
        "mobile": "Act as a senior mobile development expert (iOS, Android, React Native, Flutter, app performance, platform guidelines). Give detailed, practical, code-backed answers.",
        "ui_ux": "Act as a senior UI/UX design expert (usability, accessibility, design systems, user research, visual hierarchy). Give detailed, practical, example-driven design guidance.",
        "cybersecurity": "Act as a senior cybersecurity expert (threat modeling, secure coding, vulnerabilities, best practices). Give detailed, practical guidance while staying within safe, defensive-use boundaries.",
        "machine_learning": "Act as a senior machine learning expert (model architecture, training, evaluation, MLOps). Give detailed, methodical, example-driven answers.",
    }
    if skill and skill in SKILL_INSTRUCTIONS:
        personalization_parts.append(SKILL_INSTRUCTIONS[skill])

    if web_search:
        search_context = search_web(prompt)
        if search_context:
            personalization_parts.append(search_context)

    if personalization_parts:
        ai_prompt = "[User personalization settings — follow these unless they conflict with safety]\n" + "\n".join(personalization_parts) + "\n\n" + ai_prompt

    print(f"DEBUG: Final ai_prompt length sent to Ollama: {len(ai_prompt)} characters", flush=True)
    print(f"DEBUG chat.py: uploaded_image_urls={uploaded_image_urls}", flush=True)
    print(f"DEBUG chat.py: files received={len(files) if files else 0}", flush=True)
    images_to_send = list(uploaded_image_urls)

    # Build conversation history
    previous_messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at).all()
    
    conversation_history = [
        {"role": msg.role, "content": msg.content}
        for msg in previous_messages
    ]

    if stream:
        def stream_generator():
            full_response = ""
            try:
                for chunk in generate_ai_stream(ai_prompt, images=images_to_send, model=model, history=conversation_history):
                    chunk = re.sub(r"<think>.*?</think>", "", chunk, flags=re.DOTALL)
                    if chunk:
                        full_response += chunk
                        yield f"data: {json.dumps({'content': chunk, 'session_id': session_id})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
            finally:
                try:
                    if full_response:
                        ai_message = ChatMessage(session_id=session_id, role="ai", content=full_response)
                        db.add(ai_message)
                        chat_session.updated_at = func.now()

                        # Auto-generate title from first AI reply
                        if not getattr(chat_session, 'ai_titled', False):
                            try:
                                from app.services.ai_service import generate_ai_response
                                title_prompt = (
                                    f"Generate a short, clear chat title (max 6 words, no quotes, no punctuation at end) "
                                    f"for a conversation that starts with this user message:\n\n\"{prompt}\""
                                )
                                generated_title = generate_ai_response(title_prompt)
                                generated_title = generated_title.strip().strip('"\'').strip()
                                if generated_title:
                                    chat_session.title = generated_title[:80]
                                    chat_session.ai_titled = True
                            except Exception:
                                pass

                        db.commit()
                except Exception:
                    db.rollback()
                yield f"data: {json.dumps({'done': True, 'session_id': session_id, 'title': chat_session.title})}\n\n"

        return FastAPIStreamingResponse(
            stream_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                "Connection": "keep-alive",
            }
        )

    try:
        ai_response_text = str(generate_ai_response(ai_prompt, images=uploaded_image_urls, model=model, history=conversation_history))

        # Strip internal <think>...</think> reasoning blocks that some models
        # (e.g. Qwen reasoning models) include in their raw output — these
        # aren't meant to be shown to the user.
        ai_response_text = re.sub(r"<think>.*?</think>", "", ai_response_text, flags=re.DOTALL).strip()

        ai_message = ChatMessage(
            session_id=session_id,
            role="ai",
            content=ai_response_text
        )
        db.add(ai_message)
        
        # Update session updated_at
        chat_session.updated_at = func.now()
        
        db.commit()
        return ChatResponse(response=ai_response_text, session_id=session_id)
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.get("/history", response_model=List[ChatSessionResponse])
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).order_by(desc(ChatSession.updated_at)).all()
    return sessions

@router.get("/history/{session_id}", response_model=ChatSessionDetailResponse)
def get_chat_session_detail(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    return session

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    db.delete(session)
    db.commit()
    return None

@router.patch("/{session_id}", response_model=ChatSessionResponse)
def rename_chat_session(
    session_id: str,
    request: ChatSessionUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    session.title = request.title
    session.updated_at = func.now()
    db.commit()
    db.refresh(session)
    return session


@router.patch("/{session_id}/project", response_model=ChatSessionResponse)
def assign_session_to_project(
    session_id: str,
    project_id: Optional[str] = Body(None, embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )

    if project_id:
        project = db.query(Project).filter(
            Project.id == project_id,
            Project.user_id == current_user.id
        ).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

    session.project_id = project_id
    session.updated_at = func.now()
    db.commit()
    db.refresh(session)
    return session


@router.post("/message/{message_id}/save", response_model=ChatMessageResponse)
def save_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    message = db.query(ChatMessage).join(ChatSession).filter(
        ChatMessage.id == message_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    message.is_saved = True
    db.commit()
    db.refresh(message)
    return message


@router.post("/message/{message_id}/unsave", response_model=ChatMessageResponse)
def unsave_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    message = db.query(ChatMessage).join(ChatSession).filter(
        ChatMessage.id == message_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    message.is_saved = False
    db.commit()
    db.refresh(message)
    return message


@router.get("/saved", response_model=List[ChatMessageResponse])
def get_saved_messages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    messages = db.query(ChatMessage).join(ChatSession).filter(
        ChatSession.user_id == current_user.id,
        ChatMessage.is_saved == True
    ).order_by(ChatMessage.created_at.desc()).all()

    results = []
    for msg in messages:
        item = ChatMessageResponse.model_validate(msg)
        item.session_id = msg.session_id
        item.session_title = msg.session.title if msg.session else None
        results.append(item)
    return results
