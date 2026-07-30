import { useCallback, useEffect, useRef, useState } from "react";
import { Player } from "@remotion/player";
import { DeepWaterFilm, DURATION, FPS, WIDTH, HEIGHT } from "./film/Film";
import { Water } from "./gl/Water";
import { Ripple } from "./gl/Ripple";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const ART = "/artwork.webp";

const PIECE = {
  title: "Deep Water",
  artist: "Aurelia",
  year: "2026",
  medium: "Acrylic on stretched canvas",
  size: "100 × 80 cm · 39⅜ × 31½ in",
  price: 1100,
  whatsapp: "40749180355",
  whatsappDisplay: "+40 749 180 355",
};

const WA_TEXT = `Hello — I'm writing about "${PIECE.title}" (${PIECE.size}). Is it still available?`;
const waHref = `https://wa.me/${PIECE.whatsapp}?text=${encodeURIComponent(WA_TEXT)}`;

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return p;
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      opacity: seen ? 1 : 0,
      transform: seen ? "none" : "translateY(20px)",
      transition: `opacity 1s cubic-bezier(.2,.7,.25,1) ${delay}ms, transform 1s cubic-bezier(.2,.7,.25,1) ${delay}ms`,
    }}>{children}</div>
  );
}

/* ── The curtain: a short cinematic open ───────────────────── */
function Curtain() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setStage(2); return; }
    const a = setTimeout(() => setStage(1), 220);
    const b = setTimeout(() => setStage(2), 2300);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  useEffect(() => {
    document.body.style.overflow = stage < 2 ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [stage]);
  if (stage === 2) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[hsl(var(--abyss))]"
         style={{ opacity: stage === 1 ? 1 : 0, transition: "opacity .5s ease" }} aria-hidden="true">
      <div className="text-center">
        <p className="t-eyebrow mb-6" style={{ opacity: stage === 1 ? 1 : 0, transition: "opacity 1s ease .2s" }}>
          One of one
        </p>
        <h2 className="t-display text-[clamp(3rem,9vw,6rem)]"
            style={{
              opacity: stage === 1 ? 1 : 0,
              letterSpacing: stage === 1 ? "-.02em" : ".16em",
              transition: "opacity 1.1s ease, letter-spacing 1.9s cubic-bezier(.2,.7,.25,1)",
            }}>
          Deep <span className="italic">Water</span>
        </h2>
      </div>
    </div>
  );
}

function DepthGauge({ progress }: { progress: number }) {
  return (
    <div className="pointer-events-none fixed left-7 top-1/2 z-30 hidden -translate-y-1/2 xl:block" aria-hidden="true">
      <div className="relative h-[46vh] w-px bg-white/15">
        <div className="absolute left-0 top-0 w-px bg-[hsl(var(--accent))]"
             style={{ height: `${progress * 100}%`, transition: "height .12s linear" }} />
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <span key={t} className="absolute -left-[3px] h-px w-[7px] bg-white/25" style={{ top: `${t * 100}%` }} />
        ))}
        <div className="absolute left-4 -translate-y-1/2 whitespace-nowrap"
             style={{ top: `${progress * 100}%`, transition: "top .12s linear" }}>
          <span className="t-ui t-num text-[10px] font-semibold tracking-[.2em] text-[hsl(var(--accent))]">
            {String(Math.round(progress * 40)).padStart(2, "0")} M
          </span>
        </div>
      </div>
      <p className="t-eyebrow mt-5 text-[9px] [writing-mode:vertical-rl]">Depth</p>
    </div>
  );
}

type Passage = { key: string; label: string; note: string; x: number; y: number };
const PASSAGES: Passage[] = [
  { key: "horizon", label: "The horizon", note: "A pale band, laid in thin and left alone. It is the only exit in the picture, and she is not looking at it.", x: 50, y: 16 },
  { key: "blade", label: "The shoulder blade", note: "One lit edge, dragged in a single pass. The hardest passage here, and the one that makes the body read as a living thing rather than a shape.", x: 63, y: 46 },
  { key: "spine", label: "The spine", note: "A long shadow doing structural work: it is what gives the whole figure its turn away from you.", x: 55, y: 58 },
  { key: "hip", label: "The hip", note: "The warmest note in the painting, and the wettest-looking. Everything cold in the picture exists to make this one passage glow.", x: 41, y: 84 },
];

