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

export { normalizePort }
