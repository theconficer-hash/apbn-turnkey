import { useState } from 'react'
import {
  Landmark, CalendarClock, Hourglass, Wrench, Coins, CalendarDays,
  Blocks, HardHat, Search, ChevronDown, Info, ArrowRight, MessageCircle,
  BookText, Calculator, Sigma, SlidersHorizontal, SearchX, TrendingUp,
  BarChart3, Layers, Banknote, ClipboardList, Gauge,
} from 'lucide-react'
import useSimStore from '../store/useSimStore'

// Aksen warna per kelompok (kelas literal agar terbaca Tailwind)
const ACCENT = {
  laut: { tile: 'bg-laut-50 text-laut-700', bar: 'bg-laut-700', active: 'bg-laut-700' },
  cyan: { tile: 'bg-cyan-50 text-cyan-700', bar: 'bg-cyan-600', active: 'bg-cyan-600' },
  mangrove: { tile: 'bg-mangrove-50 text-mangrove-600', bar: 'bg-mangrove-600', active: 'bg-mangrove-600' },
}

// ---------------------------------------------------------------------------
const SECTIONS = [
  {
    id: 'A', label: 'A. Parameter Global', short: 'Parameter', ChipIcon: SlidersHorizontal, accent: 'laut',
    items: [
      {
        Icon: Landmark, judul: 'Cost of Debt (Bunga Pinjaman)',
        ringkas: 'Ongkos meminjam uang per tahun — dasar perhitungan anuitas.',
        sederhana:
          'Seperti KPR rumah: pemerintah "mencicil" tanggul yang sudah jadi kepada kontraktor/pemodal. Tiap tahun ada "sewa uang"-nya. Makin tinggi bunganya, makin berat cicilan tahunannya.',
        teknis:
          'Tingkat bunga efektif tahunan atas nilai CAPEX yang dikonversi menjadi cicilan anuitas tetap. Pinjaman domestik mengacu BI-Rate + marjin; pinjaman luar negeri mengacu LPR/SOFR + marjin.',
        contoh: 'CoD 6% atas CAPEX Rp 19,55 T dengan tenor 20 tahun → anuitas ±Rp 1,70 T per tahun.',
        rujukan: [{ label: 'Bank Indonesia — BI-Rate', url: 'https://www.bi.go.id' }],
      },
      {
        Icon: CalendarClock, judul: 'Tenor Pinjaman',
        ringkas: 'Lama waktu mencicil (dalam tahun).',
        sederhana:
          'Sama seperti memilih KPR 10 vs 20 tahun: tenor panjang membuat cicilan per tahun lebih ringan, tapi total bunga yang dibayar lebih besar.',
        teknis:
          'Jumlah tahun pembayaran anuitas, dimulai setelah konstruksi tahap selesai (serah terima turnkey). Tenor memengaruhi besaran anuitas dan profil beban APBN antar-tahun.',
        rumus: 'Anuitas = CAPEX × r / (1 − (1 + r)⁻ⁿ)',
        contoh: 'Tenor 20 tahun @6%: tiap Rp 1 T CAPEX ≈ cicilan Rp 87 M/tahun.',
        rujukan: [{ label: 'DJPPR Kemenkeu', url: 'https://www.djppr.kemenkeu.go.id' }],
      },
      {
        Icon: Coins, judul: 'Anuitas',
        ringkas: 'Cicilan tahunan tetap: pokok + bunga digabung rata.',
        sederhana:
          'Bayar cicilan dengan jumlah sama setiap tahun sampai lunas — di awal porsinya banyak bunga, makin lama makin banyak pokok. Nilainya tidak berubah, jadi mudah direncanakan di APBN.',
        teknis:
          'Pembayaran periodik tetap yang melunasi pokok + bunga selama tenor. Dihitung per tahap dari CAPEX tahap tersebut, aktif mulai tahun serah terima hingga tenor berakhir.',
        rumus: 'A = P × r / (1 − (1 + r)⁻ⁿ)',
        contoh: 'Semua tahap aktif dijumlahkan → garis "Total Anuitas" pada grafik hasil.',
        rujukan: [{ label: 'Kemenkeu — Pembiayaan', url: 'https://www.kemenkeu.go.id' }],
      },
      {
        Icon: Wrench, judul: 'OPEX Rate',
        ringkas: 'Biaya operasi & pemeliharaan tahunan, % dari CAPEX.',
        sederhana:
          'Punya rumah tidak berhenti di harga beli — ada biaya listrik, perawatan, perbaikan tiap tahun. Tanggul juga: pompa, pintu air, dan strukturnya butuh biaya rutin.',
        teknis:
          'Persentase tetap dari CAPEX awal (tanpa eskalasi) yang dibayarkan tiap tahun selama masa operasi, dimulai setelah konstruksi tahap selesai.',
        rumus: 'OPEX per tahun = CAPEX × opex_rate',
        contoh: 'OPEX 1% atas CAPEX Rp 19,55 T = Rp 195 M per tahun selama masa operasi.',
        rujukan: [{ label: 'Kementerian PU', url: 'https://www.pu.go.id' }],
      },
      {
        Icon: Hourglass, judul: 'Masa Operasi',
        ringkas: 'Berapa lama aset dioperasikan (dan OPEX dibayar).',
        sederhana:
          'Umur pakai tanggul setelah selesai dibangun. Selama masa ini pemerintah menanggung biaya operasinya — walau cicilan mungkin sudah lunas lebih dulu.',
        teknis:
          'Jumlah tahun OPEX aktif per tahap, dihitung sejak tahun serah terima. Masa operasi bisa lebih panjang dari tenor, sehingga di tahun-tahun akhir hanya tersisa beban OPEX.',
        contoh: 'Masa operasi 30 thn & tenor 20 thn → 10 tahun terakhir hanya membayar OPEX.',
        rujukan: [{ label: 'Kementerian PU', url: 'https://www.pu.go.id' }],
      },
      {
        Icon: CalendarDays, judul: 'Tahun Awal Simulasi',
        ringkas: 'Titik nol garis waktu simulasi.',
        sederhana: 'Tahun pertama yang muncul di tabel & grafik — biasanya tahun anggaran berjalan atau tahun rencana dimulai.',
        teknis: 'Sumbu waktu simulasi membentang dari tahun ini hingga cicilan dan masa operasi seluruh tahap berakhir (dihitung otomatis).',
        contoh: 'Default 2026; horizon akhir mengikuti tahap dengan jadwal paling panjang.',
        rujukan: [{ label: 'Kemenkeu — APBN', url: 'https://www.kemenkeu.go.id' }],
      },
    ],
  },
  {
    id: 'B', label: 'B. Tahapan & Skema', short: 'Tahapan', ChipIcon: Blocks, accent: 'cyan',
    items: [
      {
        Icon: Banknote, judul: 'CAPEX',
        ringkas: 'Biaya pembangunan (belanja modal) satu tahap.',
        sederhana:
          '"Harga beli" tanggulnya: seluruh biaya konstruksi fisik satu tahap. Di aplikasi ini diisi dalam Rupiah penuh — mis. 1.500.000.000 berarti Rp 1,5 miliar.',
        teknis:
          'Nilai investasi konstruksi per tahap dalam Rupiah penuh, tanpa eskalasi. Menjadi pokok pinjaman untuk anuitas dan dasar perhitungan OPEX.',
        contoh: 'Tahap 1 Semarang: CAPEX ±Rp 19,55 triliun.',
        rujukan: [{ label: 'Kementerian PU', url: 'https://www.pu.go.id' }],
      },
      {
        Icon: Layers, judul: 'Unbundling (Tahapan)',
        ringkas: 'Proyek besar dipecah menjadi beberapa tahap terpisah.',
        sederhana:
          'Daripada membangun semuanya sekaligus (dan membayar sekaligus), proyek dipotong per ruas/tahap. Tiap tahap punya jadwal, kontrak, dan cicilannya sendiri — beban APBN jadi tersebar.',
        teknis:
          'Setiap tahap disimulasikan independen: jadwal konstruksi, mulai cicilan, dan OPEX masing-masing. Total beban per tahun = penjumlahan seluruh tahap aktif.',
        contoh: 'Tahap 1 (2027–2029), Tahap 2 (2030–2034), dst — cicilannya saling bertumpuk di grafik.',
        rujukan: [{ label: 'Bappenas', url: 'https://www.bappenas.go.id' }],
      },
      {
        Icon: HardHat, judul: 'Turnkey',
        ringkas: 'Kontraktor membiayai & membangun dulu; dibayar setelah jadi.',
        sederhana:
          'Seperti pesan rumah ke developer: kita tidak membayar saat dibangun, tapi mencicil setelah kunci diserahkan. Pemerintah tidak keluar uang selama konstruksi — beban baru muncul setelah serah terima.',
        teknis:
          'Skema design-build-finance: pembayaran pemerintah dimulai pada tahun serah terima (selesai konstruksi) berupa anuitas selama tenor. Karena itu cicilan tiap tahap mulai pada tahun selesai konstruksinya.',
        contoh: 'Tahap selesai 2030 → cicilan pertama 2030, lunas 2049 (tenor 20 thn).',
        rujukan: [{ label: 'Kemenkeu — KPBU & Pembiayaan', url: 'https://www.kemenkeu.go.id' }],
      },
      {
        Icon: ClipboardList, judul: 'Durasi Konstruksi',
        ringkas: 'Lama pembangunan satu tahap (tahun).',
        sederhana: 'Berapa tahun tukang bekerja di lapangan untuk tahap itu. Menentukan kapan "kunci diserahkan" dan cicilan dimulai.',
        teknis: 'Tahun serah terima = tahun mulai konstruksi + durasi. Anuitas & OPEX aktif mulai tahun tersebut.',
        contoh: 'Mulai 2027 + durasi 3 thn → serah terima 2030.',
        rujukan: [{ label: 'Kementerian PU', url: 'https://www.pu.go.id' }],
      },
    ],
  },
  {
    id: 'C', label: 'C. Membaca Hasil', short: 'Hasil', ChipIcon: BarChart3, accent: 'mangrove',
    items: [
      {
        Icon: TrendingUp, judul: 'Beban Puncak',
        ringkas: 'Tahun dengan total pembayaran APBN tertinggi.',
        sederhana:
          'Saat beberapa tahap cicilannya bertumpuk di tahun yang sama, itulah "tanjakan" terberat bagi anggaran. Angka ini penting untuk mengecek kesanggupan fiskal.',
        teknis:
          'Maksimum dari total beban tahunan (Σ anuitas + OPEX seluruh tahap). Kartu hasil menampilkan nilai dan tahun terjadinya.',
        contoh: 'Menggeser jadwal tahap (unbundling) dapat menurunkan beban puncak.',
        rujukan: [{ label: 'Kemenkeu — APBN', url: 'https://www.kemenkeu.go.id' }],
      },
      {
        Icon: Gauge, judul: 'Total Kumulatif Beban',
        ringkas: 'Seluruh uang yang dikeluarkan sepanjang horizon simulasi.',
        sederhana:
          'Kalau semua cicilan dan biaya operasi dari tahun pertama sampai terakhir dijumlahkan, itulah "harga sesungguhnya" proyek bagi negara — selalu lebih besar dari CAPEX karena ada bunga.',
        teknis:
          'Σ total beban seluruh tahun = (anuitas × tenor + OPEX × masa operasi) dijumlahkan semua tahap. Selisihnya terhadap total CAPEX mencerminkan biaya bunga + O&M.',
        contoh: 'CAPEX Rp 19,55 T @6%/20thn + OPEX 1%/30thn → kumulatif ±Rp 40 T.',
        rujukan: [{ label: 'Kemenkeu — APBN', url: 'https://www.kemenkeu.go.id' }],
      },
      {
        Icon: BarChart3, judul: 'Grafik Beban per Tahap',
        ringkas: 'Batang bertumpuk: kontribusi tiap tahap per tahun.',
        sederhana:
          'Setiap warna = satu tahap. Tinggi total batang = beban APBN tahun itu. Dari sini terlihat kapan cicilan saling bertumpuk dan kapan mulai melandai.',
        teknis:
          'Stacked bar (anuitas + OPEX per tahap). Grafik garis di bawahnya memisahkan komponen: Total Anuitas, Total OPEX, dan Total Beban.',
        contoh: 'Puncak biasanya terjadi saat semua tahap sama-sama masih dalam masa cicilan.',
        rujukan: [{ label: 'Bappenas', url: 'https://www.bappenas.go.id' }],
      },
    ],
  },
]

