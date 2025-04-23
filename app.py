
import os
from flask import Flask, request, send_file, after_this_request
import tempfile
import shutil

from PIL import Image
import numpy as np
import cv2

# For PDF conversion, using pdf2image for PDF -> images
from pdf2image import convert_from_path
from fpdf import FPDF

app = Flask(__name__)

def edge_detect(image: Image.Image, method: str):
    img_np = np.array(image.convert("L"))
    if method == "laplacian":
        kernel = np.array([[0, -1, 0],
                           [-1, 4, -1],
                           [0, -1, 0]])
        result = cv2.filter2D(img_np, -1, kernel)
    else:
        # Sobel X and Y
        Gx = cv2.Sobel(img_np, cv2.CV_64F, 1, 0, ksize=3)
        Gy = cv2.Sobel(img_np, cv2.CV_64F, 0, 1, ksize=3)
        result = np.sqrt(Gx ** 2 + Gy ** 2)
    # Normalize, invert for white background, convert to uint8
    result = cv2.normalize(result, None, 0, 255, cv2.NORM_MINMAX)
    result = 255 - result.astype(np.uint8)
    return Image.fromarray(result)

@app.route("/upload", methods=["POST"])
def upload_pdf():
    if "file" not in request.files:
        return "No file part", 400
    file = request.files["file"]
    if not file or not file.filename.endswith(".pdf"):
        return "Please upload a PDF file", 400

    method = request.form.get("edgemode", "laplacian").lower()
    if method not in ["laplacian", "sobel"]:
        method = "laplacian"

    tmpdir = tempfile.mkdtemp()
    save_path = os.path.join(tmpdir, file.filename)
    file.save(save_path)

    try:
        # Convert PDF pages to images
        images = convert_from_path(save_path)
        processed_images = []
        for page_image in images:
            processed = edge_detect(page_image, method)
            processed_images.append(processed)

        # Save processed images as a new PDF
        output_pdf_path = os.path.join(tmpdir, "scanned_output.pdf")
        if processed_images:
            processed_images[0].save(
                output_pdf_path, "PDF", resolution=100.0, save_all=True, append_images=processed_images[1:]
            )
        else:
            return "No pages found", 400

        # Serve the file and cleanup
        @after_this_request
        def remove_file(response):
            shutil.rmtree(tmpdir)
            return response

        return send_file(output_pdf_path, as_attachment=True, download_name="scanned_document.pdf")

    except Exception as e:
        return f"Processing error: {str(e)}", 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
