---
name: Structural Precision
colors:
  surface: '#faf9f9'
  surface-dim: '#dbdad9'
  surface-bright: '#faf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e8'
  surface-container-highest: '#e3e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#42474f'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#727780'
  outline-variant: '#c2c7d1'
  surface-tint: '#2e6097'
  primary: '#003058'
  on-primary: '#ffffff'
  primary-container: '#06477c'
  on-primary-container: '#87b6f2'
  inverse-primary: '#a1c9ff'
  secondary: '#bb0013'
  on-secondary: '#ffffff'
  secondary-container: '#e71520'
  on-secondary-container: '#fffbff'
  tertiary: '#003445'
  on-tertiary: '#ffffff'
  tertiary-container: '#004c63'
  on-tertiary-container: '#45c0ef'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#a1c9ff'
  on-primary-fixed: '#001c37'
  on-primary-fixed-variant: '#09487d'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb4ab'
  on-secondary-fixed: '#410002'
  on-secondary-fixed-variant: '#93000d'
  tertiary-fixed: '#bee9ff'
  tertiary-fixed-dim: '#69d3ff'
  on-tertiary-fixed: '#001f2a'
  on-tertiary-fixed-variant: '#004d65'
  background: '#faf9f9'
  on-background: '#1b1c1c'
  surface-variant: '#e3e2e2'
  deep-navy: '#06477C'
  structural-red: '#ED1C24'
  sky-accent: '#4AC4F3'
  concrete-gray: '#808080'
  foundation-white: '#FFFFFF'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 64px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
  label-md:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  section-gap: 120px
---

## Brand & Style

The design system is engineered for a leading construction and infrastructure firm, emphasizing stability, scale, and technical mastery. The brand personality is authoritative and meticulous, aimed at B2B stakeholders and government entities who prioritize safety and proven expertise.

The design style follows a **Corporate / Modern** aesthetic with **Industrial** undertones. It utilizes a rigorous grid, high-contrast layouts, and a lean toward "Architectural Minimalism." Every visual element should feel "built"—solid, aligned, and intentional. The use of heavy vertical lines and structured content blocks mimics the blueprint of a skyscraper, conveying reliability and monumental progress.

## Colors

The color palette is rooted in industry standards to evoke trust and high-energy productivity. 

- **Deep Navy (#06477C):** The primary anchor. It represents the foundation, integrity, and corporate stability. Use this for primary headers, navigation backgrounds, and primary buttons.
- **Structural Red (#ED1C24):** A high-visibility accent color used sparingly for calls to action, critical indicators, and highlights. It reflects the energy of a construction site.
- **Sky Accent (#4AC4F3):** Used for technical data visualization, icons, or secondary links to provide a modern, digital lift to the heavy navy base.
- **Concrete Gray (#808080):** Used for borders, subtle backgrounds, and secondary text to maintain the industrial theme without overwhelming the eye.

## Typography

This design system uses **Hanken Grotesk** as the primary typeface for its sharp, contemporary, and engineered look. It provides the legibility of a sans-serif with a more technical "grotesque" character that fits construction.

**Space Grotesk** is introduced for labels and technical data. Its geometric and slightly eccentric apertures give a "blueprinted" feel to small-scale information, perfect for technical specifications, project numbers, and metadata.

- **Headlines:** Should be tight and bold. Use `-0.02em` tracking for display sizes to give a dense, powerful appearance.
- **Labels:** Always use Space Grotesk for uppercase utility text to differentiate functional UI from editorial content.

## Layout & Spacing

The layout is based on a **Fixed Grid** system for desktop to maintain a sense of architectural structure and "framed" content.

- **Desktop (1440px+):** 12-column grid with 24px gutters. Wide margins of 64px provide whitespace that emphasizes the scale of project photography.
- **Tablet (768px - 1024px):** 8-column grid with 20px gutters. 
- **Mobile (Under 768px):** 4-column fluid grid with 16px margins.

**Rhythm:** Use an 8px base unit. Section gaps should be generous (120px on desktop) to allow the "heavy" industrial elements room to breathe.

## Elevation & Depth

To maintain the "Solid/Foundational" feel, this design system avoids soft, floating shadows. Instead, it uses **Tonal Layers** and **Bold Outlines**.

- **Z-0 (Base):** White (#FFFFFF) or very light gray.
- **Z-1 (Cards/Containers):** 1px solid border using #808080 at 20% opacity. No shadow.
- **Z-2 (Interaction/Hover):** A subtle, hard shadow (e.g., 4px 4px 0px) in a translucent Navy color can be used for "Brutalist" pops on buttons, but generally, stay flat.
- **Overlays:** Use a semi-transparent Navy (#06477C) at 80% opacity for modal backdrops to keep the brand color dominant even in focus states.

## Shapes

The shape language is **Sharp (0px)**. 

Construction is about precision and structural edges. Rounded corners detract from the feeling of strength and steel. All buttons, input fields, images, and cards must have square corners. 

**Exceptions:** Only circular elements are allowed for specific UI patterns like "Play" buttons on videos or step-indicators in a process map, where the contrast of a perfect circle against a sharp-edged layout creates a strong focal point.

## Components

### Buttons
- **Primary:** Solid Navy background, White text, 0px radius. On hover, background shifts to Structural Red.
- **Secondary:** Transparent background, 2px solid Navy border, Navy text.
- **Tertiary/Ghost:** Navy text with a red underline that expands on hover.

### Input Fields
- Underlined style or full 1px border. Use Concrete Gray for the border color. When focused, the border becomes Navy and 2px thick. Labels should use the `label-caps` typography style.

### Cards
- Projects are showcased in cards with no border-radius. Images should have a subtle desaturation filter that returns to full color on hover. Titles should be overlaid in a Navy block.

### Progress Indicators
- Use the Sky Accent (#4AC4F3) for progress bars and technical loaders to symbolize the "planning/digital" phase of a project.

### Lists
- Use custom bullet points (a small 4px red square) instead of standard dots to reinforce the structural aesthetic.