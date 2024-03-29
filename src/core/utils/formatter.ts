import { type TOptions } from 'i18next'
import { validate as uuidValidate } from 'uuid'
import { i18n } from '~/config/i18n'
import { type IReqOptions } from '../interface/ReqOptions'
import ResponseError from '../modules/response/ResponseError'

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

/**
 *
 * @param value
 * @param options
 * @returns
 */
export function validateUUID(value: string, options?: IReqOptions): string {
  const i18nOpt: string | TOptions = { lng: options?.lang }

  if (!uuidValidate(value)) {
    const message = i18n.t('errors.incorrect_uuid_format', i18nOpt)
    throw new ResponseError.BadRequest(message)
  }

  return value
}
