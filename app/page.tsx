import { DataSourceBadge } from "@/components/DataSourceBadge";
import { GroupsBoard } from "@/components/GroupsBoard";
import { BracketSection as BracketViz } from "@/components/BracketSection";

export default function Wallchart() {
  return (
    <main className="mx-auto max-w-[1440px] px-6 py-10 md:px-12 md:py-16">
      <PosterHeader />
      <GroupsSection />
      <BracketSection />
      <Footer />
    </main>
  );
}

function PosterHeader() {
  return (
    <header className="relative mb-16 text-center">
      <p className="heading-block text-sm text-[color:var(--color-red)] mb-4">
        USA · MEXICO · CANADA — JUNE 11 / JULY 19, 2026
      </p>

      <h1 className="poster-title text-[clamp(4rem,14vw,12rem)] text-[color:var(--color-navy)]">
        World Cup
        <br />
        <span className="text-[color:var(--color-red)]">Twenty Twenty Six</span>
      </h1>

      <p className="serif-flourish text-xl mt-6 text-[color:var(--color-ink-soft)]">
        the official-ish wallchart · forty-eight nations · one hundred and four matches
      </p>

      <div className="mx-auto mt-8 h-2 w-48 bg-[color:var(--color-mustard)]" />
      <DataSourceBadge />
    </header>
  );
}

function GroupsSection() {
  return (
    <section className="mb-20">
      <SectionLabel kicker="Phase One" title="Group Stage" />
      <GroupsBoard />
    </section>
  );
}

function BracketSection() {
  return (
    <section className="mb-20">
      <SectionLabel kicker="Phase Two" title="Knockout" />
      <BracketViz />
    </section>
  );
}

function SectionLabel({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <div>
        <p className="heading-block text-xs text-[color:var(--color-red)]">{kicker}</p>
        <h2 className="poster-title text-6xl text-[color:var(--color-navy)]">{title}</h2>
      </div>
      <div className="h-1 flex-1 mx-6 bg-[color:var(--color-ink)]" />
      <div className="h-3 w-3 bg-[color:var(--color-mustard)]" />
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-[color:var(--color-ink)] pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[color:var(--color-ink-soft)]">
      <p className="heading-block">A LOCAL WALLCHART · BUILT WITH NEXT.JS</p>
      <p className="serif-flourish">predictions saved to your browser</p>
    </footer>
  );
}
