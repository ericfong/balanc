import transferSchema from './transferSchema'

export default {
  properties: {
    transfers: {type: 'array', items: transferSchema},
  },
  additionalProperties: false,
}
