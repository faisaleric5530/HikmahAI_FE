# Sketchbox Design System & Style Guide

> **Project**: Next.js 13.2.4 e-commerce platform (Balloon Customer / Archipelago AE)
> **Framework**: Next.js + TypeScript  
> **CSS Preprocessor**: SCSS (via `sass` package)  
> **UI Libraries**: Bootstrap 5.3.2, react-bootstrap, reactstrap, slick-carousel  
> **Internationalization**: react-i18next + i18next (Arabic/English, RTL support)  
> **State**: React Context API  
> **Form**: Formik + Yup  
> **Animations**: CSS keyframes  
> **Icons**: react-icons, inline SVGs  

---

## 1. Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary Green** | `#00D34F` | CTAs, hover states, active nav links, scrollbar thumb, accent buttons |
| **Primary Red** | `#f92323` | Theme accent, sale banners, cashback cards, error states, delete/remove actions |
| **Dark Red** | `#d60000` | Validation errors, checked checkbox background |
| **Pure Black** | `#000000` | Footer background, dark buttons, register/create CTA backgrounds |
| **Rich Black** | `#050C17` | Dark section backgrounds (landing, about, contact dark sections) |
| **Deep Dark** | `#131313` | Text on light backgrounds, dark buttons, borders |
| **Near Black** | `#171719` | Primary text color, product titles, headings |
| **Pure White** | `#ffffff` | Cards, backgrounds, text on dark |
| **Off White** | `#f5f2ed` | Page backgrounds (orders, payments, accounts), form input bg |
| **Light Gray** | `#fbfbfb` | Footer content background |
| **Warm Gray** | `#f3f3f3` | Tip/hire section backgrounds |
| **Mid Gray** | `#555555` | Sort-by text, secondary text |
| **Gray** | `#333333` | Filter text, secondary headings |
| **Gray Text** | `#828282` | Descriptions, paragraph text |
| **Lighter Gray** | `#cacaca` | Input placeholder |
| **Soft Red** | `#f92323ba` | Calendar hover state |
| **Blue** | `#1087ff` | Calendar active date |
| **Navy** | `#051b44` | Calendar text color |
| **Status Orange** | `#ffa800` | "On the way" order status |
| **Status Green** | `#60d642` | "Delivered" order status |
| **Dark Blue** | `#0b1931` | Vision section hover |
| **Cyan** | `#00c2dd` | Mission section hover |
| **Google Button** | `#4285f4` | Google sign-in |
| **Facebook Button** | `#4267b2` | Facebook sign-in |

---

## 2. Typography - Font Families

### 2.1 Font Import Pattern
```scss
@import url("https://fonts.googleapis.com/css2?family=FontName");
@import url("https://fonts.googleapis.com/css2?family=FontName:wght@100;200;300;400;500;600;700&display=swap");
@import url('https://fonts.googleapis.com/css2?family=Alexandria:wght@100..900&family=IBM+Plex+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap');
```

### 2.2 Font Usage Map

| Font | Weight(s) Used | Usage Context |
|------|---------------|---------------|
| **Outfit** | 400, 500, 600, 700 | Global reset (`*`), cards, general body text |
| **Poppins** | 300, 400, 500, 600, 700 | Paragraphs, descriptions, search input, flip-card details |
| **Montserrat** | 400, 500, 600, 700, `montserrat-medium`, `montserrat-regular` | Primary headings, section headers, product titles, footer, accordions, catering items |
| **Inter** | 400, 500, 600, 700 | Filters, sorting, form labels, prices, ratings, progress bars, photographer info, descriptions, calendar text, pagination |
| **Alexandria** | bold | Navbar, dropdown toggles, home page (RTL-friendly) |
| **Nunito** | 600, 700 | City selection labels, flag display |
| **Public Sans** | 400, 600, 700 | Notification components |
| **Times New Roman** | 700 | Banner special text |
| **IBM Plex Sans** | various | Alternative sans-serif |

