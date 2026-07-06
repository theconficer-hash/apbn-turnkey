import { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import useSimStore from '../store/useSimStore'
import { formatRingkas, fmtPct } from '../utils/format'

const idFmt = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })

function Num({ value }) {
  if (value === null || value === undefined || value === 0)
    return <span className="text-slate-300">–</span>
  return <span>{formatRingkas(value)}</span>
}

function MetricCard({ title, value, sub, tone = 'laut' }) {
  const border =
    tone === 'hijau' ? 'border-t-mangrove-600'
    : tone === 'merah' ? 'border-t-red-500'
    : 'border-t-laut-700'
  const color =
    tone === 'hijau' ? 'text-mangrove-600'
    : tone === 'merah' ? 'text-red-600'
    : 'text-laut-900'
  return (
    <div className={'rounded-xl border border-slate-200 border-t-4 bg-white p-4 shadow-sm ' + border}>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {title}
      </div>
      <div className={'mt-1 text-2xl font-bold ' + color}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  )
}

const DETAIL_TABS = ['Grafik Beban', 'Tabel per Tahun', 'Ringkasan per Tahap']

const WARNA_TAHAP = ['#1F5E8C', '#1B7A5A', '#B45309', '#7C3AED', '#0E7490', '#BE123C']

export default function ResultsPage() {
  const results = useSimStore((s) => s.results)
  const assumptions = useSimStore((s) => s.assumptions)
  const setActivePage = useSimStore((s) => s.setActivePage)

  const [tab, setTab] = useState('Grafik Beban')

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <p className="text-lg text-slate-600">
          Belum ada simulasi. Silakan isi asumsi dulu.
        </p>
        <button
          type="button"
          onClick={() => setActivePage('input')}
          className="rounded-lg bg-laut-700 px-5 py-2 text-sm font-semibold text-white hover:bg-laut-900"
        >
          ← Ke Input Asumsi
        </button>
      </div>
    )
  }

  const r = results
  const m = r.metrics
  const years = r.tahun_aktif

  // Data grafik stacked: beban per tahap per tahun (anuitas + opex digabung per tahap)
  const stackedData = years.map((y) => {
    const row = { tahun: y }
    r.per_tahap.forEach((t) => {
      row[t.nama] =
        (t.anuitas_per_tahun[y] ?? 0) + (t.opex_per_tahun[y] ?? 0)
    })
    return row
  })

  const totalData = years.map((y) => ({
    tahun: y,
    anuitas: r.total_anuitas[y] ?? 0,
    opex: r.total_opex[y] ?? 0,
    total: r.total_beban[y] ?? 0,
  }))

  const triliun = (v) => (v / 1e12).toLocaleString('id-ID', { maximumFractionDigits: 2 })

  return (
    <div>
      {/* Kartu metrics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total CAPEX"
          value={formatRingkas(m.total_capex)}
          sub={`${m.jumlah_tahap} tahap aktif`}
        />
        <MetricCard
          title="Beban Puncak / Tahun"
          value={formatRingkas(m.beban_puncak)}
          sub={m.tahun_puncak ? `terjadi tahun ${m.tahun_puncak}` : null}
          tone="merah"
        />
        <MetricCard
          title="Total Kumulatif Beban"
          value={formatRingkas(m.total_kumulatif)}
          sub={`${years[0]}–${years.at(-1)}`}
          tone="hijau"
        />
        <MetricCard
          title="Parameter"
          value={`Tenor ${assumptions.tenor} thn`}
          sub={`CoD ${fmtPct(assumptions.cost_of_debt)} · OPEX ${fmtPct(assumptions.opex_rate)}/thn`}
        />
      </div>

      {/* Aksi */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActivePage('input')}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ✏️ Ubah Asumsi
        </button>
      </div>

      {/* Tab detail */}
      <div className="mb-2 flex flex-wrap gap-2 border-b border-slate-200">
        {DETAIL_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium ' +
              (tab === t
                ? 'border-laut-700 text-laut-900'
                : 'border-transparent text-slate-500 hover:text-slate-700')
            }
          >
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {tab === 'Grafik Beban' && (
          <div className="space-y-8">
            <div>
              <h3 className="mb-2 text-sm font-bold text-laut-900">
                Beban per Tahap (Rp Triliun / tahun)
              </h3>
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stackedData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tahun" />
                    <YAxis tickFormatter={triliun} width={70} />
                    <Tooltip formatter={(v) => formatRingkas(v)} />
                    <Legend />
                    {r.per_tahap.map((t, i) => (
                      <Bar
                        key={t.nama}
                        dataKey={t.nama}
                        stackId="beban"
                        fill={WARNA_TAHAP[i % WARNA_TAHAP.length]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-bold text-laut-900">
                Anuitas vs OPEX Total (Rp Triliun / tahun)
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={totalData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tahun" />
                    <YAxis tickFormatter={triliun} width={70} />
                    <Tooltip formatter={(v) => formatRingkas(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="anuitas" name="Total Anuitas" stroke="#1F5E8C" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="opex" name="Total OPEX" stroke="#1B7A5A" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="total" name="Total Beban" stroke="#dc2626" dot={false} strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {tab === 'Tabel per Tahun' && (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-laut-50">
                  <th className="sticky left-0 z-10 border-b border-slate-200 bg-laut-50 px-3 py-2 text-left font-semibold text-laut-900">
                    Tahun
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-semibold text-laut-900">
                    Total Anuitas
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-semibold text-laut-900">
                    Total OPEX
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-semibold text-laut-900">
                    Total Beban
                  </th>
                </tr>
              </thead>
              <tbody>
                {years.map((y) => (
                  <tr key={y}>
                    <td className="sticky left-0 z-10 border-b border-slate-100 bg-white px-3 py-1.5 font-medium">
                      {y}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-1.5 text-right tabular-nums">
                      <Num value={r.total_anuitas[y]} />
                    </td>
                    <td className="border-b border-slate-100 px-3 py-1.5 text-right tabular-nums">
                      <Num value={r.total_opex[y]} />
                    </td>
                    <td className="border-b border-slate-100 px-3 py-1.5 text-right font-semibold tabular-nums">
                      <Num value={r.total_beban[y]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'Ringkasan per Tahap' && (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-laut-50 text-xs uppercase tracking-wide text-laut-900">
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold">Tahap</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-semibold">CAPEX</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-semibold">Anuitas/thn</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-semibold">OPEX/thn</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-semibold">Beban/thn</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-semibold">Total Cicilan</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-center font-semibold">Konstruksi</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-center font-semibold">Cicilan</th>
                </tr>
              </thead>
              <tbody>
                {r.per_tahap.map((t) => (
                  <tr key={t.nama}>
                    <td className="border-b border-slate-100 px-3 py-1.5 font-medium text-laut-900">
                      {t.nama}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-1.5 text-right tabular-nums">
                      {formatRingkas(t.capex)}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-1.5 text-right tabular-nums">
                      {formatRingkas(t.anuitas_tahunan)}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-1.5 text-right tabular-nums">
                      {formatRingkas(t.opex_tahunan)}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-1.5 text-right font-semibold tabular-nums">
                      {formatRingkas(t.total_beban_tahunan)}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-1.5 text-right tabular-nums">
                      {formatRingkas(t.total_cicilan)}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-1.5 text-center">
                      {t.mulai_konstruksi}–{t.selesai_konstruksi}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-1.5 text-center">
                      {t.cicilan_mulai}–{t.cicilan_selesai}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-[11px] text-slate-400">
              Total cicilan = anuitas × tenor. Angka dibulatkan untuk tampilan
              ({idFmt.format(1)} = Rp 1).
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
