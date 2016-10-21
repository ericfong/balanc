
export default typeof window === 'object' ? require('./browser').default : function() {
  throw new Error('createPdf only supported in browser')
}
