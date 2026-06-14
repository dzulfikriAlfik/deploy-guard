function App() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-50">
      <section className="mx-auto max-w-5xl">
        <p className="mb-3 text-sm font-medium text-zinc-400">
          DeployGuard Phase 2
        </p>

        <h1 className="text-4xl font-bold tracking-tight">
          Operational Intelligence Platform
        </h1>

        <p className="mt-4 max-w-2xl text-zinc-300">
          Repository skeleton is ready. Backend, frontend, PostgreSQL,
          pgvector, Redis, strict TypeScript baseline, and secure auth direction
          are prepared for the next phase.
        </p>

        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-xl font-semibold">Current Phase</h2>
          <p className="mt-2 text-zinc-300">
            Phase 2 focuses on project skeleton only. Authentication, RBAC,
            ingestion, and vector search will be implemented in later phases.
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;