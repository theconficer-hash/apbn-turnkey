// Utilitas unduh: blob (Excel dari backend) & grafik SVG (Recharts) -> PNG

export function triggerBlobDownload(blobData, filename) {
  const url = URL.createObjectURL(new Blob([blobData]))
  triggerDownload(url, filename)
}

// container: elemen DOM yang berisi <svg> Recharts
export function downloadChartPNG(container, filename, scale = 2) {
  const svg = container?.querySelector('svg')
  if (!svg) return

  const { width, height } = svg.getBoundingClientRect()
  const clone = svg.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', width)
  clone.setAttribute('height', height)

  const svgText = new XMLSerializer().serializeToString(clone)
  const svgUrl = URL.createObjectURL(
    new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
  )

  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = width * scale
    canvas.height = height * scale
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff' // latar putih (SVG transparan)
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.scale(scale, scale)
    ctx.drawImage(img, 0, 0, width, height)
    URL.revokeObjectURL(svgUrl)
    canvas.toBlob((blob) => triggerDownload(URL.createObjectURL(blob), filename), 'image/png')
  }
  img.src = svgUrl
}

function triggerDownload(url, filename) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
