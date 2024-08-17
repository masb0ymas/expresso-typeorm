/**
 *
 * @param string
 * @returns
 */
export function capitalizeFirstLetter(string: string): string {
  const regex = /[-`~!@#$%^&*_|=?;:'",<>]/gi

  const first_word = string.charAt(0).toUpperCase()
  const last_word = string.slice(1)?.split(regex)?.join(' ')

  const new_word = `${first_word}${last_word}`
  const split_word = new_word.split(' ')

  const result = split_word
    .map((word) => {
      const first_split_word = word.charAt(0).toUpperCase()
      return `${first_split_word}${word.slice(1)}`
    })
    .join(' ')

  return result
}
