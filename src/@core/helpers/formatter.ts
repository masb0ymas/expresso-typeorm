import chalk from 'chalk'
import _ from 'lodash'
import { validate as uuidValidate } from 'uuid'

const emptyValues = [null, undefined, '', 'null', 'undefined']
const invalidValues = [...emptyValues, false, 0, 'false', '0']

/**
 *
 * @param value
 * @returns
 */
export function arrayFormatter(value: string | string[]): any[] {
  // check value not empty
  if (!_.isEmpty(value)) {
    // check array
    if (Array.isArray(value)) {
      return value
    }

    // parse string json to array
    const parseJson = JSON.parse(value)
    if (Array.isArray(parseJson)) {
      return parseJson
    }

    return []
  }

  return []
}

/**
 *
 * @param value
 * @returns
 */
export function validateEmpty(value: any): any {
  if (emptyValues.includes(value)) {
    return null
  }

  return value
}

/**
 *
 * @param value
 * @returns
 */
export function validateBoolean(value: any): boolean {
  if (invalidValues.includes(value)) {
    return false
  }

  return true
}

/**
 *
 * @param value
 * @returns
 */
export function validateUUID(value: string): string {
  if (!uuidValidate(value)) {
    throw new Error('incorrect uuid format')
  }

  return value
}

/**
 *
 * @param value
 * @returns
 */
function isNumeric(value: any): boolean {
  return !_.isNaN(parseFloat(value)) && _.isFinite(value)
}

/**
 *
 * @param value
 * @returns
 */
export function validateNumber(value: any): number {
  if (isNumeric(Number(value))) {
    return Number(value)
  }

  return 0
}

/**
 *
 * @param type
 * @param message
 * @returns
 */
export function logServer(type: string, message: string): string {
  const logName = chalk.green('[server]:')
  const newType = chalk.blue(type)
  const newMessage = chalk.green(message)

  const result = `${logName} ${newType} ${newMessage}`

  return result
}

/**
 *
 * @param type
 * @param message
 * @returns
 */
export function logErrServer(type: string, message: string): string {
  const logName = chalk.green('[server]:')
  const newType = chalk.red(type)
  const newMessage = chalk.green(message)

  const result = `${logName} ${newType} ${newMessage}`

  return result
}
