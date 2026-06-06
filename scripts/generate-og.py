"""Generate OG image for BookEasy — Pacific Precision philosophy.

Output: public/og-cover.jpg (1200x630, JPG, <200KB)
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import math

# ─────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────
W, H = 1200, 630
FONTS = "/Users/maravai/.claude/skills/canvas-design/canvas-fonts"
OUT_DIR = "/Users/maravai/Downloads/Claude-Projects/projects/bookeasy/public"
OUT_JPG = f"{OUT_DIR}/og-cover.jpg"

# Color palette — Pacific Precision
INK_DEEP      = (10, 22, 42)        # abyssal blue (top)
INK_MID       = (12, 50, 92)        # deep ocean
INK_TWILIGHT  = (10, 90, 140)       # twilight blue
INK_LAGOON    = (95, 175, 200)      # pale lagoon (bottom)
TYPE_WHITE    = (245, 248, 252)     # near-white
TYPE_DIM      = (180, 200, 220)     # dimmed
SOLAR_GOLD    = (245, 175, 85)      # single warm accent
HORIZON_GOLD  = (220, 165, 85)      # horizon line

# ─────────────────────────────────────────────────────────
# CANVAS
# ─────────────────────────────────────────────────────────
img = Image.new("RGB", (W, H), INK_DEEP)
draw = ImageDraw.Draw(img, "RGBA")

# ─── Vertical gradient (deep → mid → twilight → lagoon hint at bottom)
def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

# 3 stops: deep (0%) → mid (45%) → twilight (75%) → lagoon (100%)
for y in range(H):
    t = y / (H - 1)
    if t < 0.45:
        c = lerp(INK_DEEP, INK_MID, t / 0.45)
    elif t < 0.75:
        c = lerp(INK_MID, INK_TWILIGHT, (t - 0.45) / 0.30)
    else:
        c = lerp(INK_TWILIGHT, INK_LAGOON, (t - 0.75) / 0.25)
    draw.line([(0, y), (W, y)], fill=c)

# ─── Subtle parallax dot grid (cartographic restraint)
GRID = 24
for x in range(GRID, W, GRID):
    for y in range(GRID, H, GRID):
        # diminish density near horizon and bottom
        ny = y / H
        alpha = 18 if ny < 0.55 else 12
        draw.ellipse([x-1, y-1, x+1, y+1], fill=(255, 255, 255, alpha))

# ─── Horizon line — slightly above golden ratio (~38% from top)
HORIZON_Y = int(H * 0.62)  # actually we keep visual horizon below center for sky weight
# Two thin parallel lines (like horizon haze)
draw.line([(80, HORIZON_Y), (W - 80, HORIZON_Y)], fill=(220, 165, 85, 95), width=1)
draw.line([(80, HORIZON_Y + 3), (W - 80, HORIZON_Y + 3)], fill=(220, 165, 85, 35), width=1)

# ─── Sun / moon dot on horizon (single warm accent)
SUN_X = W - 180
SUN_R = 6
# subtle halo
for r in range(SUN_R + 18, SUN_R, -2):
    alpha = max(0, int(15 - (r - SUN_R) * 0.7))
    draw.ellipse([SUN_X - r, HORIZON_Y - r, SUN_X + r, HORIZON_Y + r], fill=(245, 175, 85, alpha))
draw.ellipse([SUN_X - SUN_R, HORIZON_Y - SUN_R, SUN_X + SUN_R, HORIZON_Y + SUN_R], fill=SOLAR_GOLD)

# ─────────────────────────────────────────────────────────
# TYPOGRAPHY
# ─────────────────────────────────────────────────────────
font_brand = ImageFont.truetype(f"{FONTS}/BricolageGrotesque-Bold.ttf", 132)
font_brand_small = ImageFont.truetype(f"{FONTS}/BricolageGrotesque-Bold.ttf", 38)
font_tag = ImageFont.truetype(f"{FONTS}/InstrumentSans-Regular.ttf", 28)
font_mono = ImageFont.truetype(f"{FONTS}/GeistMono-Regular.ttf", 16)
font_mono_bold = ImageFont.truetype(f"{FONTS}/GeistMono-Bold.ttf", 16)
font_micro = ImageFont.truetype(f"{FONTS}/GeistMono-Regular.ttf", 13)

# ─── Top-left: imprint mark
draw.text((78, 60), "—  EST. 2026", font=font_mono, fill=TYPE_DIM)

# ─── Top-right: coordinate (Tahiti)
coord_text = "17.5°S  ·  149.5°W"
bbox = draw.textbbox((0, 0), coord_text, font=font_mono)
draw.text((W - 78 - (bbox[2] - bbox[0]), 60), coord_text, font=font_mono, fill=TYPE_DIM)

# ─── Brand — centered, slightly above horizon
brand = "BookEasy"
bbox = draw.textbbox((0, 0), brand, font=font_brand)
bw, bh = bbox[2] - bbox[0], bbox[3] - bbox[1]
bx = (W - bw) // 2 - bbox[0]
by = HORIZON_Y - bh - 70 - bbox[1]
# whisper-soft shadow for depth (1px offset only)
draw.text((bx + 1, by + 2), brand, font=font_brand, fill=(0, 0, 0, 35))
draw.text((bx, by), brand, font=font_brand, fill=TYPE_WHITE)

# ─── Below horizon: tagline (with letter-spacing simulation)
tag = "RÉSERVATION EN LIGNE  ·  POLYNÉSIE FRANÇAISE"
# Render manually with tracking
tag_y = HORIZON_Y + 38
# Estimate width
bbox = draw.textbbox((0, 0), tag, font=font_tag)
tag_w = bbox[2] - bbox[0]
tag_x = (W - tag_w) // 2 - bbox[0]
draw.text((tag_x, tag_y), tag, font=font_tag, fill=TYPE_WHITE)

# ─── Sub-tagline: secteurs (smaller, dimmer)
sub = "coiffeurs · spas · bien-être · esthétique"
bbox = draw.textbbox((0, 0), sub, font=font_mono)
sub_w = bbox[2] - bbox[0]
sub_x = (W - sub_w) // 2 - bbox[0]
draw.text((sub_x, tag_y + 50), sub, font=font_mono, fill=TYPE_DIM)

# ─── Bottom: URL anchor + metadata
url = "bookeasy.me"
bbox = draw.textbbox((0, 0), url, font=font_mono_bold)
uw = bbox[2] - bbox[0]
ux = (W - uw) // 2 - bbox[0]
uy = H - 60
# small horizontal accent line under URL
line_y = uy + 28
draw.line([(W // 2 - 20, line_y), (W // 2 + 20, line_y)], fill=SOLAR_GOLD, width=1)
draw.text((ux, uy), url, font=font_mono_bold, fill=TYPE_WHITE)

# Bottom-left: marker
draw.text((78, H - 40), "001 / TAHITI", font=font_micro, fill=TYPE_DIM)

# Bottom-right: chart legend
draw.text((W - 78 - 130, H - 40), "v1 · 2026.06", font=font_micro, fill=TYPE_DIM)

# ─── Tick marks along horizon (cartographic detail)
for i in range(0, 11):
    x = 80 + i * ((W - 160) / 10)
    tick_h = 4 if i % 5 == 0 else 2
    draw.line([(x, HORIZON_Y - tick_h), (x, HORIZON_Y - 1)], fill=(220, 165, 85, 120), width=1)

# ─────────────────────────────────────────────────────────
# EXPORT — JPG optimised < 200KB
# ─────────────────────────────────────────────────────────
img.save(OUT_JPG, "JPEG", quality=88, optimize=True, progressive=True)

# Check size
size_kb = os.path.getsize(OUT_JPG) / 1024
print(f"✓ Generated: {OUT_JPG}")
print(f"  Size: {size_kb:.1f} KB")
print(f"  Dimensions: {W}x{H}")

# Auto-reduce quality if >200KB
if size_kb > 200:
    for q in [82, 76, 70]:
        img.save(OUT_JPG, "JPEG", quality=q, optimize=True, progressive=True)
        size_kb = os.path.getsize(OUT_JPG) / 1024
        if size_kb <= 200:
            print(f"  Re-encoded at q={q}: {size_kb:.1f} KB")
            break
