#!/usr/bin/env node

import { WebSocketServer } from 'ws'
import http from 'http'
import * as fs from 'fs'
import * as number from 'lib0/number'
import { setupWSConnection, setContentInitializor, docs } from './node_modules/@y/websocket-server/src/utils.js'

setContentInitializor(async (ydoc) => {
  const docName = ydoc.name
  const filePath = `./data${docName}`
  
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const ytext = ydoc.getText('content')
      ytext.insert(0, fileContent)
      console.log(`Initialized document ${docName} from ${filePath}`)
    }
  } catch (err) {
    console.error(`Error initializing document ${docName} from file:`, err)
  }
})

const saveDocToFile = (doc) => {
  const docName = doc.name
  const filePath = `./data${docName}`
  
  try {
    if (!fs.existsSync('./data')) {
      fs.mkdirSync('./data', { recursive: true })
    }
    
    const content = doc.getText('content').toString()
    fs.writeFileSync(filePath, content)
    console.log(`Saved document ${docName} to ${filePath}`)
  } catch (err) {
    console.error(`Error saving document ${docName} to file:`, err)
  }
}

const wss = new WebSocketServer({ noServer: true })
const host = process.env.HOST || 'localhost'
const port = number.parseInt(process.env.PORT || '1234')

const server = http.createServer((_request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('okay')
})

const saveInterval = 5000
setInterval(() => {
  docs.forEach(doc => {
    if (doc.conns.size > 0) {
      saveDocToFile(doc)
    }
  })
}, saveInterval)

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req)
})

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, ws => {
    wss.emit('connection', ws, request)
  })
})

if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data', { recursive: true })
}

server.listen(port, host, () => {
  console.log(`Server running at '${host}' on port ${port}`)
  console.log(`Document data will be saved to and loaded from ./data/ as text files`)
}) 