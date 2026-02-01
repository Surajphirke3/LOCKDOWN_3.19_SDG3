export default function ResearchOutputs() {
  return (
    <section className="px-6 py-16 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-8">Research Outputs</h2>

      <div className="grid sm:grid-cols-3 gap-6">
        <div className="p-5 border rounded-xl">
          <p className="text-xs text-gray-500 mb-2">RISK CATEGORY</p>
          <span className="inline-block px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
            MODERATE
          </span>
        </div>

        <div className="p-5 border rounded-xl">
          <p className="text-xs text-gray-500 mb-2">CONFIDENCE SCORE</p>
          <p className="text-2xl font-semibold text-emerald-600">87.4%</p>
        </div>

        <div className="p-5 border rounded-xl">
          <p className="text-xs text-gray-500 mb-2">
            MEL SPECTROGRAM VISUALIZATION
          </p>
          <div className="h-24 bg-gradient-to-r from-black via-blue-900 to-black rounded-md" />
        </div>
      </div>
    </section>
  );
}
