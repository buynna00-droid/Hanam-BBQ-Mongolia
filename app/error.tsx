"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="section-wrap">
      <h1>Hanam BBQ Mongolia</h1>
      <p>Temporarily unavailable.</p>
      <button onClick={reset}>Try again</button>
    </main>
  );
}
