from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket
import json
MESSAGES = [
  {
	"type": "SET_BOARD", 
	"board": [
	  {"id": 0, "shape": "squiggle", "fill": "solid", "number": 1, "color": "red" },
	  {"id": 1, "shape": "diamond", "fill": "striped", "number": 2, "color": "green" },
	  {"id": 2, "shape": "oval", "fill": "empty", "number": 3, "color": "purple" },
	  {"id": 5, "shape": "oval", "fill": "empty", "number": 3, "color": "purple" },
	  {"id": 6, "shape": "oval", "fill": "empty", "number": 3, "color": "purple" },
	  {"id": 7, "shape": "oval", "fill": "empty", "number": 3, "color": "purple" },
	  {"id": 8, "shape": "oval", "fill": "empty", "number": 3, "color": "purple" },
	  {"id": 9, "shape": "oval", "fill": "empty", "number": 3, "color": "purple" },
	  {"id": 10, "shape": "oval", "fill": "empty", "number": 3, "color": "purple" },
	  {"id": 11, "shape": "oval", "fill": "empty", "number": 3, "color": "purple" },
	]
},
{
	"type": "SET_BOARD",
 	"board": [
	  {"id": 2, "shape": "oval", "fill": "empty", "number": 3, "color": "purple" },
	  {"id": 5, "shape": "oval", "fill": "empty", "number": 3, "color": "purple" },
	  {"id": 6, "shape": "oval", "fill": "empty", "number": 3, "color": "purple" },
	]
}
]
class SimpleEcho(WebSocket):
    i = 0

    def handleMessage(self):
        # echo message back to client
	print "got message: ", self.data
        print "sending: ", MESSAGES[self.i]
        self.sendMessage(json.dumps(MESSAGES[self.i]))
        self.i += 1

    def handleConnected(self):
        print self.address, 'connected'

    def handleClose(self):
        print self.address, 'closed'

server = SimpleWebSocketServer('', 8080, SimpleEcho)
server.serveforever()
