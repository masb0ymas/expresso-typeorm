import BaseResponse from './BaseResponse'

class InternalServer extends BaseResponse {
  constructor(message: string) {
    super(message, 'Internal Server', 500)
    Object.setPrototypeOf(this, InternalServer.prototype)
  }
}

export default InternalServer
