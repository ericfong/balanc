
export const transferSchema =  {
  required: ['from', 'to', 'price', 'item'],
  properties: {
    // from, to
    from: {type: 'string'},       // email, tel(e164), email|tel/name
    to: {type: 'string'},

    // data
    price: {type: 'number'},
    item: {type: 'string'},
    quantity: {type: 'number', default: 1},
    // extra
    description: {type: 'string'},
    data: {type: 'object'},

    // state (only mutable fields)
    isPending: {type: 'boolean'},
    arrivedAt: {type: 'object', format: 'date'},  // actual product / service delivered / physical money checked
    settledAt: {type: 'object', format: 'date'},  // ALL transfers for this exchange have been delivered

    // timestamp
    // tmpAt: {type: 'object', format: 'date'},
    // createdAt: {type: 'object', format: 'date'},
    // updatedAt: {type: 'object', format: 'date'},
    // removedAt: {type: 'object', format: 'date'},

    // replace a transfer
    version: {type: 'number', default: 0},      // version for this transfer
    replacedById: {type: 'string'},             // in original transfer
    replacedForId: {type: 'string'},            // in reverse transfer

    // not used
    // expireAt: {type: 'object', format: 'date'},    // default auto remove unless domain have been paid
  },
  type: 'object',
  additionalProperties: false,
}


export const exchangeSchema = {
  properties: {
    _id: {type: ['string', 'number']},

    transfers: {type: 'array', items: transferSchema},

    // domain: {type: 'string'},     // for calc usage by domain
    // parent exchange number
    tmpNumber: {type: 'number'},
    // number: {type: 'string'},
  },
  additionalProperties: false,
}
