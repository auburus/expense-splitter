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
