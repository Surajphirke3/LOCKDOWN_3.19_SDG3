export default function Methodology() {
  return (
    <section className="px-6 py-16 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-10">The Methodology</h2>

      <div className="space-y-8">
        <div className="flex gap-4">
          <span className="text-emerald-600 font-bold">1</span>
          <div>
            <h3 className="font-medium">Data Collection</h3>
            <p className="text-gray-600">
              Secure recording of cough signatures and respiratory movements
              using standard smartphone sensors.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <span className="text-emerald-600 font-bold">2</span>
          <div>
            <h3 className="font-medium">AI Neural Analysis</h3>
            <p className="text-gray-600">
              Convolutional Neural Networks analyze audio and video patterns
              associated with pathological stress.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <span className="text-emerald-600 font-bold">3</span>
          <div>
            <h3 className="font-medium">Risk Assessment</h3>
            <p className="text-gray-600">
              Generation of a probability score to help prioritize further
              clinical evaluation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
