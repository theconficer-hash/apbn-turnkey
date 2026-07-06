import { useState } from 'react'
import useSimStore from '../store/useSimStore'
import { runSimulation } from '../api/client'
import { formatRibuan, parseRibuan, formatRingkas } from '../utils/format'

// Tampilkan desimal sebagai persen tanpa galat floating point (0.06 -> 6)
const toPct = (v) => Math.round((v ?? 0) * 1e8) / 1e6

const inputCls =
  'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm ' +
  'focus:border-laut-700 focus:ring-1 focus:ring-laut-700 outline-none bg-white'

const cellCls =
  'w-full rounded border border-slate-300 px-2 py-1 text-sm ' +
  'focus:border-laut-700 focus:ring-1 focus:ring-laut-700 outline-none bg-white'

function Section({ kode, judul, children, mangrove }) {
  return (
    <section
      className={
        'mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm border-t-4 ' +
        (mangrove ? 'border-t-mangrove-600' : 'border-t-laut-700')
      }
    >
      <h2 className="mb-4 text-base font-bold text-laut-900">
        <span className="mr-2 rounded-md bg-laut-50 px-2 py-0.5 text-sm text-laut-700">
          {kode}
        </span>
        {judul}
      </h2>
      {children}
    </section>
  )
}

function Field({ label, hint, children }) {
  return (
    <label className="flex flex-col">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 text-[11px] text-slate-400">{hint}</span>}
    </label>
  )
}

// Input Rupiah dengan pemisah ribuan "." yang dirapikan saat blur
function RupiahCell({ value, onCommit }) {
  const [teks, setTeks] = useState(formatRibuan(value))
  return (
    <input
      className={cellCls + ' text-right tabular-nums'}
      inputMode="numeric"
      value={teks}
      onChange={(e) => setTeks(e.target.value)}
      onBlur={() => {
        const n = parseRibuan(teks)
        setTeks(formatRibuan(n))
        onCommit(n)
      }}
    />
  )
}

