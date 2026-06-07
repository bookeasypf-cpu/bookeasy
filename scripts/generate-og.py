"""Generate OG image for BookEasy — v2 "Conversion".

Premium SaaS aesthetic — asymmetric layout, strong CTA, product-hint (calendar card).
Output: public/og-cover.jpg (1200x630, JPG, <200KB)
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

# ─────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────
W, H = 1200, 630
FONTS = "/Users/maravai/.claude/skills/canvas-design/canvas-fonts"
OUT_DIR = "/Users/maravai/Downloads/Claude-Projects/projects/bookeasy/public"
OUT_JPG = f"{OUT_DIR}/og-cover.jpg"

# Color palette — BookEasy brand
INK_BG_TOP    = (8, 18, 36)         # near-black navy
INK_BG_MID    = (12, 27, 52)        # deep navy (#0C1B2A — brand)
INK_ACCENT    = (10, 60, 130)       # blue glow
TYPE_WHITE    = (250, 252, 255)
TYPE_DIM      = (160, 180, 210)
TYPE_MUTED    = (110, 130, 160)
CYAN_BRAND    = (0, 180, 216)       # #00B4D8 — brand secondary
BLUE_BRAND    = (0, 102, 255)       # #0066FF — brand primary
GOLD          = (252, 195, 95)      # warm CTA (legacy v2)
GOLD_DEEP     = (220, 162, 60)
# Direction A — Lagon turquoise (replaces gold for CTA v3)
LAGOON        = (34, 211, 238)      # #22D3EE — Polynesian lagoon
LAGOON_DEEP   = (14, 165, 200)      # darker lagoon for shadow
LAGOON_GLOW   = (103, 232, 249)     # #67E8F9 — light splash
CARD_BG       = (255, 255, 255)
CARD_SHADOW   = (0, 0, 0)

# ─────────────────────────────────────────────────────────
# CANVAS
# ─────────────────────────────────────────────────────────
img = Image.new("RGB", (W, H), INK_BG_MID)
draw = ImageDraw.Draw(img, "RGBA")

# ─── Background : radial-ish gradient simulated by diagonal vignette
def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

# Vertical gradient base
for y in range(H):
    t = y / (H - 1)
    if t < 0.5:
        c = lerp(INK_BG_TOP, INK_BG_MID, t / 0.5)
    else:
        c = lerp(INK_BG_MID, (15, 35, 70), (t - 0.5) / 0.5)
    draw.line([(0, y), (W, y)], fill=c)

# Subtle blue glow blob behind the headline (left side)
GLOW_LAYERS = 30
glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gdraw = ImageDraw.Draw(glow_layer)
for r in range(380, 80, -10):
    alpha = int(8 + (380 - r) * 0.15)
    gdraw.ellipse([180 - r, 200 - r, 180 + r, 200 + r],
                  fill=(0, 102, 255, min(alpha, 25)))
glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(20))
img.paste(glow_layer, (0, 0), glow_layer)
draw = ImageDraw.Draw(img, "RGBA")

# Subtle dot grid pattern (booking/calendar hint)
GRID = 28
for x in range(GRID, W, GRID):
    for y in range(GRID, H, GRID):
        draw.ellipse([x-1, y-1, x+1, y+1], fill=(255, 255, 255, 10))

# Direction B — Subtle Polynesian wave motif, placed in the lower-left
# negative space between subtitle and CTA. Inspired by Maohi tatau chevrons.
# Opacity 5% — reads as texture, not decoration. Stays out of the calendar card.
wave_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
wdraw = ImageDraw.Draw(wave_layer)
_WAVE_LEFT = 70  # mirrors LEFT_PAD defined later in the file
WAVE_BASE_X = _WAVE_LEFT
# Position: below the subtitle, above the CTA pill (vertical breathing room)
WAVE_BASE_Y = H - 200
CHEVRON_W = 14
CHEVRON_H = 6
for row in range(3):
    y_offset = WAVE_BASE_Y + row * (CHEVRON_H + 3)
    x_offset = WAVE_BASE_X + (row % 2) * (CHEVRON_W // 2)
    for col in range(20):
        cx = x_offset + col * CHEVRON_W
        if cx + CHEVRON_W > _WAVE_LEFT + 280:
            break
        wdraw.line(
            [(cx, y_offset + CHEVRON_H), (cx + CHEVRON_W // 2, y_offset),
             (cx + CHEVRON_W, y_offset + CHEVRON_H)],
            fill=(103, 232, 249, 18),
            width=1,
        )
wave_layer = wave_layer.filter(ImageFilter.GaussianBlur(0.3))
img.paste(wave_layer, (0, 0), wave_layer)
draw = ImageDraw.Draw(img, "RGBA")

# ─────────────────────────────────────────────────────────
# TYPOGRAPHY
# ─────────────────────────────────────────────────────────
font_h1   = ImageFont.truetype(f"{FONTS}/BricolageGrotesque-Bold.ttf", 88)
font_h2   = ImageFont.truetype(f"{FONTS}/BricolageGrotesque-Bold.ttf", 88)
font_sub  = ImageFont.truetype(f"{FONTS}/InstrumentSans-Regular.ttf", 26)
font_chip = ImageFont.truetype(f"{FONTS}/GeistMono-Bold.ttf", 14)
font_mono = ImageFont.truetype(f"{FONTS}/GeistMono-Regular.ttf", 15)
font_cta  = ImageFont.truetype(f"{FONTS}/BricolageGrotesque-Bold.ttf", 24)
font_brand= ImageFont.truetype(f"{FONTS}/BricolageGrotesque-Bold.ttf", 30)

LEFT_PAD = 70
RIGHT_PAD = W - 70

# ─────────────────────────────────────────────────────────
# TOP : Brand mark + locale tag
# ─────────────────────────────────────────────────────────
# Logo "BookEasy" top-left
brand_y = 60
draw.text((LEFT_PAD, brand_y), "Book", font=font_brand, fill=TYPE_WHITE)
book_bbox = draw.textbbox((0, 0), "Book", font=font_brand)
draw.text((LEFT_PAD + (book_bbox[2] - book_bbox[0]), brand_y), "Easy",
          font=font_brand, fill=CYAN_BRAND)

# Locale tag — moved near the brand, top-left side (avoids collision with card)
tag_text = "POLYNÉSIE FRANÇAISE"
tbbox = draw.textbbox((0, 0), tag_text, font=font_chip)
tw, th = tbbox[2] - tbbox[0], tbbox[3] - tbbox[1]
# Position to the right of brand "BookEasy"
brand_w = draw.textbbox((0, 0), "BookEasy", font=font_brand)[2]
tag_x1 = LEFT_PAD + brand_w + 22
tag_x2 = tag_x1 + tw + 56  # extra room for dot + paddings
tag_y1 = brand_y + 8
tag_y2 = tag_y1 + th + 14
draw.rounded_rectangle([tag_x1, tag_y1, tag_x2, tag_y2], radius=20,
                       fill=(255, 255, 255, 15),
                       outline=(255, 255, 255, 50), width=1)
# Tiny green dot (status indicator) at start of pill
dot_x = tag_x1 + 16
dot_y = tag_y1 + (tag_y2 - tag_y1) // 2
for r in range(7, 3, -1):
    draw.ellipse([dot_x - r, dot_y - r, dot_x + r, dot_y + r],
                 fill=(34, 197, 94, max(0, 25 - r * 2)))
draw.ellipse([dot_x - 4, dot_y - 4, dot_x + 4, dot_y + 4], fill=(34, 197, 94))
# Tag text after dot
draw.text((tag_x1 + 30, tag_y1 + 6), tag_text, font=font_chip, fill=TYPE_WHITE)

# ─────────────────────────────────────────────────────────
# HEADLINE block (left side)
# ─────────────────────────────────────────────────────────
# Eyebrow text — territorial signature
eyebrow = "RÉSERVATION EN LIGNE  ·  POLYNÉSIE"
draw.text((LEFT_PAD, 175), eyebrow, font=font_chip, fill=LAGOON)

# H1 (2 lines) — D direction: pain point local + identity
line1 = "Réservez."
line2 = "Sans appeler."
h_y = 205
draw.text((LEFT_PAD, h_y), line1, font=font_h1, fill=TYPE_WHITE)
# Second line — slight lagoon tint on the period to anchor the punctuation
line2_y = h_y + 95
draw.text((LEFT_PAD, line2_y), line2, font=font_h2, fill=TYPE_WHITE)

# Subtitle — rhythm + 24h/24 benefit at the end
sub_y = line2_y + 115
sub_text = "Coiffeurs · Spas · Bien-être · Esthétique"
sub2_text = "Partout en Polynésie française, 24h/24."
draw.text((LEFT_PAD, sub_y), sub_text, font=font_sub, fill=TYPE_DIM)
draw.text((LEFT_PAD, sub_y + 36), sub2_text, font=font_sub, fill=TYPE_DIM)

# ─────────────────────────────────────────────────────────
# CTA pill (bottom-left)
# ─────────────────────────────────────────────────────────
cta_text = "Réserver maintenant"
cta_arrow = "→"
cbbox = draw.textbbox((0, 0), cta_text, font=font_cta)
cw, chh = cbbox[2] - cbbox[0], cbbox[3] - cbbox[1]
abbox = draw.textbbox((0, 0), cta_arrow, font=font_cta)
aw = abbox[2] - abbox[0]
pill_pad_x = 28
pill_gap = 18
pill_w = cw + aw + pill_pad_x * 2 + pill_gap
pill_h = 64
pill_x = LEFT_PAD
pill_y = H - pill_h - 70

# Lagoon gradient pill — Direction A
# Outer cyan glow (drop shadow with lagoon color)
shadow = Image.new("RGBA", (pill_w + 40, pill_h + 40), (0, 0, 0, 0))
sdraw = ImageDraw.Draw(shadow)
sdraw.rounded_rectangle([20, 20, pill_w + 20, pill_h + 20], radius=pill_h // 2,
                        fill=(34, 211, 238, 90))
shadow = shadow.filter(ImageFilter.GaussianBlur(16))
img.paste(shadow, (pill_x - 20, pill_y - 10), shadow)
draw = ImageDraw.Draw(img, "RGBA")

# Pill body — solid lagoon with subtle top highlight
draw.rounded_rectangle([pill_x, pill_y, pill_x + pill_w, pill_y + pill_h],
                       radius=pill_h // 2, fill=LAGOON)
# Top highlight band for dimensionality
draw.rounded_rectangle([pill_x + 2, pill_y + 2, pill_x + pill_w - 2, pill_y + pill_h // 2],
                       radius=pill_h // 2, fill=(167, 243, 255, 70))

# Center text vertically — compensate font baseline. Use deep navy for max contrast.
text_y = pill_y + (pill_h - chh) // 2 - cbbox[1]
draw.text((pill_x + pill_pad_x, text_y), cta_text,
          font=font_cta, fill=INK_BG_TOP)
draw.text((pill_x + pill_pad_x + cw + pill_gap, text_y), cta_arrow,
          font=font_cta, fill=INK_BG_TOP)

# Domain text below pill
domain = "bookeasy.me"
draw.text((LEFT_PAD, pill_y + pill_h + 16), domain,
          font=font_mono, fill=TYPE_MUTED)

# ─────────────────────────────────────────────────────────
# RIGHT SIDE : Calendar/booking card mockup (product hint)
# ─────────────────────────────────────────────────────────
card_w, card_h = 380, 460
card_x = W - card_w - 90
card_y = (H - card_h) // 2 - 10

# Drop shadow
cshadow = Image.new("RGBA", (card_w + 80, card_h + 80), (0, 0, 0, 0))
csdraw = ImageDraw.Draw(cshadow)
csdraw.rounded_rectangle([40, 40, card_w + 40, card_h + 40], radius=24,
                         fill=(0, 0, 0, 110))
cshadow = cshadow.filter(ImageFilter.GaussianBlur(25))
img.paste(cshadow, (card_x - 40, card_y - 20), cshadow)
draw = ImageDraw.Draw(img, "RGBA")

# Card body
draw.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h],
                       radius=24, fill=CARD_BG)
# Direction A — fine lagoon accent line at the top of the card (signature)
draw.rounded_rectangle([card_x + 24, card_y + 12, card_x + 80, card_y + 14],
                       radius=2, fill=LAGOON)

# Card header — month label
mh_y = card_y + 28
draw.text((card_x + 26, mh_y), "Juillet 2026",
          font=font_brand, fill=INK_BG_MID)
draw.text((card_x + 26, mh_y + 42), "Choisissez votre créneau",
          font=font_mono, fill=(110, 120, 140))

# Mini calendar grid (5 cols x 4 rows, days)
gx = card_x + 26
gy = card_y + 130
cell_w, cell_h = 46, 46
gap = 8
days = [
    ["L", "M", "M", "J", "V", "S", "D"],
]
# Day labels (only show LMMJV due to 5-col grid; use 7 cols)
cell_w = 44
gap = 6
# Header day initials
dy = gy
for i, d in enumerate(["L", "M", "M", "J", "V", "S", "D"]):
    cx = gx + i * (cell_w + gap)
    draw.text((cx + 14, dy), d, font=font_chip, fill=(150, 160, 180))

# Date grid — July 2026 starts on a Wednesday (col 2)
# Show 3 weeks containing the "selected" highlight
start_day = 8   # Wed July 8 → row 0 col 2
selected = (1, 2)  # July 15 highlighted
booked = [(0, 4), (0, 5), (2, 0), (2, 5)]
MAX_DAY = 31
for row in range(3):
    for col in range(7):
        date = start_day + row * 7 + col
        if date > MAX_DAY:
            continue  # Stop drawing past end of month
        cx = gx + col * (cell_w + gap)
        cy = gy + 30 + row * (cell_h + gap)
        if (row, col) == selected:
            # Highlighted day — brand color
            draw.rounded_rectangle([cx, cy, cx + cell_w, cy + cell_h],
                                   radius=12, fill=BLUE_BRAND)
            # Center text by measuring its width
            dbox = draw.textbbox((0, 0), str(date), font=font_chip)
            dw = dbox[2] - dbox[0]
            draw.text((cx + (cell_w - dw) // 2, cy + 12), str(date),
                      font=font_chip, fill=(255, 255, 255))
        elif (row, col) in booked:
            draw.rounded_rectangle([cx, cy, cx + cell_w, cy + cell_h],
                                   radius=12, fill=(240, 242, 246))
            dbox = draw.textbbox((0, 0), str(date), font=font_chip)
            dw = dbox[2] - dbox[0]
            draw.text((cx + (cell_w - dw) // 2, cy + 12), str(date),
                      font=font_chip, fill=(180, 188, 200))
        else:
            draw.rounded_rectangle([cx, cy, cx + cell_w, cy + cell_h],
                                   radius=12, fill=(245, 248, 252),
                                   outline=(220, 226, 235), width=1)
            dbox = draw.textbbox((0, 0), str(date), font=font_chip)
            dw = dbox[2] - dbox[0]
            draw.text((cx + (cell_w - dw) // 2, cy + 12), str(date),
                      font=font_chip, fill=INK_BG_MID)

# Time slots row
slots_y = gy + 30 + 3 * (cell_h + gap) + 22
draw.text((card_x + 26, slots_y), "Créneaux disponibles",
          font=font_mono, fill=(110, 120, 140))
slot_y = slots_y + 28
slot_w = 78
slot_h = 36
slot_gap = 10
for i, t in enumerate(["09:00", "10:30", "14:00", "15:30"]):
    sx = card_x + 26 + i * (slot_w + slot_gap)
    if i == 1:  # selected slot
        draw.rounded_rectangle([sx, slot_y, sx + slot_w, slot_y + slot_h],
                               radius=10, fill=BLUE_BRAND)
        draw.text((sx + 16, slot_y + 9), t,
                  font=font_chip, fill=(255, 255, 255))
    else:
        draw.rounded_rectangle([sx, slot_y, sx + slot_w, slot_y + slot_h],
                               radius=10, fill=(245, 248, 252),
                               outline=(220, 226, 235), width=1)
        draw.text((sx + 16, slot_y + 9), t,
                  font=font_chip, fill=INK_BG_MID)

# ─────────────────────────────────────────────────────────
# BOTTOM RIGHT : Trust badge — clean text-only
# ─────────────────────────────────────────────────────────
# Trust badge — local insight ("faster than a phone call")
trust_text_top = "+ RAPIDE QU'UN APPEL"
trust_text_bot = "Confirmation instantanée"
trust_right = card_x + card_w
ttbox = draw.textbbox((0, 0), trust_text_top, font=font_chip)
tt_w = ttbox[2] - ttbox[0]
tbbox = draw.textbbox((0, 0), trust_text_bot, font=font_mono)
tb_w = tbbox[2] - tbbox[0]
draw.text((trust_right - tt_w, H - 78), trust_text_top,
          font=font_chip, fill=LAGOON)
draw.text((trust_right - tb_w, H - 52), trust_text_bot,
          font=font_mono, fill=TYPE_DIM)

# ─────────────────────────────────────────────────────────
# EXPORT
# ─────────────────────────────────────────────────────────
# Baseline JPEG (NOT progressive) — some WhatsApp versions fail to render
# progressive JPEGs in link previews even when Content-Type is image/jpeg.
img.save(OUT_JPG, "JPEG", quality=90, optimize=True, progressive=False)
size_kb = os.path.getsize(OUT_JPG) / 1024
print(f"✓ Generated: {OUT_JPG}")
print(f"  Size: {size_kb:.1f} KB")
print(f"  Dimensions: {W}x{H}")
print(f"  Baseline JPEG (no progressive)")

if size_kb > 200:
    for q in [85, 80, 75]:
        img.save(OUT_JPG, "JPEG", quality=q, optimize=True, progressive=False)
        size_kb = os.path.getsize(OUT_JPG) / 1024
        if size_kb <= 200:
            print(f"  Re-encoded at q={q}: {size_kb:.1f} KB")
            break
