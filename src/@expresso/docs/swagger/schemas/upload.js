module.exports = {
  Upload: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      key_file: { type: 'string' },
      filename: { type: 'string' },
      mimetype: { type: 'string' },
      size: { type: 'integer', format: 'int32' },
      signed_url: { type: 'string' },
      expiry_date_url: { type: 'string' },
    },
  },
}
