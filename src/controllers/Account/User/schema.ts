import * as yup from 'yup'

const createPassword = yup
  .object({
    new_password: yup
      .string()
      .min(8, 'at least 8 characters')
      .oneOf([yup.ref('confirm_new_password')], 'passwords are not the same'),
    confirm_new_password: yup
      .string()
      .min(8, 'at least 8 characters')
      .oneOf([yup.ref('new_password')], 'passwords are not the same'),
  })
  .required()

const create = yup.object({
  ...createPassword.fields,
  fullname: yup.string().required('full name is required'),
  email: yup.string().email('invalid email').required('email is required'),
  phone: yup.string().nullable(),
  token_verify: yup.string().nullable(),
  upload_id: yup.string().nullable(),
  is_active: yup.boolean().required('is active is required'),
  role_id: yup.string().required('role is required'),
})

const register = yup
  .object({
    ...createPassword.fields,
    ...create.fields,
  })
  .required()

const login = yup
  .object({
    email: yup.string().email('invalid email').required('email is required'),
    password: yup.string().required('password is required'),
  })
  .required()

const userSchema = { createPassword, create, register, login }

export default userSchema
