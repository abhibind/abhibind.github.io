# Portfolio (V3, monochrome cinematic)

Black, white and dark grey. The site alternates dark sections (header, About, Contact, footer) with white / off-white sections (moving band, Work, Services). The menu switches colour automatically with the section under it.

Static site for GitHub Pages. No build step. Upload `index.html`, `styles.css`, `script.js`, `content.js`, `editor.js` and `editor.css`.

## Edit text right on the website (no code)
Add `?edit` to the end of your site link, for example `https://yourname.github.io/portfolio/?edit`.

1. **Click any text** (a heading, a button, a card, a video, the moving band…). A small box opens. Type, then press **Done** (or Enter).
2. **All text** (bottom bar) lists every text on the site, including the hidden ones: the typing lines, form messages and video details. It has a search box.
3. **Publish** saves your changes to GitHub. The live site updates in 1–2 minutes (sometimes up to 10).
   **Download** gives you a new `content.js` to upload to GitHub yourself instead.
4. Switch **Click to edit** off to use the site normally (play videos, open links) without leaving edit mode.

Until you publish, your changes are only in your browser. Only the text changes when you save: the notes and layout of `content.js` stay as they are.
Edit mode changes text and links. To add or remove a video or service, edit `content.js` (see below).

### One-time setup: your GitHub key (so Publish works)
1. Open [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new) (GitHub → Settings → Developer settings → Fine-grained tokens → Generate new token).
2. **Name**: "Portfolio editor". **Expiration**: your choice (for example 1 year).
3. **Repository access**: *Only select repositories*, then pick your website's repository.
4. **Permissions → Repository permissions → Contents**: *Read and write*.
5. Press **Generate token** and copy it (it starts with `github_pat_`).
6. Open your site with `?edit`, press **Sign in**, paste the key. The repository fills in by itself on a `github.io` link. Otherwise type `yourname/your-repo`.

**Is it safe?**
- Visitors who open `?edit` only see a small "Sign in" bar. They cannot change anything on your site.
- Your key is saved only in your own browser and is never added to the website files.
- Don't share the key or paste it on someone else's computer.
- On a shared computer, use ••• → *Forget GitHub key on this browser* when you're done.
- If you lose a device, delete the key on the same GitHub page (it takes a minute). The key can only change the one repository you picked.

## The only file you edit by hand: `content.js`

It is split into 11 numbered parts with notes:

| I want to change… | Part in content.js |
|---|---|
| Name, role, intro, email, "Available for new projects" line | 1. BASIC INFO |
| Colours of the dark / dark grey / off-white / white sections, text colours, fonts | 2. THEME |
| Cursor, smooth scrolling, loading screen, light dust, film grain, mouse light, card tilt, photo look | 3. SETTINGS |
| Header photo, the floating glass cards, the typing panel lines | 4. HEADER |
| The big moving words under the header | 5. MOVING BAND |
| Section titles, menu words, hide a section | 6. SECTIONS |
| About text, numbers, the fading photos | 7. ABOUT |
| Services | 8. SERVICES |
| Videos (add / remove / reorder) | 9. WORKS |
| Contact heading, form labels, messages | 10. CONTACT |
| Social links, footer | 11. SOCIAL & FOOTER |

## Rules so nothing breaks
1. Keep the "quotes" around text.
2. Keep the comma at the end of every line.
3. Lines starting with `//` are notes.
4. Use `true` / `false` to switch things on and off.

## What visitors can do (interactions)
- **Loading screen**: your name and a 000 → 100 counter, then the page opens like a curtain (once per visit).
- **Header**: your photo is black & white; on hover (tap on phones) it opens wider horizontally in full colour while everything around it dims, then closes when the mouse leaves; small stars drift and move away from the mouse; the letters of your name lift near the mouse; the floating cards glide away from the mouse; the "Currently" panel changes its word and types a line.
- **Video covers** are black & white and turn colour on hover (`thumbsBlackAndWhite` in settings).
- **Moving band**: speeds up and leans while scrolling, changes direction when you scroll up, slows down under the mouse.
- **Work**: filter pills with a sliding highlight; cards tilt in 3D with a light reflection; the video plays muted on hover; click to open it in the built-in viewer.
- **About**: photos fade one into the next (click the small bars to jump); the text lights up word by word as you scroll; numbers count up.
- **Services**: folders turn mac-folder blue and open on hover, with a glow that follows the mouse. The floating cards in the header also have frosted blue mac-style folders.
- **Contact**: copy-email button, floating form labels, magnetic buttons.
- Normal mouse scrolling (set `smoothScroll: true` for an extra-soft feel), scroll progress bar, menu that hides on scroll down and returns on scroll up.

Phones and tablets get a simpler, touch-friendly version (no custom cursor, no hover effects). Visitors with "reduce motion" switched on get a calm version.

## Add a video (YouTube)
In `content.js` (part 9, WORKS) copy one `{ ... }` block, paste it below the last one and change:
- `youtube`: the YouTube **link** or the 11-letter ID.
- `thumbnail`: your own cover image, or `""` for YouTube's cover.
- `format`: `"horizontal"` or `"vertical"`.

Each video must be **Public or Unlisted** with **"Allow embedding" ON** in YouTube Studio.

## The video window
- Wide screens: video left, details right. Phones held upright: video on top, details below.
- **Expand video** (or press T) hides the details. Keyboard: Space/K play-pause, ←/→ skip, M mute, F fullscreen, Esc close.

## If a video says "can't be played"
1. **Opened as a file** (`file:///`): YouTube refuses this. Open the site from `http://localhost` (VS Code "Live Server") or your GitHub Pages link.
2. **Embedding is off** in YouTube Studio.
3. **Wrong ID** in `content.js`.
4. **Ad-blocker / privacy extension** blocking YouTube.

## Security limit
The YouTube frame cannot be clicked, so visitors never reach YouTube's buttons or links, and right-click/drag are blocked on videos. The video ID is still inside the page code; no site that uses YouTube can fully hide it.