### 2.3 Common Font Declarations
```scss
font-family: "Montserrat";
font-family: "Inter";
font-family: "Poppins";
font-family: "Outfit";
font-family: "Alexandria", sans-serif;
font-family: "Times New Roman";
font-family: "Public Sans", sans-serif;
font-family: "Nunito";
```

### 2.4 Common Typography Patterns

| Property | Pattern |
|----------|---------|
| **Font Style** | `font-style: normal;` (always explicit) |
| **Font Weight** | `font-weight: 400;` (body), `500` (medium), `600` (semi-bold), `700` (bold) |
| **Letter Spacing** | `letter-spacing: 0.01em;` (most common), `0.03em`, `0.05em`, `0.12px`, `0.14px` |
| **Line Height** | `line-height: 120%;`, `line-height: 140%;`, `line-height: 160%;`, `line-height: normal;` |
| **Text Transform** | `text-transform: uppercase;`, `text-transform: capitalize;`, `font-variant: all-small-caps;` |

### 2.5 Section Heading Pattern (Repeating)

```scss
font-family: "Montserrat";
font-style: normal;
font-weight: 600;
font-size: 40px;
line-height: 49px;
letter-spacing: 0.01em;
font-variant: all-small-caps;
color: #171719;
```

---

## 3. Global Styles (`src/styles/index.scss`)

### 3.1 Import Chain
```scss
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Outfit");
@import "../assets/fonts/font.css";
@import "./form.scss";
```

### 3.2 Global Resets
```scss
* {
  -webkit-user-drag: none;
  user-select: none;
}

html {
  scroll-behavior: smooth !important;
}

body {
  margin: 0;
  padding: 0;
  font-family: "Montserrat" !important;
}
```

### 3.3 Custom Scrollbar
```scss
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-thumb {
  background: #00D34F;
  border-radius: 10px;
}
::-webkit-scrollbar-track {
  background: rgb(77, 75, 75);
  border-radius: 10px;
}
```

### 3.4 Utility Classes
```scss
.btn-fresh           // border: none; outline: none; background: transparent;
.font_size_14        // font-size: 14px !important;
.font_weight_400     // font-weight: 400 !important;
.font_weight_500     // font-weight: 500 !important;
.theme_text_color    // color: #f92323 !important;
.w_10                // width: 10% !important;
.w_20                // width: 20% !important;
.w_80                // width: 80% !important;
.w_90                // width: 90% !important;
.form-control:focus  // box-shadow: none;
```

---

## 4. SCSS Architecture & Naming Conventions

### 4.1 File Structure
```
src/
  styles/
    index.scss          // Global styles (imports form.scss, fonts, utilities)
    form.scss           // Form-specific styles
  components/
    ComponentName/
      ComponentName.tsx
      ComponentName.scss
  pages/
    section-name/
      index.tsx
      index.scss
```

### 4.2 Naming Convention
- **BEM-inspired** with kebab-case + camelCase mix
- Examples: `.filter_header_flex_main`, `.product_review_card_img`, `.catering-item-heading`, `.order_card_container`
- Component-scoped classes prefixed with component context (avoid global leakage)
- Each component SCSS file is imported **inside** the component TSX file: `import "./ComponentName.scss";`

### 4.3 Nested SCSS (standard pattern)
```scss
.parent-class {
  property: value;
  .child-class {
    property: value;
    img { width: 100%; }
  }
  &:hover, &:active {
    color: #00D34F !important;
  }
  &::after {
    content: none !important;
  }
}
```

---

## 5. Component Style Patterns

### 5.1 Navbar (`Header.scss`, `TransparentHeader.scss`)

```scss
.navbar {
  background-color: rgba(0, 0, 0, 0.2);           // TransparentHeader: transparent
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: white !important;
  padding: 0 5rem !important;
  position: fixed;
  top: 0;
  width: '100%';
  z-index: 1000;
  font-family: "Alexandria";
}
```

### 5.2 Dropdown / Language Switcher
```scss
.myDropdownToggle {
  background: transparent !important;
  color: white !important;
  border: none !important;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.3rem !important;
  font-family: "Alexandria", sans-serif;
  font-weight: bold !important;
  &:hover, &:active { color: #00D34F !important; }
}

.myDropdownMenu-rtl {
  text-align: right;
  direction: rtl;
}
```

