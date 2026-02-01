export default function Hero() {
  return (
    <section className="px-6 pt-20 pb-16 max-w-5xl mx-auto">
      <span className="inline-block mb-4 text-xs font-semibold tracking-wide text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
        RESEARCH PHASE v1.0
      </span>

      <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
        AI-Assisted Early <br />
        <span className="text-emerald-600">TB Risk</span> Screening
      </h1>

      <p className="mt-5 text-lg text-gray-600 max-w-2xl">
        Harnessing cough audio and video analysis to detect early risk
        indicators for Tuberculosis through non-invasive screening.
      </p>

      <div className="mt-8 flex gap-4">
        <button className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition">
          Learn How It Works →
        </button>
        <button className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
          View Research Protocol
        </button>
      </div>
    </section>
  );
}
