"""Generate social media assets for BookEasy launch.

Reuses the exact DNA from OG v3:
- Lagoon turquoise (#22D3EE) as signature accent
- Navy brand background (#0C1B2A)
- Subtle Maohi chevron motif
- Bricolage Grotesque + GeistMono typography

Outputs (in public/social/):
- profile-square.jpg      1080x1080   Facebook + Instagram profile photo
- facebook-cover.jpg      1640x856    Facebook page cover (recommended HD)
- instagram-launch.jpg    1080x1080   Instagram launch announcement post
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

FONTS = "/Users/maravai/.claude/skills/canvas-design/canvas-fonts"
OUT_DIR = "/Users/maravai/Downloads/Claude-Projects/projects/bookeasy/public/social"
os.makedirs(OUT_DIR, exist_ok=True)

# ─── BRAND PALETTE (locked from OG v3) ──────────────────────
INK_BG_TOP   = (8, 18, 36)
INK_BG_MID   = (12, 27, 52)
INK_BG_DEEP  = (15, 35, 70)
TYPE_WHITE   = (250, 252, 255)
TYPE_DIM     = (160, 180, 210)
TYPE_MUTED   = (110, 130, 160)
CYAN_BRAND   = (0, 180, 216)
BLUE_BRAND   = (0, 102, 255)
LAGOON       = (34, 211, 238)
LAGOON_DEEP  = (14, 165, 200)
LAGOON_GLOW  = (103, 232, 249)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def vertical_gradient(img, top, mid, deep):
    """Same vertical gradient as OG v3."""
    W, H = img.size
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / (H - 1)
        if t < 0.5:
            c = lerp(top, mid, t / 0.5)
        else:
            c = lerp(mid, deep, (t - 0.5) / 0.5)
        draw.line([(0, y), (W, y)], fill=c)


def dot_grid(img, opacity=10, step=28):
    """Subtle calendar-hint dot grid (same as OG v3)."""
    W, H = img.size
    draw = ImageDraw.Draw(img, "RGBA")
    for x in range(step, W, step):
        for y in range(step, H, step):
            draw.ellipse([x - 1, y - 1, x + 1, y + 1], fill=(255, 255, 255, opacity))


def maohi_chevrons(img, x, y, width, opacity=18, rows=3, chevron_w=14, chevron_h=6):
    """Polynesian Maohi tatau chevrons — same motif as OG v3."""
    W, H = img.size
    wave_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    wdraw = ImageDraw.Draw(wave_layer)
    for row in range(rows):
        y_off = y + row * (chevron_h + 3)
        x_off = x + (row % 2) * (chevron_w // 2)
        max_cols = width // chevron_w
        for col in range(max_cols):
            cx = x_off + col * chevron_w
            if cx + chevron_w > x + width:
                break
            wdraw.line(
                [(cx, y_off + chevron_h), (cx + chevron_w // 2, y_off),
                 (cx + chevron_w, y_off + chevron_h)],
                fill=(103, 232, 249, opacity),
                width=1,
            )
    wave_layer = wave_layer.filter(ImageFilter.GaussianBlur(0.3))
    img.paste(wave_layer, (0, 0), wave_layer)


def lagoon_glow(img, cx, cy, max_r=380, intensity=0.15):
    """Subtle lagoon glow halo (variant of OG v3's blue glow)."""
    W, H = img.size
    glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow_layer)
    for r in range(max_r, 80, -10):
        alpha = int(8 + (max_r - r) * intensity)
        gdraw.ellipse(
            [cx - r, cy - r, cx + r, cy + r],
            fill=(34, 211, 238, min(alpha, 35)),
        )
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(24))
    img.paste(glow_layer, (0, 0), glow_layer)