const TOTAL_ISTILAH = SECTIONS.reduce((n, s) => n + s.items.length, 0)

// ---------------------------------------------------------------------------
function TermCard({ item, accent, open, onToggle }) {
  const { Icon } = item
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* bar aksen kiri */}
      <div className={'absolute inset-y-0 left-0 w-1 ' + accent.bar} />

      <button type="button" onClick={onToggle} className="flex w-full items-center gap-4 px-5 py-4 pl-6 text-left">
        <span className={'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ' + accent.tile}>
          <Icon size={26} strokeWidth={2} />
        </span>
        <span className="flex-1">
          <span className="block text-lg font-bold leading-tight text-laut-900">{item.judul}</span>
          <span className="mt-1 block text-sm leading-snug text-slate-500">{item.ringkas}</span>
        </span>
        <ChevronDown
          size={20}
          className={'shrink-0 text-slate-400 transition-transform group-hover:text-laut-700 ' + (open ? 'rotate-180' : '')}
        />
      </button>

      {open && (
        <div className="px-6 pb-5 pt-1">
          {/* Analogi */}
          <div className="rounded-xl bg-laut-50 px-4 py-3">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-laut-700">
              <MessageCircle size={14} /> Analogi sederhana
            </div>
            <p className="text-[15px] leading-relaxed text-slate-700">{item.sederhana}</p>
          </div>

          {/* Teknis */}
          <div className="mt-3 px-1">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <BookText size={14} /> Penjelasan teknis
            </div>
            <p className="text-[15px] leading-relaxed text-slate-600">{item.teknis}</p>
          </div>

          {/* Rumus (opsional) */}
          {item.rumus && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
              <Sigma size={16} className="shrink-0 text-slate-400" />
              <code className="text-[13px] font-semibold text-slate-700">{item.rumus}</code>
            </div>
          )}

          {/* Contoh */}
          <div className="mt-3 rounded-xl bg-mangrove-50 px-4 py-3">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-mangrove-700">
              <Calculator size={14} /> Di simulasi ini
            </div>
            <p className="text-[15px] leading-relaxed text-mangrove-700">{item.contoh}</p>
          </div>

          {/* Rujukan */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rujukan resmi</span>
            {item.rujukan.map((r) => (
              <a key={r.label} href={r.url} target="_blank" rel="noreferrer"
                className="rounded-full border border-laut-100 bg-laut-50 px-3.5 py-1.5 text-xs font-semibold text-laut-700 transition hover:bg-laut-100">
                {r.label} ↗
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
export default function GuidePage() {
  const [tab, setTab] = useState('A')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState(null)
  const setActivePage = useSimStore((s) => s.setActivePage)

  const q = query.trim().toLowerCase()
  const searching = q.length > 0

  const visible = searching
    ? SECTIONS.map((s) => ({
        ...s,
        items: s.items.filter(
          (i) =>
            i.judul.toLowerCase().includes(q) ||
            i.ringkas.toLowerCase().includes(q) ||
            i.sederhana.toLowerCase().includes(q) ||
            i.teknis.toLowerCase().includes(q)
        ),
      })).filter((s) => s.items.length > 0)
    : SECTIONS.filter((s) => s.id === tab)

  const totalHasil = visible.reduce((n, s) => n + s.items.length, 0)

  return (
    <div>
      {/* Intro */}
      <div className="mb-5 rounded-3xl border border-laut-100 bg-gradient-to-br from-laut-50 to-white p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight text-laut-900 sm:text-3xl">
            Kamus Istilah Asumsi
          </h2>
          <span className="rounded-full bg-laut-700 px-2.5 py-0.5 text-xs font-bold text-white">
            {TOTAL_ISTILAH} istilah
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600">
          Kenali dulu istilah-istilahnya sebelum mengisi <b>Input Asumsi</b> —
          dijelaskan dengan bahasa sehari-hari, lengkap dengan contoh pada skema
          APBN Turnkey serta rujukan resmi untuk memutakhirkan angka.{' '}
          <span className="font-bold text-laut-700">#BikinPaham</span>
        </p>
      </div>

      {/* Bar pencarian + kategori (menempel saat scroll) */}
      <div className="sticky top-0 z-20 -mx-6 mb-5 border-b border-slate-200 bg-[#F5F8FB]/85 px-6 py-3 backdrop-blur">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpenId(null) }}
            placeholder="Cari istilah… (mis. anuitas, tenor, turnkey)"
            className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-[15px] shadow-sm outline-none transition focus:border-laut-700 focus:ring-2 focus:ring-laut-700/20"
          />
        </div>

        {!searching && (
          <div className="mt-3 flex flex-wrap gap-2">
            {SECTIONS.map((s) => {
              const acc = ACCENT[s.accent]
              const active = tab === s.id
              const { ChipIcon } = s
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { setTab(s.id); setOpenId(null) }}
                  className={
                    'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ' +
                    (active
                      ? acc.active + ' border-transparent text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300')
                  }
                >
                  <ChipIcon size={16} strokeWidth={2.4} />
                  {s.short}
                  <span className={'rounded-full px-1.5 text-xs ' + (active ? 'bg-white/25' : 'bg-slate-100 text-slate-500')}>
                    {s.items.length}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {searching && (
          <p className="mt-2 text-[13px] text-slate-500">
            {totalHasil > 0 ? `${totalHasil} istilah cocok dengan "${query}"` : `Tidak ada hasil untuk "${query}".`}
          </p>
        )}
      </div>

      {/* Kartu istilah */}
      {searching && totalHasil === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <SearchX size={40} className="text-slate-300" />
          <p className="text-slate-500">
            Coba kata kunci lain, mis. <b>anuitas</b>, <b>tenor</b>, atau <b>turnkey</b>.
          </p>
        </div>
      ) : (
        visible.map((s) => (
          <div key={s.id} className="mb-6">
            {searching && (
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{s.label}</h3>
            )}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {s.items.map((item) => {
                const id = s.id + item.judul
                return (
                  <TermCard
                    key={id}
                    item={item}
                    accent={ACCENT[s.accent]}
                    open={openId === id}
                    onToggle={() => setOpenId(openId === id ? null : id)}
                  />
                )
              })}
            </div>
          </div>
        ))
      )}

      {/* CTA */}
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="flex items-center gap-2 text-[13px] text-slate-500">
          <Info size={16} className="shrink-0 text-laut-700" />
          Angka default adalah <b>asumsi awal</b> — selalu verifikasi ke sumber resmi
          sebelum digunakan untuk pengambilan keputusan.
        </p>
        <button
          type="button"
          onClick={() => setActivePage('input')}
          className="flex items-center gap-2 rounded-xl bg-laut-700 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-laut-900"
        >
          Lanjut ke Input Asumsi
          <ArrowRight size={17} />
        </button>
      </div>
    </div>
  )
}