### 5.3 Buttons

**Green Primary (`#00D34F`)**:
```scss
.joinBtn, .homeUpArrowBtn, .sendBtn {
  background-color: #00D34F !important;
  &:hover {
    background-color: transparent !important;
    color: white !important;
    border: 1px solid white !important;
  }
}
```

**White outlined**:
```scss
.contactBtn {
  background-color: white !important;
  &:hover {
    background-color: transparent !important;
    color: white !important;
    border: 1px solid white !important;
  }
}
```

**Save / Primary Action (Black)**:
```scss
.save_btn, .create-btn, .check_out_btn {
  background: #000000 !important;
  border-radius: 8px !important;
  color: #fff !important;
  padding: 5px 7px !important;
  text-decoration: none !important;
}
```

**Cancel / Secondary (White with border)**:
```scss
.cancel_btn {
  background: #ffffff !important;
  border: 1px solid #131313 !important;
  border-radius: 8px !important;
  color: #131313 !important;
  padding: 5px 7px !important;
}
```

**Red CTA**:
```scss
background: #f92323;
padding: 15px 40px;
color: #fff;
font-weight: 600;
font-size: 17px;
line-height: 120%;
font-variant: all-small-caps;
border-radius: 50px;
```

**Landing Page Button**:
```scss
.landBtn {
  border: 1px solid white !important;
  color: white;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem !important;
}
```

### 5.4 Product Card (`Good.scss`) - Flip Animation
```scss
.filp-card { perspective: 1000px; }
.flip-card-inner {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}
.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}
.flip-card-back {
  backface-visibility: hidden;
  background: #f2f2f2;
  transform: rotateY(180deg);
}
```

### 5.5 Image Patterns
```scss
img, .order_img, .good-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px; // or 5px, 50%
}
```

### 5.6 Cards & Containers
```scss
.card_section, .payment_card {
  background: #ffffff;
  border-radius: 16px;
  padding: 30px 20px;
}
```

### 5.7 Backdrop / Overlay
```scss
.backdrop {
  animation: showIn forwards 0.2s ease-in-out;
  background: rgba(0, 0, 0, 0.25);
  -webkit-backdrop-filter: blur(5.5px);
  backdrop-filter: blur(5.5px);
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  z-index: 1;
}
```

---

## 6. Form Styles (`src/styles/form.scss`)

```scss
.form-label {
  font-weight: 500;
  font-size: 12px;
  line-height: 15px;
  color: #413d3d;
  margin-bottom: 10px;
}
.custom_form_control, .custom_form_select {
  border: 1px solid #f5f2ed;
  background-color: #f5f2ed;
  border-radius: 8px;
  padding: 15px 15px;
  color: #413d3d;
}
.input-group-text {
  border: 1px solid #f5f2ed;
  background: #f5f2ed;
  border-radius: 8px;
  padding: 15px 15px;
  color: #413d3d;
}
```

---

## 7. Footer Pattern

```scss
footer .footer_content_main {
  background-color: black;
}
.footer_social_media_main {
  background-color: #000;
  padding: 46px;
  color: #fff;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex-wrap: wrap;
}
.footer_content_main .footer_content_list .list_header {
  font-weight: 600;
  font-size: 16px;
  color: #000000;
  text-transform: uppercase;
}
.footer_content_main .footer_content_list .list_text {
  font-weight: 400;
  font-size: 14px;
  letter-spacing: 0.01em;
  a { color: #626262; &:hover { text-decoration: underline !important; } }
}
```

---

## 8. Animations & Keyframes

### 8.1 Fade In/Out (Calendar Popup)
```scss
@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes fadeOut {
  from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  to   { opacity: 0; transform: translate(-50%, -50%) scale(0); }
}
```

### 8.2 Scroll-to-Top
```scss
@keyframes topShow {
  0%   { opacity: 0; transform: scale(0); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes topFade {
  0%   { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0); }
}
.to-top {
  background: #ff0000;
  border-radius: 50%;
  min-width: 55px;
  min-height: 55px;
  box-shadow: 0px 4px 10px rgba(95, 3, 3, 0.38);
  position: fixed;
  z-index: 999;
  bottom: 25px;
  right: 25px;
}
```