function CloseReading() {
  const [active, setActive] = useState<Passage | null>(null);
  const framing = active
    ? { transform: "scale(1.8)", transformOrigin: `${active.x}% ${active.y}%` }
    : { transform: "scale(1)", transformOrigin: "50% 50%" };

  return (
    <TooltipProvider delayDuration={120}>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16">
        <div className="lg:sticky lg:top-[12vh] lg:self-start">
          <div className="relative overflow-hidden bg-black/40 shadow-[0_40px_90px_-50px_rgba(0,0,0,.9)]">
            <img src={ART} alt="" className="block w-full"
                 style={{ ...framing, transition: "transform 1.2s cubic-bezier(.2,.7,.25,1)" }} />
            {PASSAGES.map((p) => {
              const on = active?.key === p.key;
              return (
                <Tooltip key={p.key}>
                  <TooltipTrigger asChild>
                    <button type="button" onClick={() => setActive(on ? null : p)}
                            aria-label={p.label} aria-pressed={on}
                            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 p-2"
                            style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                      <span className="relative block h-3 w-3 rounded-full border transition-all duration-500"
                            style={{
                              borderColor: on ? "hsl(var(--accent))" : "rgba(255,255,255,.7)",
                              background: on ? "hsl(var(--accent))" : "rgba(255,255,255,.16)",
                              boxShadow: on ? "0 0 0 9px hsl(var(--accent) / .18)" : "0 0 0 4px rgba(255,255,255,.08)",
                            }}>
                        {!on && (
                          <span className="absolute inset-0 animate-ping rounded-full bg-white/40"
                                style={{ animationDuration: "2.6s" }} />
                        )}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right"
                                  className="t-ui border-white/15 bg-[hsl(var(--popover))] text-[11px] tracking-wide">
                    {p.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <p className="t-eyebrow mb-6">Close reading — four passages</p>
          {PASSAGES.map((p, i) => {
            const on = active?.key === p.key;
            return (
              <button key={p.key} type="button" onClick={() => setActive(on ? null : p)}
                      className="group border-t border-white/10 py-6 text-left transition-colors last:border-b hover:bg-white/[.03]">
                <div className="flex items-baseline gap-4">
                  <span className="t-ui t-num text-[11px] font-semibold tracking-[.18em] text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--accent))]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="t-display text-2xl transition-colors"
                      style={{ color: on ? "hsl(var(--accent))" : undefined }}>{p.label}</h3>
                </div>
                <div className="grid transition-all duration-500"
                     style={{ gridTemplateRows: on ? "1fr" : "0fr", opacity: on ? 1 : 0 }}>
                  <div className="overflow-hidden">
                    <p className="pl-9 pt-3 text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]">{p.note}</p>
                  </div>
                </div>
              </button>
            );
          })}
          <p className="t-ui mt-6 text-[12px] text-[hsl(var(--muted-foreground))]">
            Select a passage to bring the canvas in.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}

const LEDGER: [string, string][] = [
  ["Title", PIECE.title], ["Artist", PIECE.artist], ["Year", PIECE.year],
  ["Medium", PIECE.medium], ["Dimensions", PIECE.size], ["Orientation", "Portrait"],
  ["Subject", "Figurative — seated nude, seen from behind, against open sea"],
  ["Edition", "Original — one of one. No prints, no reproductions."],
  ["Surface", "Gallery-profile stretched canvas, painted edges — hangs unframed"],
  ["Signature", "Signed by the artist; signed, titled and dated on the reverse"],
  ["Provenance", "Direct from the artist's studio. First owner."],
  ["Documentation", "Numbered Certificate of Authenticity, signed and dated"],
];

const FAQ: [string, string, string][] = [
  ["ship", "How does it ship?", "In a custom-built crate, fully insured and tracked, with shipping included in the price. Glassine against the surface, then bubble, then corner protectors, then the crate. 5–10 business days domestic, 10–21 international. You get tracking and a photograph of the crated package the day it leaves."],
  ["care", "How do I care for it?", "Out of direct sunlight, away from radiators — acrylic stays slightly thermoplastic and dislikes sustained heat. Dust with a dry, soft brush or a clean lint-free cloth. Never solvents, cleaners, or water on the varnish. If the canvas slackens with humidity, tap the corner keys on the reverse."],
  ["auth", "How do I know it's original?", "It arrives with a numbered Certificate of Authenticity, signed and dated by the artist, confirming that no edition, reproduction, or second version exists. The painting is signed on the front and signed, titled and dated on the reverse."],
  ["pay", "How do I pay?", "Bank transfer or card. An invoice is issued before dispatch, and the painting ships within three business days of payment clearing. Fourteen-day return if it doesn't hold the room."],
];

export default function App() {
  const progress = useScrollProgress();
  const scrollToId = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <>
      <Curtain />
      {/* CSS ground first, WebGL sea on top of it. */}
      <div className="pointer-events-none fixed inset-0 -z-20"
           style={{ background: "linear-gradient(180deg,#1c5670 0%,#0d2a3a 55%,#071820 100%)" }} />
      <Water depth={progress} />

      <div className="fixed left-0 top-0 z-50 h-px w-full bg-white/10" aria-hidden="true">
        <div className="h-px bg-[hsl(var(--accent))]" style={{ width: `${progress * 100}%` }} />
      </div>

      <DepthGauge progress={progress} />

      <main className="relative">
        {/* ── Surface ─────────────────────────────────────── */}
        <header className="mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-center px-6 py-24 sm:px-10 lg:px-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
            <Reveal delay={300}>
              <Badge variant="outline"
                     className="t-ui mb-8 rounded-[2px] border-white/25 bg-white/[.04] px-3 py-1 text-[10px] font-semibold tracking-[.2em] text-[hsl(var(--muted-foreground))]">
                ORIGINAL · ONE OF ONE · {PIECE.year}
              </Badge>
              <h1 className="t-display text-[clamp(4rem,13vw,10.5rem)]">
                Deep<br /><span className="italic">Water</span>
              </h1>
              <div className="mt-10 max-w-md">
                <p className="text-lg leading-relaxed text-[hsl(var(--foreground))]/85">
                  She has her back to you, and that is the whole painting.
                </p>
                <p className="t-ui mt-8 text-[13px] leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {PIECE.artist} · {PIECE.medium}<br />{PIECE.size}
                </p>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Button asChild size="lg"
                        className="t-ui rounded-[2px] bg-[hsl(var(--accent))] px-7 text-[13px] font-semibold tracking-wide text-[hsl(var(--accent-foreground))] transition-transform hover:-translate-y-px hover:bg-[hsl(var(--accent))]/90">
                  <a href={waHref} target="_blank" rel="noopener noreferrer">Enquire on WhatsApp</a>
                </Button>
                <Button variant="outline" size="lg" onClick={() => scrollToId("film")}
                        className="t-ui rounded-[2px] border-white/25 bg-transparent px-7 text-[13px] font-semibold tracking-wide hover:bg-white/5">
                  Watch the film
                </Button>
              </div>
            </Reveal>

            <Reveal delay={520}>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="group relative block w-full cursor-zoom-in"
                          aria-label="View the painting full screen">
                    <Ripple
                      src={ART}
                      alt={`${PIECE.title} — ${PIECE.medium}, ${PIECE.size}. A seated figure seen from behind, turned away, against a calm open sea.`}
                      className="mx-auto max-w-[540px] shadow-[0_2px_2px_rgba(0,0,0,.25),0_30px_60px_-24px_rgba(0,0,0,.75),0_70px_110px_-70px_rgba(0,0,0,.9)]"
                    />
                    <span className="t-eyebrow mt-5 block text-center text-[10px] opacity-60 transition-opacity group-hover:opacity-100">
                      Move over the canvas · click to enlarge
                    </span>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-[94vw] border-white/10 bg-[hsl(var(--abyss))] p-2 sm:max-w-[min(92vw,760px)]">
                  <img src={ART} alt="" className="max-h-[86vh] w-full object-contain" />
                </DialogContent>
              </Dialog>
            </Reveal>
          </div>
        </header>

        {/* ── The film ────────────────────────────────────── */}
        <section id="film" className="scroll-mt-8 px-6 py-20 sm:px-10 lg:py-28">
          <div className="mx-auto max-w-[1100px]">
            <Reveal>
              <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="t-eyebrow mb-3">The film</p>
                  <h2 className="t-display text-[clamp(2rem,5vw,3.4rem)]">
                    Twenty-six seconds<br />in the water.
                  </h2>
                </div>
                <p className="t-ui max-w-[34ch] text-[13px] leading-relaxed text-[hsl(var(--muted-foreground))]">
                  Composed frame by frame in Remotion and played here in the page — the
                  same type, the same palette, the same argument as the painting.
                </p>
              </div>
              <div className="mx-auto w-full max-w-[520px] shadow-[0_40px_100px_-40px_rgba(0,0,0,.95)]">
                <Player
                  component={DeepWaterFilm}
                  durationInFrames={DURATION}
                  fps={FPS}
                  compositionWidth={WIDTH}
                  compositionHeight={HEIGHT}
                  style={{ width: "100%" }}
                  controls
                  loop
                  clickToPlay
                  showPosterWhenUnplayed
                  renderPoster={() => (
                    <div className="relative h-full w-full overflow-hidden bg-[hsl(var(--abyss))]">
                      <img src={ART} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
                      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--abyss))]/40 via-transparent to-[hsl(var(--abyss))]/90" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-center">
                        <span className="t-eyebrow text-[11px]">The film · 0:26</span>
                        <span className="t-display text-[clamp(2.2rem,7vw,3.4rem)] leading-none">
                          Deep <span className="italic">Water</span>
                        </span>
                        <span className="mt-2 flex h-16 w-16 items-center justify-center rounded-full border border-white/40 backdrop-blur-sm transition-colors">
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                        <span className="t-ui text-[11px] tracking-[.2em] text-white/55">PLAY</span>
                      </div>
                    </div>
                  )}
                  acknowledgeRemotionLicense
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Close reading ───────────────────────────────── */}
        <section id="reading" className="mx-auto max-w-[1400px] scroll-mt-12 px-6 py-20 sm:px-10 lg:px-20 lg:py-28">
          <CloseReading />
        </section>

        {/* ── The study ───────────────────────────────────── */}
        <section className="px-6 py-20 sm:px-10 lg:py-28">
          <div className="mx-auto max-w-[64ch]">
            <Reveal>
              <p className="t-eyebrow mb-8">The study</p>
              <Tabs defaultValue="story">
                <TabsList className="t-ui h-auto w-full flex-wrap justify-start gap-x-1 gap-y-0 rounded-none border-b border-white/10 bg-transparent p-0">
                  {[["story", "The painting"], ["scale", "Scale & place"], ["hands", "In your hands"]].map(([v, l]) => (
                    <TabsTrigger key={v} value={v}
                      className="rounded-none border-b-2 border-transparent bg-transparent px-3 py-3 text-[11.5px] sm:px-4 sm:text-[12px] font-semibold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))] data-[state=active]:border-[hsl(var(--accent))] data-[state=active]:bg-transparent data-[state=active]:text-[hsl(var(--foreground))] data-[state=active]:shadow-none">
                      {l}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="story" className="mt-10">
                  <blockquote className="t-display mb-10 text-[clamp(1.8rem,4vw,2.8rem)] italic leading-[1.1]">
                    She isn't posing. She isn't aware of you.
                  </blockquote>
                  <div className="t-body text-[1.0625rem] leading-[1.75] text-[hsl(var(--foreground))]/88">
                    <p>Her face is there — turned, in profile, eyes lowered — but it is given to you only in part, and on her terms. You have arrived either a moment after something happened or a moment before it does, and the painting refuses to say which.</p>
                    <p>Everything behind her is cold. The sea runs from a pale band at the horizon down through teal into a blue so deep it stops being water and becomes weight. It is doing nothing at all: no surf, no weather, barely a ripple. That flatness is not peace. It is the particular stillness that makes a person sit down at the edge of it and stay there.</p>
                    <p>Against all of it, she is the only warm thing for miles. Ochre, sienna, a low ember along the shoulder and hip — the entire painting is one temperature held against another, and she is losing, and she is staying anyway.</p>
                    <p>The face gets less detail than the back does. That is deliberate. The back is where a body keeps what the face performs.</p>
                  </div>
                </TabsContent>

                <TabsContent value="scale" className="mt-10">
                  <div className="t-body text-[1.0625rem] leading-[1.75] text-[hsl(var(--foreground))]/88">
                    <p>A metre tall. At 100 × 80 cm the figure sits close to life size, so the sea behind her stops being a picture you look at and becomes a room you stand in front of.</p>
                    <p>Hang it where you pass it daily, with the horizon near your own eye level. In morning light the sea cools and pulls away from her. In late afternoon the warmth comes up in her skin and she moves forward off the canvas. Both are correct, and you will come to prefer one.</p>
                    <p>It is painted around the sides on gallery-profile stretchers, so it hangs exactly as it is. A frame is a preference, not a requirement.</p>
                  </div>
                </TabsContent>

                <TabsContent value="hands" className="mt-10">
                  <Accordion type="single" collapsible className="border-t border-white/10">
                    {FAQ.map(([v, q, a]) => (
                      <AccordionItem key={v} value={v} className="border-white/10">
                        <AccordionTrigger className="t-ui text-left text-[14px] font-medium hover:no-underline">{q}</AccordionTrigger>
                        <AccordionContent className="text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]">{a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              </Tabs>
            </Reveal>
          </div>
        </section>

        {/* ── Particulars ─────────────────────────────────── */}
        <section className="px-6 py-20 sm:px-10 lg:py-28">
          <div className="mx-auto max-w-[62ch]">
            <Reveal>
              <p className="t-eyebrow mb-10">Particulars</p>
              <dl className="grid grid-cols-1 sm:grid-cols-[11rem_1fr]">
                {LEDGER.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="t-eyebrow border-t border-white/10 pt-4 sm:py-4">{k}</dt>
                    <dd className="t-num border-white/10 pb-4 pt-1 text-[15px] sm:border-t sm:py-4">{v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* ── Acquisition ─────────────────────────────────── */}
        <section id="acquire" className="scroll-mt-8 px-6 py-24 sm:px-10 lg:py-32">
          <div className="mx-auto max-w-[62ch] text-center">
            <Reveal>
              <p className="t-eyebrow mb-8">Acquisition</p>
              <p className="t-display t-num text-[clamp(3.4rem,10vw,6rem)] text-[hsl(var(--accent))]">
                ${PIECE.price.toLocaleString("en-US")}
              </p>
              <p className="t-ui mt-3 text-[12px] tracking-[.16em] text-[hsl(var(--muted-foreground))]">
                USD · CRATE AND INSURED SHIPPING INCLUDED
              </p>
              <div className="mx-auto my-12 h-px w-24 bg-white/15" />
              <p className="mx-auto max-w-[46ch] text-[1.0625rem] leading-relaxed text-[hsl(var(--foreground))]/85">
                One painting, one owner. When it goes it is gone — there is no second
                version, no smaller size, no print run. Serious offers are welcome and
                answered personally, usually the same day.
              </p>
              <div className="mt-12 flex flex-col items-center gap-4">
                <Button asChild size="lg"
                        className="t-ui h-auto w-full max-w-sm rounded-[2px] bg-[hsl(var(--accent))] py-4 text-[14px] font-semibold tracking-wide text-[hsl(var(--accent-foreground))] transition-transform hover:-translate-y-px hover:bg-[hsl(var(--accent))]/90">
                  <a href={waHref} target="_blank" rel="noopener noreferrer">Message the studio on WhatsApp</a>
                </Button>
                <a href={`https://wa.me/${PIECE.whatsapp}`} target="_blank" rel="noopener noreferrer"
                   className="t-ui t-num text-[13px] tracking-[.14em] text-[hsl(var(--muted-foreground))] underline-offset-4 hover:text-[hsl(var(--foreground))] hover:underline">
                  {PIECE.whatsappDisplay}
                </a>
              </div>
              <ul className="t-ui mx-auto mt-14 flex max-w-lg flex-col gap-2 text-[12.5px] leading-relaxed text-[hsl(var(--muted-foreground))]">
                <li>Signed, with a numbered Certificate of Authenticity</li>
                <li>Ships crated and insured, worldwide</li>
                <li>14-day return if it doesn't hold the room</li>
              </ul>
            </Reveal>
          </div>
        </section>

        <footer className="border-t border-white/10 px-6 py-12 text-center sm:px-10">
          <p className="t-eyebrow text-[10px]">
            {PIECE.title} · {PIECE.artist} · {PIECE.year} · {PIECE.size}
          </p>
        </footer>
      </main>
    </>
  );
}
