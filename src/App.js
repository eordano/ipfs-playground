import React, { Component } from 'react';
import { Form, Grid, Header, Segment } from 'semantic-ui-react'
import { fileIPFS } from './ipfs'

const CID = require('cids')
const MemoryDatastore = require('interface-datastore').MemoryDatastore
const pull = require('pull-stream')

const Importer = require('ipfs-unixfs-engine').Importer

const MemoryStore = new MemoryDatastore()

const ipfsFromFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async function(evt) {
      resolve(await fileIPFS(evt.target.result))
    }
    reader.readAsBinaryString(file)
  })
}

class App extends Component {
    async alertFile(ev) {
        if (ev.target.files && ev.target.files.length) {
            alert((await ipfsFromFile(ev.target.files[0])).multihash)
        }
    }
    async getFolder(ev) {
        return new Promise((resolve, reject) => {
            const importer = new Importer(MemoryStore)
            const paths = []
            for (let file of ev.target.files) {
                const path = '/' + file.webkitRelativePath
                paths.push({ file, path })
            }
            const files = []
            pull(
                pull.values(paths),
                pull.asyncMap((file, cb) => {
                    const reader = new FileReader()
                    reader.addEventListener('loadend', () => {
                        const data = {
                            path: file.path,
                            content: Buffer.from(reader.result)
                        }
                        cb(null, data)
                    })
                    reader.readAsArrayBuffer(file.file)
                }),
                importer,
                pull.map((a, b) => {
                    if (!a.path.startsWith('/')) a.path = '/' + a.path
                    return files.push(a)
                }),
                pull.onEnd(() => importer.flush(
                    (err, f) => err ? reject(err) : resolve({
                        cid: new CID(f),
                        files
                    })
                ))
            )
        })
    }

    async alertFolder(ev) {
        const d = await(this.getFolder(ev))
        console.log(d.cid.toBaseEncodedString(), d.files)
        alert(d.cid.toBaseEncodedString())
    }

    componentDidMount() {
        if (this.dirInput) {
            this.dirInput.webkitdirectory = true
            this.dirInput.directory = true
        }
    }

  render() {
    return (
      <div className="App">
            <Segment
                    inverted
                    textAlign='center'
                    style={{ minHeight: 180, padding: '1em 0em'  }}
                    vertical>
                <Header as='h1' style={{ marginTop: '2em' }}>
                    IPFS Playground
                </Header>
                <Grid container verticalAlign='middle'>
                    <Grid.Column style={{ maxWidth: 650, margin: 'auto'}}>
                    <Header as='h2' color='teal' textAlign='center'>
                      IPFS multihash calculator
                    </Header>
                    <Form size='large' >
                      <Segment inverted className='grid container' >
                        <input type="file" className="inputfile" id="fileinput" onChange={(ev) => this.alertFile(ev)}/>
                        <label htmlFor="fileinput" className="ui huge teal right floated button" style={{ margin: 'auto' }}>
                            <i className="ui upload icon"></i>Upload File
                        </label>
                      </Segment>
                      <Segment inverted className='grid container' >
                        <input type="file" multiple className="inputfile" id="folderinput" ref={(ref) => this.dirInput = ref} onChange={(ev) => this.alertFolder(ev)}/>
                        <label htmlFor="folderinput" className="ui huge teal right floated button" style={{ margin: 'auto' }}>
                            <i className="ui upload icon"></i>Upload a Folder
                        </label>
                      </Segment>
                    </Form>
              </Grid.Column>

                </Grid>
            </Segment>
      </div>
    );
  }
}

export default App;