### 8.3 Notification Bell Ring
```scss
@keyframes ring {
  0%   { transform: rotate(0); }
  1%   { transform: rotate(30deg); }
  // ... oscillating rotation
  43%  { transform: rotate(0); }
  100% { transform: rotate(0); }
}
.ringing {
  animation: ring 4s 0.7s ease-in-out infinite;
  transform-origin: 50% 4px;
}
```

### 8.4 Slide Background (Landing Button)
```scss
@keyframes slideBackground {
  0%   { background: linear-gradient(to left, white 50%, transparent 50%); background-size: 200% 100%; background-position: left bottom; }
  100% { background: linear-gradient(to left, white 100%, transparent 100%); background-position: 100% 0; }
}
```

---

## 9. RTL / Internationalization Patterns

### 9.1 RTL Classes
```scss
.rtl {
  direction: rtl;
  text-align: right;
  font-family: 'Diodrum Arabic', sans-serif;
}

[dir="rtl"] .slick-next {
  left: auto !important;
}

.myDropdownMenu-rtl { text-align: right; direction: rtl; }
.myDropdownToggle-rtl { direction: rtl; }
.rtl-menu { left: 0; right: auto; }
```

### 9.2 RTL Conditional Classes in JSX
```tsx
className={`form-check ${i18n.dir() === "rtl" ? "pe-3" : ""}`}
className={`form-check-input ${i18n.dir() === "rtl" ? "float-none" : ""}`}
className={`form_check_label text-truncate text-capitalize ${i18n.dir() === "rtl" ? "float-start" : ""}`}
```

### 9.3 Margin-Inline for RTL Support
```scss
margin-inline-start: 15px;
margin-inline-end: 15px;
padding-inline: 5px;
padding-inline-start: 80px;
```

---

## 10. Responsive Breakpoints

| Breakpoint | Device |
|------------|--------|
| `320px - 600px` | Mobile devices |
| `max-width: 480px` | Small phones |
| `max-width: 576px` | Mobile |
| `max-width: 768px` | Tablets |
| `481px - 768px` | iPads / Tablets |
| `max-width: 992px` | Medium screens |
| `992px - 1440px` | Laptops / Desktops |
| `768px - 1024px` | Small laptops |
| `1025px - 1200px` | Large desktops |
| `1201px - 2560px` | Extra large screens |
| `min-width: 1440px` | Large screens |
| `min-width: 1900px` | Ultra-wide screens |

**Standard mobile query**:
```scss
@media (min-width: 320px) and (max-width: 600px) { ... }
```

---

## 11. Slick Carousel Customization

```scss
.slick-next, .slick-prev {
  z-index: 10;
  transition: 0.5s all ease;
  top: 45% !important;
  opacity: 0.3 !important;
  height: 50px !important;
  width: 30px !important;
}
.slick-next::before, .slick-prev::before { content: none !important; }
.slick-next:hover, .slick-prev:hover { opacity: 1 !important; }

// Arrow SVG backgrounds (inline base64)
.slick-prev { 
  left: 15px !important;
  background: url("data:image/svg+xml,...") no-repeat center !important;
}
.slick-next { 
  right: 18px !important;
  background: url("data:image/svg+xml,...") no-repeat center !important;
}
```

---

## 12. Order Status Indicators

```scss
.orders_status {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-block;
}
.on_the_way_circle  { background-color: #ffa800; }
.delivered_circle   { background: #60d642; }
.cancelled_circle   { background: #f92323; }
```

---

## 13. Calendar Styling (react-calendar)

```scss
.react-calendar {
  border: none !important;
  .react-calendar__navigation__label__labelText {
    font-family: "Inter";
    font-weight: bolder;
    font-size: 23px;
    color: #051b44;
  }
  abbr, .react-calendar__tile {
    font-weight: 500;
    font-family: "Inter";
    color: #051b44;
  }
  .react-calendar__tile--active { background: #1087ff; abbr { color: #fff; } }
  .react-calendar__tile--now { background: none; color: #f92323; }
  .react-calendar__tile:enabled:hover { background-color: #f92323ba; }
}
```

