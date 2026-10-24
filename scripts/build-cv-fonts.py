"""Build static (single-weight) woff2 faces from the downloaded variable fonts.

Chrome's print-to-PDF emits Type3 glyph procedures for variable fonts, which
breaks text extraction in most ATS parsers. Instancing the variable axis
produces plain static faces that Chrome embeds as proper TrueType subsets.
"""

import os
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "fonts", "cv")
os.makedirs(OUT, exist_ok=True)

JOBS = [
    ("fonts/inter-latin.woff2", "inter", [400, 500, 600, 700, 800]),
    ("fonts/jetbrains-mono-latin.woff2", "jetbrains-mono", [400, 500, 600, 700]),
]

for src, stem, weights in JOBS:
    path = os.path.join(ROOT, "public", src)
    for w in weights:
        font = TTFont(path)
        axes = {a.axisTag for a in font["fvar"].axes}
        loc = {"wght": w}
        if "opsz" in axes:
            loc["opsz"] = 14 if stem == "inter" else 14
        inst = instantiateVariableFont(font, loc, updateFontNames=False)
        # Pin the OS/2 weight class so viewers do not attempt synthesis.
        inst["OS/2"].usWeightClass = w
        out = os.path.join(OUT, f"{stem}-{w}.woff2")
        inst.flavor = "woff2"
        inst.save(out)
        print(f"{out}: {os.path.getsize(out)} bytes")
