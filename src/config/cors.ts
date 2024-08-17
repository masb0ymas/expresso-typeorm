import { CorsOptions } from 'cors'
import allowedOrigin from '~/core/constant/allowedOrigin'

/**
 * Initialize Cors
 */
export const corsOptions: CorsOptions = {
  // Restrict Allowed Origin
  origin: allowedOrigin,
}
