// TermProtect logo as inline SVG data URI
// Dark background version (for PDF headers, light contexts)
// Light version (for dark app sidebars)

export const LOGO_SVG_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 60">
  <rect width="320" height="60" rx="6" fill="#1a1a1a"/>
  <!-- Window icon -->
  <rect x="8" y="8" width="44" height="44" rx="4" fill="#1a1a1a" stroke="#FACC15" stroke-width="2"/>
  <line x1="30" y1="8" x2="30" y2="52" stroke="#FACC15" stroke-width="2"/>
  <line x1="8" y1="30" x2="52" y2="30" stroke="#FACC15" stroke-width="2"/>
  <rect x="10" y="10" width="18" height="18" rx="1" fill="#FACC15"/>
  <rect x="32" y="10" width="18" height="18" rx="1" fill="#FFFFFF"/>
  <rect x="10" y="32" width="18" height="18" rx="1" fill="#FFFFFF"/>
  <rect x="32" y="32" width="18" height="18" rx="1" fill="#FACC15"/>
  <!-- TERMPROTECT text -->
  <text x="62" y="32" font-family="Arial,Helvetica,sans-serif" font-size="22" font-weight="bold" fill="#FFFFFF" letter-spacing="1">
    <tspan fill="#FACC15">TERM</tspan><tspan fill="#FFFFFF">PROTECT</tspan>
  </text>
  <!-- Subtitle -->
  <text x="62" y="48" font-family="Arial,Helvetica,sans-serif" font-size="9" fill="#94A3B8" font-style="italic" letter-spacing="1.5">SISTEMAS DE VENTANAS Y PUERTAS</text>
</svg>`;

export const LOGO_SVG_LIGHT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 60">
  <rect width="320" height="60" rx="6" fill="#FFFFFF"/>
  <!-- Window icon -->
  <rect x="8" y="8" width="44" height="44" rx="4" fill="#FFFFFF" stroke="#FACC15" stroke-width="2"/>
  <line x1="30" y1="8" x2="30" y2="52" stroke="#FACC15" stroke-width="2"/>
  <line x1="8" y1="30" x2="52" y2="30" stroke="#FACC15" stroke-width="2"/>
  <rect x="10" y="10" width="18" height="18" rx="1" fill="#FACC15"/>
  <rect x="32" y="10" width="18" height="18" rx="1" fill="#FFFFFF" stroke="#e5e7eb" stroke-width="0.5"/>
  <rect x="10" y="32" width="18" height="18" rx="1" fill="#FFFFFF" stroke="#e5e7eb" stroke-width="0.5"/>
  <rect x="32" y="32" width="18" height="18" rx="1" fill="#FACC15"/>
  <!-- TERMPROTECT text -->
  <text x="62" y="32" font-family="Arial,Helvetica,sans-serif" font-size="22" font-weight="bold" fill="#1e293b" letter-spacing="1">
    <tspan fill="#FACC15">TERM</tspan><tspan fill="#1e293b">PROTECT</tspan>
  </text>
  <!-- Subtitle -->
  <text x="62" y="48" font-family="Arial,Helvetica,sans-serif" font-size="9" fill="#64748b" font-style="italic" letter-spacing="1.5">SISTEMAS DE VENTANAS Y PUERTAS</text>
</svg>`;

// Convert SVG string to data URI for use in <img> tags
export const logoDataUri = (svg) => `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;

export const LOGO_DARK_URI = logoDataUri(LOGO_SVG_DARK);
export const LOGO_LIGHT_URI = logoDataUri(LOGO_SVG_LIGHT);

// Compact icon-only version for sidebar
export const LOGO_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44">
  <rect width="44" height="44" rx="8" fill="#FACC15"/>
  <rect x="3" y="3" width="17" height="17" rx="2" fill="#FACC15"/>
  <rect x="24" y="3" width="17" height="17" rx="2" fill="#FFFFFF"/>
  <rect x="3" y="24" width="17" height="17" rx="2" fill="#FFFFFF"/>
  <rect x="24" y="24" width="17" height="17" rx="2" fill="#FACC15"/>
  <line x1="22" y1="0" x2="22" y2="44" stroke="#161E2B" stroke-width="2"/>
  <line x1="0" y1="22" x2="44" y2="22" stroke="#161E2B" stroke-width="2"/>
</svg>`;

export const LOGO_ICON_URI = logoDataUri(LOGO_ICON_SVG);
