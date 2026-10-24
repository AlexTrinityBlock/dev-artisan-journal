"""Downscale credential artwork for the PDF (Chrome embeds images at full size)."""

import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = [
    "public/images/certifications/nvidia-genai-llms-full.png",
    "public/images/certifications/cka-full.png",
    "public/images/certifications/aws-sap-full.png",
    "public/images/certifications/gcp-pca-full.png",
    "public/images/certifications/iso27001-full.png",
    "public/images/certifications/python-pcpp-1.png",
    "public/images/paper/paper.png",
]
OUT = os.path.join(ROOT, "public", "cv", "img")
os.makedirs(OUT, exist_ok=True)

for rel in SRC:
    im = Image.open(os.path.join(ROOT, rel))
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1])
        im = bg
    else:
        im = im.convert("RGB")
    im.thumbnail((520, 520), Image.LANCZOS)
    name = os.path.splitext(os.path.basename(rel))[0]
    out = os.path.join(OUT, f"{name}.jpg")
    im.save(out, "JPEG", quality=86, optimize=True)
    print(f"{out}: {im.size} {os.path.getsize(out) // 1024} KB")
