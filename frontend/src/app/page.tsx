"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-emerald-50 text-gray-900">
      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl font-bold mb-6"
        >
          AI-Powered Early{" "}
          <span className="text-emerald-600">TB Risk</span> Screening
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-2xl mx-auto text-lg text-gray-600 mb-10"
        >
          CoughLock is a non-invasive web platform that uses AI-based cough
          analysis to help identify tuberculosis risk early — fast, accessible,
          and easy to use.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-4"
        >
          <button
            onClick={() => router.push("/screening")}
            className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
          >
            Start Screening
          </button>

          <button
            onClick={() =>
              document
                .getElementById("how-it-works")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-8 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            How It Works
          </button>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="max-w-6xl mx-auto px-6 py-20"
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-semibold text-center mb-14"
        >
          How CoughLock Works
        </motion.h2>

        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              title: "Record Cough",
              desc: "The user records a short cough using their phone or laptop.",
            },
            {
              title: "AI Analysis",
              desc: "Deep learning models analyze acoustic cough patterns linked to TB.",
            },
            {
              title: "Risk Assessment",
              desc: "The system returns a TB risk level with clear next-step guidance.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="text-emerald-600 font-bold text-lg mb-3">
                {i + 1}
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* OUTPUT SECTION */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-semibold mb-10"
          >
            What the User Receives
          </motion.h2>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              "TB Risk Level (Low / Medium / High)",
              "Confidence Score for Transparency",
              "Clear Guidance on What to Do Next",
            ].map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="border rounded-xl p-6"
              >
                <p className="text-gray-700 font-medium">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DISCLAIMER + CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-600 mb-6">
            CoughLock is a screening and risk-assessment tool. It does not
            provide medical diagnosis and is intended to support early
            awareness.
          </p>

          <button
            onClick={() => router.push("/screening")}
            className="px-10 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
          >
            Begin Screening
          </button>
        </div>
      </section>
    </main>
  );
}
