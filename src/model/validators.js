import Ajv from 'ajv'

import {exchangeSchema} from './schemas'

const ajv = new Ajv({removeAdditional: 'failing'})


// export const validateTransfer = ajv.compile(transferSchema)
export const validateExchange = ajv.compile(exchangeSchema)
