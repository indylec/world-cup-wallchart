const REGIONAL_INDICATOR_A = 0x1f1e6;
const CODE_POINT_A = "a".charCodeAt(0);

const SPECIAL: Record<string, string> = {
  "gb-eng": "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
  "gb-sct": "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}",
  "gb-wls": "\u{1F3F4}\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}",
};

export function flagEmoji(code: string): string {
  if (!code) return "\u{1F3F3}";
  const lower = code.toLowerCase();
  if (SPECIAL[lower]) return SPECIAL[lower];
  if (lower.length !== 2) return "\u{1F3F3}";
  const a = lower.charCodeAt(0) - CODE_POINT_A;
  const b = lower.charCodeAt(1) - CODE_POINT_A;
  if (a < 0 || a > 25 || b < 0 || b > 25) return "\u{1F3F3}";
  return String.fromCodePoint(REGIONAL_INDICATOR_A + a, REGIONAL_INDICATOR_A + b);
}
