import type { Imagery } from "./banks";

const frame = "flex size-full min-h-64 items-center justify-center p-8";

function Route() {
  return <svg viewBox="0 0 320 240" className="w-full max-w-md" role="img" aria-label="Route from London to Lagos">
    <path d="M70 70 C 150 40, 240 110, 250 180" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" />
    <circle cx="70" cy="70" r="7" fill="var(--primary)" />
    <circle cx="250" cy="180" r="7" fill="var(--primary)" />
    <circle cx="250" cy="180" r="18" fill="none" stroke="var(--primary)" strokeOpacity="0.3" />
    <text x="70" y="50" textAnchor="middle" fill="var(--foreground)" fontSize="13" fontFamily="inherit">LHR</text>
    <text x="250" y="214" textAnchor="middle" fill="var(--foreground)" fontSize="13" fontFamily="inherit">LOS</text>
  </svg>;
}

function Jar() {
  const coins = [0, 1, 2, 3, 4];
  return <svg viewBox="0 0 240 240" className="w-full max-w-xs" role="img" aria-label="Savings jar filling up">
    <rect x="60" y="40" width="120" height="170" rx="36" fill="none" stroke="var(--primary)" strokeWidth="4" />
    {coins.map((coin) => <rect key={coin} x="80" y={178 - coin * 24} width="80" height="18" rx="9" fill="var(--primary)" fillOpacity={1 - coin * 0.17} />)}
    <rect x="84" y="28" width="72" height="16" rx="8" fill="var(--foreground)" fillOpacity="0.12" />
  </svg>;
}

function Quorum() {
  const seats = Array.from({ length: 12 }, (_, index) => index);
  return <svg viewBox="0 0 240 200" className="w-full max-w-xs" role="img" aria-label="Seven of twelve signers approved">
    {seats.map((seat) => {
      const x = 30 + (seat % 4) * 50;
      const y = 20 + Math.floor(seat / 4) * 50;
      return seat < 7
        ? <rect key={seat} x={x} y={y} width="30" height="30" fill="var(--primary)" />
        : <rect key={seat} x={x + 0.5} y={y + 0.5} width="29" height="29" fill="none" stroke="var(--foreground)" strokeOpacity="0.35" />;
    })}
    <text x="30" y="190" fill="var(--muted-foreground)" fontSize="12" fontFamily="JetBrains Mono, monospace">7 of 12 signed</text>
  </svg>;
}

function Monogram() {
  return <svg viewBox="0 0 240 240" className="w-full max-w-60" role="img" aria-label="Ashcombe monogram">
    <rect x="40" y="40" width="160" height="160" fill="none" stroke="var(--primary)" strokeWidth="1" />
    <rect x="48" y="48" width="144" height="144" fill="none" stroke="var(--primary)" strokeWidth="0.5" />
    <text x="120" y="146" textAnchor="middle" fill="var(--primary)" fontSize="88" fontFamily="Charter, 'Bitstream Charter', Georgia, serif">A</text>
  </svg>;
}

function Stickers() {
  return <svg viewBox="0 0 300 240" className="w-full max-w-md" role="img" aria-label="Ticket and sticker shapes">
    <g transform="rotate(-12 110 110)">
      <rect x="40" y="70" width="150" height="80" rx="16" fill="var(--primary)" />
      <circle cx="40" cy="110" r="12" fill="var(--muted)" />
      <circle cx="190" cy="110" r="12" fill="var(--muted)" />
      <text x="115" y="120" textAnchor="middle" fill="var(--primary-foreground)" fontSize="26" fontWeight="900" fontFamily="Inter Display, Inter, sans-serif">£18 each</text>
    </g>
    <path d="M232 40 l10 22 24 2 -18 16 6 24 -22 -13 -22 13 6 -24 -18 -16 24 -2z" fill="var(--foreground)" />
    <circle cx="236" cy="182" r="30" fill="none" stroke="var(--primary)" strokeWidth="8" />
  </svg>;
}

const images: Record<Imagery, () => React.JSX.Element> = { route: Route, jar: Jar, quorum: Quorum, monogram: Monogram, stickers: Stickers };

export function BankImagery({ imagery }: { imagery: Imagery }) {
  const Artwork = images[imagery];
  return <div className={frame}><Artwork /></div>;
}
