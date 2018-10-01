const unix = require('ipfs-unixfs')
const { DAGNode } = require('ipld-dag-pb')
const promise = f => (...args) => new Promise((a,b)=>f(...args, (err, res) => err ? b(err) : a(res)));

const createDag = promise(DAGNode.create)

export const fileIPFS = buffer => createDag(
    new unix('file', buffer).marshal()
).then(dagNode => dagNode.toJSON())

export const folderIPFS = buffer => promise(DAGNode.create)(
    new unix('file', buffer).marshal()
).then(dagNode => dagNode.toJSON().multihash)