export default function AssumptionsPage() {
  const [error, setError] = useState(null)

  const a = useSimStore((s) => s.assumptions)
  const setAssumptions = useSimStore((s) => s.setAssumptions)
  const addTahap = useSimStore((s) => s.addTahap)
  const removeTahap = useSimStore((s) => s.removeTahap)
  const isLoading = useSimStore((s) => s.isLoading)
  const setLoading = useSimStore((s) => s.setLoading)
  const setResults = useSimStore((s) => s.setResults)
  const setActivePage = useSimStore((s) => s.setActivePage)

  const setPct = (key) => (e) => setAssumptions({ [key]: Number(e.target.value) / 100 })
  const setNum = (key) => (e) => setAssumptions({ [key]: Number(e.target.value) })

  const updateTahap = (i, field, value) => {
    const tahapan = a.tahapan.map((t, idx) =>
      idx === i ? { ...t, [field]: value } : t
    )
    setAssumptions({ tahapan })
  }

  const totalCapex = a.tahapan
    .filter((t) => t.aktif)
    .reduce((s, t) => s + (t.capex || 0), 0)

  const handleSubmit = async () => {
    setError(null)
    if (!a.tahapan.some((t) => t.aktif && t.capex > 0)) {
      setError('Aktifkan minimal satu tahap dan isi nilai CAPEX pada bagian B.')
      return
    }
    setLoading(true)
    try {
      const res = await runSimulation(a)
      setResults(res.data)
      setActivePage('results')
    } catch (e) {
      const detail = e?.response?.data?.detail || e?.message || 'Terjadi kesalahan.'
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* A. Parameter Global */}
      <Section kode="A" judul="Parameter Global">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Tahun Awal Simulasi">
            <input type="number" className={inputCls} value={a.tahun_mulai}
              onChange={setNum('tahun_mulai')} />
          </Field>
          <Field label="Cost of Debt (% per tahun)" hint="Bunga pinjaman untuk anuitas">
            <input type="number" step="0.1" className={inputCls} value={toPct(a.cost_of_debt)}
              onChange={setPct('cost_of_debt')} />
          </Field>
          <Field label="Tenor Pinjaman (tahun)" hint="Lama cicilan anuitas">
            <input type="number" step="1" className={inputCls} value={a.tenor}
              onChange={setNum('tenor')} />
          </Field>
          <Field label="OPEX Rate (% dari CAPEX / tahun)" hint="Biaya operasi & pemeliharaan tahunan">
            <input type="number" step="0.1" className={inputCls} value={toPct(a.opex_rate)}
              onChange={setPct('opex_rate')} />
          </Field>
          <Field label="Masa Operasi (tahun)" hint="Lama aset beroperasi setelah konstruksi">
            <input type="number" step="1" className={inputCls} value={a.masa_operasi}
              onChange={setNum('masa_operasi')} />
          </Field>
        </div>
      </Section>

      {/* B. Tahapan Pembangunan */}
      <Section kode="B" judul="Tahapan Pembangunan — CAPEX & Jadwal" mangrove>
        <p className="mb-3 text-xs text-slate-500">
          Tiap baris = satu tahap pembangunan. CAPEX dalam Rupiah penuh
          (mis. 1.500.000.000 = Rp 1,5 Miliar).
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-laut-50 text-left text-xs uppercase tracking-wide text-laut-900">
                <th className="px-2 py-2 font-semibold">Nama Tahap</th>
                <th className="px-2 py-2 font-semibold">CAPEX (Rp)</th>
                <th className="px-2 py-2 font-semibold">Mulai Konstruksi</th>
                <th className="px-2 py-2 font-semibold">Durasi (thn)</th>
                <th className="px-2 py-2 text-center font-semibold">Aktif</th>
                <th className="px-2 py-2 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {a.tahapan.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-2 py-4 text-center text-slate-400">
                    Belum ada tahap. Tambahkan baris di bawah.
                  </td>
                </tr>
              )}
              {a.tahapan.map((t, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="min-w-32 px-2 py-1.5">
                    <input className={cellCls} value={t.nama}
                      onChange={(e) => updateTahap(i, 'nama', e.target.value)} />
                  </td>
                  <td className="min-w-44 px-2 py-1.5">
                    <RupiahCell
                      key={`capex-${i}-${t.capex}`}
                      value={t.capex}
                      onCommit={(n) => updateTahap(i, 'capex', n)}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="number" className={cellCls} value={t.tahun_mulai_konstruksi}
                      onChange={(e) => updateTahap(i, 'tahun_mulai_konstruksi', Number(e.target.value))} />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="number" className={cellCls} value={t.durasi_konstruksi}
                      onChange={(e) => updateTahap(i, 'durasi_konstruksi', Number(e.target.value))} />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <input type="checkbox" className="h-4 w-4 accent-laut-700" checked={t.aktif}
                      onChange={(e) => updateTahap(i, 'aktif', e.target.checked)} />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button type="button" onClick={() => removeTahap(i)}
                      className="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() =>
              addTahap({
                nama: `Tahap ${a.tahapan.length + 1}`,
                capex: 0,
                tahun_mulai_konstruksi:
                  (a.tahapan.at(-1)?.tahun_mulai_konstruksi ?? a.tahun_mulai) +
                  (a.tahapan.at(-1)?.durasi_konstruksi ?? 1),
                durasi_konstruksi: 3,
                aktif: true,
              })
            }
            className="rounded-md border border-dashed border-slate-400 px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-laut-700 hover:text-laut-700"
          >
            + Tambah Tahap
          </button>
          <p className="text-sm font-semibold text-laut-900">
            Total CAPEX aktif:{' '}
            <span className="text-mangrove-600">{formatRingkas(totalCapex)}</span>
          </p>
        </div>

        {/* Jadwal terhitung */}
        {a.tahapan.filter((t) => t.aktif && t.capex > 0).length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Jadwal terhitung (otomatis)
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-2 py-1.5 font-semibold">Tahap</th>
                    <th className="px-2 py-1.5 font-semibold">Konstruksi</th>
                    <th className="px-2 py-1.5 font-semibold">Cicilan Anuitas</th>
                    <th className="px-2 py-1.5 font-semibold">Masa Operasi</th>
                  </tr>
                </thead>
                <tbody>
                  {a.tahapan.filter((t) => t.aktif && t.capex > 0).map((t, i) => {
                    const selesai = t.tahun_mulai_konstruksi + t.durasi_konstruksi
                    return (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="px-2 py-1.5 font-medium text-laut-900">{t.nama}</td>
                        <td className="px-2 py-1.5">
                          {t.tahun_mulai_konstruksi}–{selesai - 1}
                        </td>
                        <td className="px-2 py-1.5">
                          {selesai}–{selesai + a.tenor - 1}
                        </td>
                        <td className="px-2 py-1.5">
                          {selesai}–{selesai + a.masa_operasi - 1}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Section>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Hitung */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-laut-700 px-6 py-3.5 text-base font-semibold text-white shadow-md hover:bg-laut-900 disabled:cursor-not-allowed disabled:bg-laut-500"
      >
        {isLoading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Menghitung...
          </>
        ) : (
          <>🔢 Hitung Simulasi</>
        )}
      </button>
    </div>
  )
}
