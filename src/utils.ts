export function unevenSplit(total: number, parts: number) {
  // Lets operate in integers
  const n = Math.round(total * 100)

  const part = Math.round(n / parts)
  const remainder = n - part * parts

  // We know that reminder is a number between [-parts/2, .., parts/2 ].
  // eg:
  //   6 -> [-3,-2, -1, 0, 1, 2, 3]
  //   7 -> [-3, -2, -1, 0, 1, 2, 3]

  const ret = new Array(parts).fill(part)

  // Distribute the reminder evently among the parts.
  // Which part it gets to doesn't matter
  for (let i = 0; i < Math.abs(remainder); i++) {
    ret[i] += 1 * Math.sign(remainder)
  }

  return ret.map((x) => x / 100)
}

export function formatCurrency(amount: number, opts: object = {}): string {
  return Intl.NumberFormat('es-es', { style: 'currency', currency: 'EUR', ...opts }).format(amount)
}

export function randomColor(n: number): string {
  // const colors = ["#002b36", "#073642", "#586e75", "#657b83", "#839496", "#93a1a1", "#eee8d5", "#fdf6e3", "#b58900", "#cb4b16", "#dc322f", "#d33682", "#6c71c4", "#268bd2", "#2aa198", "#859900"]
  const colors = ['#5F6062', '#AFB8C1', '#849E97', '#DBBDA1', '#DECAC1']
  return colors[Math.abs(n) % colors.length]
}
