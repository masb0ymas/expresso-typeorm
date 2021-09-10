const invalidValues = [
  null,
  undefined,
  '',
  false,
  0,
  'false',
  '0',
  'null',
  'undefined',
]

function validateBoolean(value: string | boolean | number | any): boolean {
  if (invalidValues.includes(value)) {
    return false
  }

  return true
}

function normalizePort(value: string): number | string | boolean {
  const port = parseInt(value, 10)

  if (Number.isNaN(port)) {
    // named pipe
    return value
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

export { normalizePort, validateBoolean }
