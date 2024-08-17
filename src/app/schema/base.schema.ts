import { z } from 'zod'

const multipleIds = z.string().array().nonempty({
  message: "ids can't be empty!",
})

const baseSchema = { multipleIds }

export default baseSchema
