#!/usr/bin/env python3
"""
Скрипт для создания тестового PDF файла для приложения Language Translator
"""

try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    print("ReportLab установлен, создаем PDF...")
except ImportError:
    print("ReportLab не установлен. Устанавливаем...")
    import subprocess
    subprocess.run(["pip3", "install", "reportlab"])
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont

def create_test_pdf():
    # Создаем PDF файл
    c = canvas.Canvas("test-document.pdf", pagesize=letter)
    width, height = letter
    
    # Заголовок
    c.setFont("Helvetica-Bold", 16)
    c.drawString(1*inch, 10*inch, "Language Translator Test Document")
    
    # Подзаголовок
    c.setFont("Helvetica", 12)
    c.drawString(1*inch, 9.5*inch, "This is a test PDF file for the language learning application.")
    
    # Основной текст
    c.setFont("Helvetica", 10)
    text_lines = [
        "The quick brown fox jumps over the lazy dog. This is a sample text for testing",
        "the language translator application. You can click on any word to see its",
        "translation in a tooltip.",
        "",
        "Hello world! This application allows you to upload text files in various",
        "formats and translate individual words by clicking on them.",
        "",
        "The application supports multiple languages including English, German,",
        "Italian, and French. You can upload PDF, DOCX, TXT, and EPUB files.",
        "",
        "Each word in the text becomes clickable, and when you click on a word,",
        "a tooltip appears with the translation, transcription, and usage examples.",
        "",
        "This makes language learning more interactive and engaging. You can build",
        "your vocabulary by reading texts in foreign languages and getting instant",
        "translations.",
        "",
        "The interface is designed to be user-friendly with a modern Material UI",
        "design. The application uses Google Translate API and Yandex Translate",
        "API for accurate translations.",
        "",
        "Enjoy learning languages with this interactive translator!"
    ]
    
    y_position = 8.5*inch
    for line in text_lines:
        c.drawString(1*inch, y_position, line)
        y_position -= 0.25*inch
    
    # Добавляем еще один абзац
    c.setFont("Helvetica-Bold", 12)
    c.drawString(1*inch, 3*inch, "Additional Test Content:")
    
    c.setFont("Helvetica", 10)
    additional_text = [
        "This PDF contains various English words that you can test with the translator:",
        "",
        "• beautiful - прекрасный",
        "• computer - компьютер", 
        "• language - язык",
        "• translation - перевод",
        "• learning - обучение",
        "• application - приложение",
        "• interface - интерфейс",
        "• technology - технология",
        "• education - образование",
        "• development - разработка"
    ]
    
    y_position = 2.5*inch
    for line in additional_text:
        c.drawString(1*inch, y_position, line)
        y_position -= 0.25*inch
    
    c.save()
    print("PDF файл 'test-document.pdf' успешно создан!")

if __name__ == "__main__":
    create_test_pdf()



