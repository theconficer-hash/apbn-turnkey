import { BookOpen, NotebookPen, BarChart3, Landmark } from 'lucide-react'
import useSimStore from './store/useSimStore'
import heroImg from './assets/hero.jpg'
import GuidePage from './pages/GuidePage'
import AssumptionsPage from './pages/AssumptionsPage'
import ResultsPage from './pages/ResultsPage'

const NAV = [
  { id: 'panduan', label: 'Kamus Istilah Asumsi', Icon: BookOpen },
  { id: 'input', label: 'Input Asumsi', Icon: NotebookPen },
  { id: 'results', label: 'Hasil Simulasi', Icon: BarChart3 },
]

function App() {
  const activePage = useSimStore((s) => s.activePage)
  const setActivePage = useSimStore((s) => s.setActivePage)
  const results = useSimStore((s) => s.results)

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F8FB] text-slate-800">
      {/* ===== HERO ===== */}
      <header className="relative overflow-hidden text-white">
        <img
          src={heroImg}
          alt="Ilustrasi tanggul laut dan garis pantai kota"
          className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-laut-900 via-laut-900/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-laut-900/45 via-transparent to-laut-900/25" />

        <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-12 sm:pb-14 sm:pt-16">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-200/90 sm:text-xs">
                <Landmark size={16} strokeWidth={2.5} />
                Simulasi Pendanaan Infrastruktur
              </p>

              <h1 className="mt-3 text-5xl font-extrabold leading-[0.92] tracking-tight drop-shadow-sm sm:text-7xl">
                Simulator{' '}
                <span className="bg-gradient-to-r from-cyan-200 via-sky-100 to-emerald-200 bg-clip-text text-transparent">
                  APBN Turnkey
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-laut-50 drop-shadow sm:text-lg">
                Simulasi beban fiskal skema pendanaan unbundling turnkey —
                anuitas pinjaman & biaya operasi per tahap pembangunan.
              </p>
            </div>

            <span className="rounded-full border border-white/40 bg-laut-900/30 px-4 py-1.5 text-xs font-bold tracking-wide backdrop-blur-sm">
              v1.0 · PKA 2026
            </span>
          </div>

          {/* Navigasi */}
          <nav className="mt-10 inline-flex flex-wrap gap-1 rounded-2xl bg-laut-900/40 p-1.5 ring-1 ring-white/25 backdrop-blur-md">
            {NAV.map(({ id, label, Icon }) => {
              const disabled = id === 'results' && !results
              const active = activePage === id
              return (
                <button
                  key={id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setActivePage(id)}
                  className={
                    'flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition sm:px-6 ' +
                    (active
                      ? 'bg-white text-laut-900 shadow-md'
                      : disabled
                        ? 'cursor-not-allowed text-white/40'
                        : 'text-white/90 hover:bg-white/15')
                  }
                >
                  <Icon size={17} strokeWidth={2.4} />
                  {label}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      {/* ===== KONTEN ===== */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {activePage === 'panduan' && <GuidePage />}
        {activePage === 'input' && <AssumptionsPage />}
        {activePage === 'results' && <ResultsPage />}
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-6 py-4 text-center text-xs text-slate-400">
          <Landmark size={14} />
          Simulator APBN Turnkey v1.0 · Simulasi ini untuk keperluan perencanaan.
          Bukan keputusan investasi final.
        </div>
      </footer>
    </div>
  )
}

export default App
