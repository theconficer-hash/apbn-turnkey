// Utilitas format angka Rupiah (gaya Indonesia, pemisah ribuan ".")

const idFmt = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })

// 1000000 -> "1.000.000"
export const formatRibuan = (v) => idFmt.format(Math.round(Number(v) || 0))

// "1.000.000" / "Rp 1.000.000" -> 1000000
export const parseRibuan = (teks) => {
  const bersih = String(teks).replace(/[^\d]/g, '')
  return bersih ? Number(bersih) : 0
}

// Ringkas: 19_553_707_085_455 -> "Rp 19,55 T"
export const formatRingkas = (v) => {
  const n = Number(v) || 0
  const abs = Math.abs(n)
  if (abs >= 1e12) return `Rp ${(n / 1e12).toLocaleString('id-ID', { maximumFractionDigits: 2 })} T`
  if (abs >= 1e9) return `Rp ${(n / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 2 })} M`
  if (abs >= 1e6) return `Rp ${(n / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 2 })} Jt`
  return `Rp ${idFmt.format(n)}`
}

export const fmtPct = (v) => `${(Number(v) * 100).toLocaleString('id-ID', { maximumFractionDigits: 2 })}%`