# ════════════════════════════════════════════════════════════
# 1. PROFILE SQUARE — 1080x1080 (Facebook + Instagram)
# ════════════════════════════════════════════════════════════
def make_profile():
    W = H = 1080
    img = Image.new("RGB", (W, H), INK_BG_MID)
    vertical_gradient(img, INK_BG_TOP, INK_BG_MID, INK_BG_DEEP)

    # Center lagoon halo
    lagoon_glow(img, W // 2, H // 2, max_r=460, intensity=0.18)

    dot_grid(img, opacity=12, step=32)

    draw = ImageDraw.Draw(img, "RGBA")

    # Giant "B" monogram (will display in circular crop on social)
    # Use Bricolage Bold at massive size
    monogram_size = 620
    font_mono = ImageFont.truetype(f"{FONTS}/BricolageGrotesque-Bold.ttf", monogram_size)
    bbox = draw.textbbox((0, 0), "B", font=font_mono)
    bw, bh = bbox[2] - bbox[0], bbox[3] - bbox[1]
    # Center optical, compensating baseline
    bx = (W - bw) // 2 - bbox[0]
    by = (H - bh) // 2 - bbox[1] - 30  # nudge up to balance with wordmark below

    # Shadow for depth
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.text((bx + 6, by + 10), "B", font=font_mono, fill=(0, 0, 0, 140))
    shadow = shadow.filter(ImageFilter.GaussianBlur(8))
    img.paste(shadow, (0, 0), shadow)
    draw = ImageDraw.Draw(img, "RGBA")

    # Main B — white with lagoon accent dot for the bowl
    draw.text((bx, by), "B", font=font_mono, fill=TYPE_WHITE)

    # Lagoon accent dot — bottom-right of the B (signature touch)
    dot_r = 28
    dot_cx = bx + bw + 10
    dot_cy = by + bh - 80
    # Glow
    for r in range(dot_r + 30, dot_r, -2):
        alpha = max(0, 60 - (r - dot_r) * 2)
        draw.ellipse([dot_cx - r, dot_cy - r, dot_cx + r, dot_cy + r],
                     fill=(34, 211, 238, alpha))
    draw.ellipse([dot_cx - dot_r, dot_cy - dot_r, dot_cx + dot_r, dot_cy + dot_r],
                 fill=LAGOON)

    # Wordmark below — small, centered, only visible if not heavily cropped
    font_brand = ImageFont.truetype(f"{FONTS}/BricolageGrotesque-Bold.ttf", 64)
    wmark = "bookeasy"
    wbbox = draw.textbbox((0, 0), wmark, font=font_brand)
    ww = wbbox[2] - wbbox[0]
    draw.text(((W - ww) // 2, H - 200), wmark, font=font_brand, fill=TYPE_WHITE)

    # Maohi chevrons — subtle, at the very bottom
    maohi_chevrons(img, x=(W - 300) // 2, y=H - 90, width=300, opacity=22)

    out = f"{OUT_DIR}/profile-square.jpg"
    img.save(out, "JPEG", quality=92, optimize=True, progressive=False)
    print(f"✓ Profile: {out} ({os.path.getsize(out) / 1024:.1f} KB)")


# ════════════════════════════════════════════════════════════
# 2. FACEBOOK COVER — 1640x856
# ════════════════════════════════════════════════════════════
def make_facebook_cover():
    W, H = 1640, 856
    img = Image.new("RGB", (W, H), INK_BG_MID)
    vertical_gradient(img, INK_BG_TOP, INK_BG_MID, INK_BG_DEEP)

    # Lagoon glow on the right side (where calendar card was in OG)
    lagoon_glow(img, int(W * 0.72), H // 2, max_r=520, intensity=0.16)
    # Soft blue glow on the left (behind headline)
    glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow_layer)
    for r in range(420, 100, -10):
        alpha = int(8 + (420 - r) * 0.14)
        gdraw.ellipse([240 - r, 380 - r, 240 + r, 380 + r],
                      fill=(0, 102, 255, min(alpha, 22)))
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(22))
    img.paste(glow_layer, (0, 0), glow_layer)

    dot_grid(img, opacity=10, step=32)

    draw = ImageDraw.Draw(img, "RGBA")

    # Typography
    font_h1   = ImageFont.truetype(f"{FONTS}/BricolageGrotesque-Bold.ttf", 128)
    font_sub  = ImageFont.truetype(f"{FONTS}/InstrumentSans-Regular.ttf", 36)
    font_chip = ImageFont.truetype(f"{FONTS}/GeistMono-Bold.ttf", 18)
    font_brand= ImageFont.truetype(f"{FONTS}/BricolageGrotesque-Bold.ttf", 42)
    font_mono = ImageFont.truetype(f"{FONTS}/GeistMono-Regular.ttf", 20)
    font_cta  = ImageFont.truetype(f"{FONTS}/BricolageGrotesque-Bold.ttf", 32)

    LEFT_PAD = 110
    TOP_PAD = 90

    # Brand wordmark
    draw.text((LEFT_PAD, TOP_PAD), "Book", font=font_brand, fill=TYPE_WHITE)
    book_bbox = draw.textbbox((0, 0), "Book", font=font_brand)
    draw.text((LEFT_PAD + (book_bbox[2] - book_bbox[0]), TOP_PAD), "Easy",
              font=font_brand, fill=CYAN_BRAND)

    # Locale pill
    tag_text = "POLYNÉSIE FRANÇAISE"
    tbbox = draw.textbbox((0, 0), tag_text, font=font_chip)
    tw, th = tbbox[2] - tbbox[0], tbbox[3] - tbbox[1]
    brand_w = draw.textbbox((0, 0), "BookEasy", font=font_brand)[2]
    tag_x1 = LEFT_PAD + brand_w + 28
    tag_x2 = tag_x1 + tw + 64
    tag_y1 = TOP_PAD + 12
    tag_y2 = tag_y1 + th + 18
    draw.rounded_rectangle([tag_x1, tag_y1, tag_x2, tag_y2], radius=22,
                           fill=(255, 255, 255, 18),
                           outline=(255, 255, 255, 55), width=1)
    dot_x = tag_x1 + 18
    dot_y = tag_y1 + (tag_y2 - tag_y1) // 2
    for r in range(8, 4, -1):
        draw.ellipse([dot_x - r, dot_y - r, dot_x + r, dot_y + r],
                     fill=(34, 197, 94, max(0, 25 - r * 2)))
    draw.ellipse([dot_x - 5, dot_y - 5, dot_x + 5, dot_y + 5], fill=(34, 197, 94))
    draw.text((tag_x1 + 36, tag_y1 + 8), tag_text, font=font_chip, fill=TYPE_WHITE)

    # Eyebrow
    eyebrow = "RÉSERVATION EN LIGNE  ·  POLYNÉSIE"
    draw.text((LEFT_PAD, 270), eyebrow, font=font_chip, fill=LAGOON)

    # H1 — 2 lines
    draw.text((LEFT_PAD, 310), "Réservez.", font=font_h1, fill=TYPE_WHITE)
    draw.text((LEFT_PAD, 450), "Sans appeler.", font=font_h1, fill=TYPE_WHITE)

    # Subtitle
    draw.text((LEFT_PAD, 610), "Coiffeurs · Spas · Bien-être · Esthétique",
              font=font_sub, fill=TYPE_DIM)
    draw.text((LEFT_PAD, 656), "Partout en Polynésie française, 24h/24.",
              font=font_sub, fill=TYPE_DIM)

    # Domain
    draw.text((LEFT_PAD, 730), "bookeasy.me", font=font_brand, fill=LAGOON)

    # Right side — Maohi chevrons motif (decorative panel)
    # Build a tall chevron column on the far right
    right_x = W - 340
    right_y = 200
    chevron_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cdraw = ImageDraw.Draw(chevron_layer)
    CW, CH = 32, 14
    rows = 24
    cols = 7
    for row in range(rows):
        y_off = right_y + row * (CH + 6)
        x_off = right_x + (row % 2) * (CW // 2)
        for col in range(cols):
            cx = x_off + col * CW
            opacity = 35 + (row % 3) * 8
            cdraw.line(
                [(cx, y_off + CH), (cx + CW // 2, y_off), (cx + CW, y_off + CH)],
                fill=(103, 232, 249, opacity),
                width=2,
            )
    chevron_layer = chevron_layer.filter(ImageFilter.GaussianBlur(0.4))
    img.paste(chevron_layer, (0, 0), chevron_layer)
    draw = ImageDraw.Draw(img, "RGBA")

    # Trust badge bottom-right
    trust_top = "+ RAPIDE QU'UN APPEL"
    trust_bot = "Confirmation instantanée"
    tt_box = draw.textbbox((0, 0), trust_top, font=font_chip)
    tb_box = draw.textbbox((0, 0), trust_bot, font=font_mono)
    tt_w = tt_box[2] - tt_box[0]
    tb_w = tb_box[2] - tb_box[0]
    draw.text((W - 110 - tt_w, H - 110), trust_top, font=font_chip, fill=LAGOON)
    draw.text((W - 110 - tb_w, H - 78), trust_bot, font=font_mono, fill=TYPE_DIM)

    out = f"{OUT_DIR}/facebook-cover.jpg"
    img.save(out, "JPEG", quality=90, optimize=True, progressive=False)
    print(f"✓ FB cover: {out} ({os.path.getsize(out) / 1024:.1f} KB)")


# ════════════════════════════════════════════════════════════
# 3. INSTAGRAM LAUNCH POST — 1080x1080
# ════════════════════════════════════════════════════════════
def make_instagram_launch():
    W = H = 1080
    img = Image.new("RGB", (W, H), INK_BG_MID)
    vertical_gradient(img, INK_BG_TOP, INK_BG_MID, INK_BG_DEEP)

    lagoon_glow(img, W // 2, H // 2 - 100, max_r=480, intensity=0.16)
    dot_grid(img, opacity=10, step=28)

    draw = ImageDraw.Draw(img, "RGBA")

    font_h1    = ImageFont.truetype(f"{FONTS}/BricolageGrotesque-Bold.ttf", 96)
    font_sub   = ImageFont.truetype(f"{FONTS}/InstrumentSans-Regular.ttf", 30)
    font_chip  = ImageFont.truetype(f"{FONTS}/GeistMono-Bold.ttf", 18)
    font_brand = ImageFont.truetype(f"{FONTS}/BricolageGrotesque-Bold.ttf", 38)
    font_cta   = ImageFont.truetype(f"{FONTS}/BricolageGrotesque-Bold.ttf", 32)
    font_eyebrow = ImageFont.truetype(f"{FONTS}/GeistMono-Bold.ttf", 22)

    LEFT_PAD = 90

    # Brand top-left
    draw.text((LEFT_PAD, 80), "Book", font=font_brand, fill=TYPE_WHITE)
    book_bbox = draw.textbbox((0, 0), "Book", font=font_brand)
    draw.text((LEFT_PAD + (book_bbox[2] - book_bbox[0]), 80), "Easy",
              font=font_brand, fill=CYAN_BRAND)

    # Big eyebrow — launch announcement
    eyebrow = "LANCEMENT OFFICIEL"
    draw.text((LEFT_PAD, 260), eyebrow, font=font_eyebrow, fill=LAGOON)

    # Lagoon underline accent
    eb_bbox = draw.textbbox((0, 0), eyebrow, font=font_eyebrow)
    eb_w = eb_bbox[2] - eb_bbox[0]
    draw.rounded_rectangle(
        [LEFT_PAD, 296, LEFT_PAD + eb_w, 300],
        radius=2, fill=LAGOON,
    )

    # H1
    draw.text((LEFT_PAD, 340), "Réservez.", font=font_h1, fill=TYPE_WHITE)
    draw.text((LEFT_PAD, 450), "Sans appeler.", font=font_h1, fill=TYPE_WHITE)

    # Subtitle
    draw.text((LEFT_PAD, 600), "Coiffeurs · Spas · Bien-être",
              font=font_sub, fill=TYPE_DIM)
    draw.text((LEFT_PAD, 638), "Esthétique · Massages · Soins",
              font=font_sub, fill=TYPE_DIM)

    # CTA pill
    cta_text = "Réserver maintenant"
    cta_arrow = "→"
    cbox = draw.textbbox((0, 0), cta_text, font=font_cta)
    cw, chh = cbox[2] - cbox[0], cbox[3] - cbox[1]
    abox = draw.textbbox((0, 0), cta_arrow, font=font_cta)
    aw = abox[2] - abox[0]
    pill_pad_x = 36
    pill_gap = 22
    pill_w = cw + aw + pill_pad_x * 2 + pill_gap
    pill_h = 84
    pill_x = LEFT_PAD
    pill_y = 760

    # Lagoon glow shadow
    shadow = Image.new("RGBA", (pill_w + 60, pill_h + 60), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle([30, 30, pill_w + 30, pill_h + 30],
                            radius=pill_h // 2, fill=(34, 211, 238, 100))
    shadow = shadow.filter(ImageFilter.GaussianBlur(20))
    img.paste(shadow, (pill_x - 30, pill_y - 15), shadow)
    draw = ImageDraw.Draw(img, "RGBA")

    # Pill body
    draw.rounded_rectangle([pill_x, pill_y, pill_x + pill_w, pill_y + pill_h],
                           radius=pill_h // 2, fill=LAGOON)
    draw.rounded_rectangle(
        [pill_x + 2, pill_y + 2, pill_x + pill_w - 2, pill_y + pill_h // 2],
        radius=pill_h // 2, fill=(167, 243, 255, 75),
    )
    text_y = pill_y + (pill_h - chh) // 2 - cbox[1]
    draw.text((pill_x + pill_pad_x, text_y), cta_text,
              font=font_cta, fill=INK_BG_TOP)
    draw.text((pill_x + pill_pad_x + cw + pill_gap, text_y), cta_arrow,
              font=font_cta, fill=INK_BG_TOP)

    # Domain below
    draw.text((LEFT_PAD, pill_y + pill_h + 22), "bookeasy.me",
              font=ImageFont.truetype(f"{FONTS}/GeistMono-Regular.ttf", 24),
              fill=TYPE_MUTED)

    # Maohi chevrons — bottom-right decorative
    maohi_chevrons(img, x=W - 320, y=H - 130, width=240, opacity=28)

    out = f"{OUT_DIR}/instagram-launch.jpg"
    img.save(out, "JPEG", quality=92, optimize=True, progressive=False)
    print(f"✓ IG launch: {out} ({os.path.getsize(out) / 1024:.1f} KB)")


if __name__ == "__main__":
    print("Generating BookEasy social assets...\n")
    make_profile()
    make_facebook_cover()
    make_instagram_launch()
    print("\n✅ All assets ready in public/social/")