---

## 14. Page Background Patterns

| Page/Component | Background |
|----------------|------------|
| **Landing / Hero** | Transparent overlay on image, gradient-overlay |
| **About dark sections** | `#050c17` |
| **Contact dark sections** | `#050c17` |
| **Contact form** | `black` |
| **Order / Account / Payment pages** | `#f5f2ed` |
| **Cards** | `#ffffff` border-radius: 16px |
| **Footer** | `black` |
| **Client card container** | `#f5f2ed` |
| **Landing about** | `black` |
| **Tip section** | `#f3f3f3` |
| **Product detail page** | transparent / white |
| **Grow icons** | `#050C17` |

---

## 15. Common Layout Spacing Patterns

```scss
// Large dark section headers
padding: 5rem 20rem;

// Content sections
padding: 0 10rem;

// About cards
padding: 3rem;

// Footer
padding: 46px;

// Mobile/tablet adjustments
padding: 5rem 4rem;     // 768px
padding: 5rem 2rem;     // 576px
padding: 5rem 3rem;     // 480px
```

---

## 16. Glassmorphism & Blur Effects

```scss
// Navbar blur
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);

// Backdrop blur (overlay)
backdrop-filter: blur(5.5px);

// Image overlay text
background: rgba(255, 255, 255, 0.2);
backdrop-filter: blur(5px);

// Profile icon overlay
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(5px);
border-radius: 50px;

// Catering item overlay
backdrop-filter: blur(4px);
```

---

## 17. Accordion Customization

```scss
.accordion-item {
  border: none;
  border: 0.5px solid #131313;
  background: #f4f6f8;
  margin-bottom: 16px;
  border-radius: 5px;
}
.accordion-button {
  font-family: "Montserrat";
  font-size: 14px;
  font-weight: 500;
  &:focus { box-shadow: none; }
  &::after { background-image: url("../../assets/images/add1-square.svg"); }
  &:not(.collapsed)::after { background-image: url("../../assets/images/minus-square.svg"); }
}
```

---

## 18. Text Overflow / Ellipsis Pattern

```scss
height: 2em;
overflow: hidden;
white-space: nowrap;
text-overflow: ellipsis;
width: 100%;
```

---

## 19. Key Component Architecture Pattern

### 19.1 Component Structure
```
ComponentName/
  ComponentName.tsx       // TSX with import "./ComponentName.scss"
  ComponentName.scss      // Scoped SCSS
```

### 19.2 Component SCSS Import
```tsx
import "./ComponentName.scss";
```

### 19.3 Layout Wrapper
Pages use Bootstrap grid system: `container > row > col-*`

---

## 20. Shadow Patterns

```scss
// Dropdown shadow
box-shadow: 0px 0px 10px 5px rgba(30, 30, 30, 0.12);

// Profile menu shadow
box-shadow: 0px 8px 20px rgba(30, 30, 30, 0.12);

// Scroll-to-top button shadow
box-shadow: 0px 4px 10px rgba(95, 3, 3, 0.38);
```

---

## 21. Skeleton Loading Pattern

```tsx
import Skeleton from "react-loading-skeleton";

// Product grid skeleton
<>
  {[...Array(12)].map((el, index) => (
    <div className="col-12 col-md-6 col-lg-4 mb-2" key={`skeleton-items-${index}`}>
      <div className="px-2">
        <Skeleton height="350px" />
        <Skeleton height="75px" className="mt-2" />
      </div>
    </div>
  ))}
</>
```

---

## 22. Page Meta / SEO Pattern

```tsx
<Head>
  <title>SKETCHBOX</title>
  <meta name="description" content="..." />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="/brand-icon.ico" />
  <meta property="og:title" content="..." />
  <meta property="og:description" content="..." />
  <meta property="og:image" content="/brand-image.jpg" />
  <meta property="og:url" content="https://..." />
  <meta property="og:type" content="website" />
</Head>
```

