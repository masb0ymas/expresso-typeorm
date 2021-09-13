import withState from '@expresso/helpers/withState'

declare global {
  namespace Express {
    interface Request extends withState {
      state: object
    }
  }
}
