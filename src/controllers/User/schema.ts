import * as yup from 'yup'

const createPassword = yup
  .object()
  .shape({
    newPassword: yup
      .string()
      .min(8, 'at least 8 characters')
      .oneOf([yup.ref('confirmNewPassword')], 'passwords are not the same'),
    confirmNewPassword: yup
      .string()
      .min(8, 'at least 8 characters')
      .oneOf([yup.ref('newPassword')], 'passwords are not the same'),
  })
  .required()

const register = yup
  .object()
  .shape({
    ...createPassword.fields,
    firstName: yup.string().required('first name is required'),
    lastName: yup.string().required('last name is required'),
    email: yup.string().email('invalid email').required('email is required'),
    phone: yup.string(),
    RoleId: yup.string().required('role is required'),
  })
  .required()

const userSchema = { createPassword, register }

export default userSchema
