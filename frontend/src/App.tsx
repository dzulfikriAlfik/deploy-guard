function App() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-5xl">
        <p className="mb-3 text-sm font-medium text-slate-500">
          DeployGuard Phase 2
        </p>

        <h1 className="text-4xl font-bold tracking-tight">
          Operational Intelligence Platform
        </h1>

        <p className="mt-4 max-w-2xl text-slate-600">
          Repository skeleton is ready. Backend, frontend, strict TypeScript
          baseline, secure auth direction, and operational logging direction are
          prepared for the next phase.
        </p>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Current Phase</h2>
          <p className="mt-2 text-slate-600">
            Phase 2 focuses on project skeleton only. Authentication, RBAC,
            ingestion, PostgreSQL, Redis, and vector search will be implemented
            in later phases.
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;