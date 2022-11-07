module.exports = {
  User: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      fullname: { type: 'string' },
      email: { type: 'string' },
      phone: { type: 'string' },
      password: { type: 'string' },
      token_verify: { type: 'string' },
      is_active: { type: 'boolean' },
      is_blocked: { type: 'boolean' },
      upload_id: { type: 'string' },
      role_id: { type: 'string' },
    },
  },
}
