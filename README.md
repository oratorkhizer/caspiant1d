# MiniMed 780G landing page, Caspian Healthcare

A single static page. No build step, no framework, no dependencies. Upload the folder and it works.

## Files
- `index.html` .... the whole page (all CSS and JavaScript are inline)
- `assets/` ....... photographs, favicons, share images, web manifest
- `robots.txt`, `sitemap.xml`, `vercel.json`

## Domain

The site is already configured for **https://caspiant1d.in** as the primary domain, with the
page living at the root. Nothing needs editing before you publish.

Point **caspiant1d.com** at the same host and set it to 301-redirect to `caspiant1d.in`. Do not
serve the same page on both domains without a redirect, or Google will see duplicate content
and split the ranking signal between them. Every good host does this in one setting.

If you later want the page under caspianhealthcare.in as well, do it as a redirect, not a copy.

## Two things you may still want to change

1. **The phone number.** Currently `+91 78937 89514` (Asad). Search for `7893789514`.
2. **The booking link.** Currently `https://www.eka.care/doctor/dr-khizer-1745039245`.

## Where to host it

Anything that serves static files: Vercel, Netlify, Cloudflare Pages, GitHub Pages, or the
`public_html` folder of ordinary shared hosting. Drag the folder in. Nothing to configure.

## What you may NOT put on this page (India)

Two rules bind a doctor's website in India, and both are easy to break by accident:

- **Indian Medical Council (Professional Conduct) Regulations, 2002**, still the operative code.
  No soliciting patients, no patient testimonials or success stories used promotionally, no
  before-and-after patient photographs, no superlatives ("best", "No. 1", "highest success
  rate"), no guarantees. Factual education is permitted. So is publishing your fees.
- **Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954.** Diabetes is a
  scheduled condition, so no "cure", "reverse", or "freedom from diabetes" framing anywhere.

This page was written to sit inside those limits. It states the registration number, publishes
a cost range, avoids superlatives entirely, and says explicitly that the pump is not a cure.
The one thing worth flagging: **do not add patient testimonials or real patient photographs**
to this page later. If you want patient evidence, use de-identified aggregate data presented as
education, not as a success story, and take your own view on it.

## Testing the share preview before you send it to anyone

WhatsApp caches link previews on each device and there is no way to clear that cache. So get
the preview right first, then share. Paste the live URL into:

- https://developers.facebook.com/tools/debug/  (this also refreshes what WhatsApp will fetch)
- https://cards-dev.twitter.com/validator
- https://search.google.com/test/rich-results  (validates the structured data)

## How it was built

- The `<head>` is only 3.3 KB before the stylesheet starts, so WhatsApp's 300 KB
  meta-scraping limit is comfortably safe.
- Two share images ship. `og-square.jpg` (1200x1200) is listed first because a square image
  renders full width on WhatsApp, which is where most of your traffic will come from.
  `og-wide.jpg` (1200x630) is what X, LinkedIn and Slack will use.
- Scroll animations use the native CSS `animation-timeline` property, so there is no
  JavaScript animation loop and nothing to jank on a mid-range Android. Browsers that do not
  support it simply show the content. Everything is disabled under `prefers-reduced-motion`.
- Colour contrast meets WCAG 2.2 AA throughout. The before-and-after glucose slider is a real
  `<input type="range">`, so it works with a keyboard and a screen reader, not just a mouse.
- All 33 FAQ entries are marked up as `FAQPage` structured data, alongside `MedicalWebPage`,
  `MedicalCondition`, `MedicalDevice`, `Physician` and `MedicalClinic`.
- Total page weight is about 1.3 MB including every photograph.

## A note on the medical content

Every clinical figure on the page is referenced in the footer, and the wording deliberately
states the population and sample size rather than the headline alone. The regulatory notice at
the bottom frames the page as patient education by a registered practitioner rather than a
device advertisement, which matters under the Drugs and Magic Remedies Act. Please read that
block before publishing and adjust anything you disagree with.
