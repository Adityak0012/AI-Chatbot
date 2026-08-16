import os

CODE_EXTENSIONS = {
    ".py", ".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".json",
    ".java", ".c", ".cpp", ".cs", ".go", ".rb", ".php", ".sql",
    ".sh", ".yml", ".yaml", ".xml", ".md", ".txt", ".csv"
}

ALLOWED_EXTENSIONS = CODE_EXTENSIONS | {".pdf", ".doc", ".docx", ".xlsx", ".zip"}


def get_file_category(filename: str, content_type: str | None) -> str:
    """Classifies a file into 'image', 'pdf', 'code', or 'document' for Library display."""
    content_type = content_type or ""
    ext = os.path.splitext(filename or "")[1].lower()

    if content_type.startswith("image/"):
        return "image"
    if content_type == "application/pdf" or ext == ".pdf":
        return "pdf"
    if ext in CODE_EXTENSIONS:
        return "code"
    return "document"


def is_allowed_file(filename: str, content_type: str | None) -> bool:
    content_type = content_type or ""
    ext = os.path.splitext(filename or "")[1].lower()
    return content_type.startswith("image/") or ext in ALLOWED_EXTENSIONS


def extract_text_content(file_path: str, file_category: str) -> str | None:
    """Extracts readable text from a PDF or code/text file so it can be sent to the AI as context."""
    try:
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".xlsx":
            try:
                import openpyxl
                workbook = openpyxl.load_workbook(file_path, data_only=True)
                text_parts = []
                worksheet_count = len(workbook.sheetnames)
                total_rows = 0
                for sheet in workbook.worksheets:
                    sheet_name = sheet.title
                    text_parts.append(f"--- Sheet: {sheet_name} ---")
                    for row in sheet.iter_rows(values_only=True):
                        row_values = [str(cell).strip() for cell in row if cell is not None and str(cell).strip()]
                        if row_values:
                            text_parts.append(" | ".join(row_values))
                            total_rows += 1
                extracted_text = "\n".join(text_parts).strip()
                print(f"DEBUG: worksheet count: {worksheet_count}", flush=True)
                print(f"DEBUG: row count: {total_rows}", flush=True)
                print(f"DEBUG: extracted text length: {len(extracted_text)}", flush=True)
                return extracted_text or None
            except Exception as e:
                print(f"DEBUG: XLSX extraction crashed: {e}", flush=True)
                return None

        if file_category == "pdf":
            print("DEBUG: Entered PDF extraction block", flush=True)
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            text = "\n".join((page.extract_text() or "") for page in reader.pages)
            text = text.strip()

            if not text or len(text) < 20:
                try:
                    from pdf2image import convert_from_path
                    import pytesseract
                    print("DEBUG: Before convert_from_path()", flush=True)
                    images = convert_from_path(file_path)
                    print("DEBUG: After convert_from_path()", flush=True)
                    ocr_text = []
                    for img in images:
                        ocr_text.append(pytesseract.image_to_string(img))
                    text = "\n".join(ocr_text).strip()
                    print(f"DEBUG: Used OCR fallback, extracted {len(text)} chars.", flush=True)
                except Exception as e:
                    print(f"DEBUG: OCR fallback failed: {e}", flush=True)
                    return None
            else:
                print(f"DEBUG: Used pypdf, extracted {len(text)} chars.", flush=True)

            return text or None
        if file_category == "code":
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read().strip() or None
    except Exception as e:
        print(f"DEBUG: PDF extraction crashed: {e}", flush=True)
        return None
    return None
