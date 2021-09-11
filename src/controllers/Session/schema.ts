import * as yup from 'yup'

const create = yup
  .object()
  .shape({
    UserId: yup.string().required('user id is required'),
    token: yup.string().required('token is required'),
    ipAddress: yup.string(),
    device: yup.string(),
    platform: yup.string(),
    latitude: yup.string(),
    longitude: yup.string(),
  })
  .required()

const sessionSchema = { create }

export default sessionSchema
