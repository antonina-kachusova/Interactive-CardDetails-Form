Interactive Card Details Form — Flex & Positioning
Live Site URL: https://antonina-kachusova.github.io/Interactive-CardDetails-Form/

A small, responsive payment card form built with HTML, CSS (Flexbox + positioning), and vanilla JavaScript.
The script handles live input formatting, front-end validation (including Luhn check), contextual MM/YY/CVC errors, and a friendly submit UX—no backend required.

Features

Layout: columns and form assembled with flexbox, with selective positioning for precise placement.

Responsive: custom breakpoints defined in media.css for phones/tablets.

Card number UX: digit-only input, auto-formatting to #### #### #### ####, stable caret, length limit (16), Luhn validation.

Expiry UX: digit-only MM/YY, auto-tab between fields, field-aware messages (if you’re in YY, year hints appear first), expiry not in the past.

CVC: digit-only, exactly 3 digits (easily adjustable).

Name rules: letters/spaces/hyphens/apostrophes, 2–30 chars.

Live errors: messages appear on input and blur; invalid fields get input.invalid, error containers use .error.visible.

Submit UX: blocks on errors; on success changes button text to “✓ Confirmed” (demo behavior).

Tech stack

HTML5

CSS3 (Flexbox, positioning, media queries)

Vanilla JavaScript (no external deps)
