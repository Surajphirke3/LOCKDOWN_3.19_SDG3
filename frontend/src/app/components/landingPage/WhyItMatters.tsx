export default function WhyItMatters() {
  return (
    <section className="px-6 py-16 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-8">Why It Matters</h2>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="p-6 border rounded-xl">
          <h3 className="font-medium text-lg mb-2">Late Detection</h3>
          <p className="text-gray-600">
            Most TB cases are diagnosed in advanced stages, increasing
            transmission risk and treatment complexity.
          </p>
        </div>

        <div className="p-6 border rounded-xl">
          <h3 className="font-medium text-lg mb-2">Limited Access</h3>
          <p className="text-gray-600">
            Traditional screening requires specialized equipment often
            unavailable in remote or underserved regions.
          </p>
        </div>
      </div>
    </section>
  );
}