---

## 23. Filter Component Pattern

```scss
.filter_main_div {
  border-right: 1px solid #ccbfde;
  .filter_header_flex_main {
    padding: 12px 16px;
    border-bottom: 1px solid #ccbfde;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .filter_range_slidder {
    padding: 12px 16px;
    border-bottom: 1px solid #ccbfde;
  }
  .form-check-input[type="checkbox"] { border: 1px solid #131313; }
  .form-check-input:checked { background-color: #d60000; border-color: #d60000 !important; }
}
```

---

## 24. Language Detection & Conditional Rendering

```tsx
const { i18n } = useTranslation();
// Usage in classes:
i18n.dir() === "rtl" ? "pe-2" : ""
// Bootstrap RTL direction on html tag is managed via i18n
```

---

## 25. Infinite Scroll Pattern

```scss
.infinite-scroll-component {
  display: flex;
  flex-wrap: wrap;
}
```

---

## 26. Image Handling Patterns

```scss
// Standard image sizing
width: 100%;
height: 100%;
object-fit: cover;
border-radius: 8px;

// Profile image (circular)
width: 250px;
height: 250px;
border-radius: 500px;
object-fit: cover;

// Small icon sizing
width: 24px;
height: 24px;

// Photographer avatar
width: 120px;
height: 120px;
border-radius: 50%;
object-fit: cover;

// Client testimonial avatar
width: 48px;
height: 48px;
border-radius: 50%;
```

---

## 27. Environment & Config

```scss
// Environment variables (from .env file)
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

**API Service Pattern** (`src/api/`):
```ts
import axios from "axios";
const API_BASE = process.env.NEXT_PUBLIC_API_URL;
```

---

## 28. Toast Notification Config

```tsx
<ToastContainer autoClose={2500} theme="colored" />
```

---

## 29. Links & Navigation

```scss
// Link hover pattern
a { color: #626262; &:hover { text-decoration: underline !important; } }
// Button-style links
a { text-decoration: none; }

// Font sizes for nav links
// Desktop (992px+): small
// Large screens (1900px+): medium
```

---

## 30. Code Conventions Summary

| Rule | Convention |
|------|-----------|
| **String quotes** | SCSS: double quotes (`"`), TSX/JSX: double quotes |
| **!important usage** | High - used extensively for overrides (Bootstrap) |
| **CSS units** | `px` for fixed, `rem` for spacing, `%` for fluid, `vh` for viewport |
| **Color format** | Hex (`#RRGGBB`) exclusively |
| **Z-index scale** | 1 (backdrop), 10-11 (calendar), 999 (to-top), 1000 (navbar) |
| **Animation duration** | `0.2s` (fast), `0.3s` (medium), `0.5s`-`0.6s` (slow), `4s` (bell ring) |
| **Easing** | `ease-in-out`, `ease`, `cubic-bezier(0.4, 0, 0.2, 1)` |
| **File naming** | PascalCase for components, kebab-case for assets/images |
| **CSS selector depth** | Deeply nested (3-5 levels common) |
| **Transition shorthand** | `property duration timing-function` (e.g., `transition: 0.3s all ease`) |
| **Order status circles** | 16x16px, border-radius: 50%, inline-block |

---

## Appendices

### A. Third Party Dependencies (relevant to styles)
```
bootstrap ^5.3.2
sass ^1.59.2
slick-carousel ^1.8.1
react-slick ^0.29.0
react-calendar ^4.2.1
react-loading-skeleton ^3.2.0
react-toastify ^9.1.3
react-icons ^5.0.1
react-images ^1.2.0-beta.7
```

### B. Custom Font File Loading
```scss
@import "../assets/fonts/font.css";
```
Custom local fonts are stored in `src/assets/fonts/`.

### C. Global CSS Imports (in `_app.tsx` order)
```tsx
import "@/styles/index.scss";          // Custom globals + form.scss
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "react-loading-skeleton/dist/skeleton.css";
import "react-calendar/dist/Calendar.css";
import "react-toastify/dist/ReactToastify.css";
```
