
export default {
  // required: ['domain', 'from', 'to', 'createdAt'],
  required: ['from', 'to', 'createdAt'],
  additionalProperties: false,
  properties: {

    number: {type: 'number'},
    remoteNumber: {type: 'string'},

    // from, to
    domain: {type: 'string'},
    from: {type: 'string'},
    to: {type: 'string'},

    transfers: {
      type: 'object',
      patternProperties: {
        '.+': {
          type: 'object',
          required: ['price'],
          properties: {
            price: {
              // the default currency value for this price of unit
              type: 'number',
            },
            quantity: {
              // when quantity is negative, that means it is a void transaction
              type: 'number',
            },

            // References
            description: {type: 'string'},
            data: {type: 'object'},
          },
        },
      },
    },

    // once item arrived/delivered, remove from this list
    pendings: {
      type: 'array',
      items: {
        // key in transfers
        type: 'string',
      },
      uniqueItems: true,
    },
    arrivedAts: {
      type: 'object',
      patternProperties: {
        '.+': {type: 'object', format: 'date'},
      },
    },


    // references
    description: {type: 'string'},
    data: {type: 'object'},


    // State
    arrivedAt: {type: 'object', format: 'date'},  // actual product / service delivered / physical money checked
    paidAt: {type: 'object', format: 'date'},  // The reverse of transfers have been delivered
    cancelledById: {type: 'string'}, // in original transfer
    cancelledForId: {type: 'string'}, // in reverse transfer


    createdAt: {type: 'object', format: 'date'},
  },
}
