# Local fonts

These variable fonts are served through `next/font/local` and included in the
static export. Building and reading the website require no external font service.

- Noto Sans KR: [Google Fonts source](https://github.com/google/fonts/tree/main/ofl/notosanskr),
  weight 100–900, [SIL OFL](noto-sans-kr-OFL.txt).
- Inter: [Google Fonts source](https://github.com/google/fonts/tree/main/ofl/inter),
  weight 100–900 and optical size, [SIL OFL](inter-OFL.txt).

Downloaded on 2026-09-09. The original variable TTF files were encoded as WOFF2
with fontTools 4.64.0 and Brotli 1.2.0. All glyphs were preserved, so Korean content
changes do not require regenerating a text-specific subset.
