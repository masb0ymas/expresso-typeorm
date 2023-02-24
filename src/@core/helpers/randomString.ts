type RandomType = 'alphabetic' | 'numeric'

interface GetRandomEntity {
  type: RandomType
  length?: number
}

export function getRandom({ type, length }: GetRandomEntity): string {
  let result = ''

  const alphabetLower = 'abcdefghijklmnopqrstuvwxyz'
  const alphabetUpper = alphabetLower.toUpperCase()
  const numeric = '0123456789'

  // String Random
  if (type === 'alphabetic') {
    const defaultLength = length ?? 32

    const charString = `${alphabetLower}${alphabetUpper}${numeric}`
    const charLength = charString.length

    for (let i = 0; i < defaultLength; i += 1) {
      result += charString.charAt(Math.floor(Math.random() * charLength))
    }
  }

  // Number Random
  if (type === 'numeric') {
    const defaultLength = length ?? 6

    const charLength = numeric.length

    for (let i = 0; i < defaultLength; i += 1) {
      result += numeric[Math.floor(Math.random() * charLength)]
    }
  }

  return result
}
