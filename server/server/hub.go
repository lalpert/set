// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package main

import (
	"log"
    "encoding/json"
)

// hub maintains the set of active connections and broadcasts messages to the
// connections.
type hub struct {
	// Registered connections.
	connections map[*connection]bool

	// Inbound messages from the connections.
	broadcast chan connectionWithMessage

	// Register requests from the connections.
	register chan *connection

	// Unregister requests from connections.
	unregister chan *connection

	// Keep track of clients for ids
	idConnectionMap map[string]*connection
}

type connectionWithMessage struct {
	connection *connection
	message    []byte
}

var hubSingleton = hub{
	broadcast:       make(chan (connectionWithMessage)),
	register:        make(chan *connection),
	unregister:      make(chan *connection),
	connections:     make(map[*connection]bool),
	idConnectionMap: make(map[string]*connection),
}

// Request represents a message coming from the client
type Request struct {
	Type string
}

// Deserialize unmarshals a byte array into a Request object
func Deserialize(input []byte) (*Request, error) {
	var message = &Request{}
	err := json.Unmarshal(input, message)
	return message, err
}

func (h *hub) run() {
    api.initGame()
	for {
		select {
		case c := <-h.register:
            log.Println("Register connection " + c)
			h.connections[c] = true

		case c := <-h.unregister:
            log.Println("Unegister connection " + c)
			if _, ok := h.connections[c]; ok {
                api.unregisterConnection(c)
				delete(h.connections, c)
				close(c.send)
			}

		case broadcaseMsg := <-h.broadcast:
            log.Println("Got a boardcast message " + broadcaseMsg)
        	incomingConnection := broadcaseMsg.connection
            log.Println("incomingConnection " + incomingConnection)
            message := broadcaseMsg.message
            request, err := types.Deserialize(payload)
			if err != nil {
				log.Println("Error deserializing: ", err)
				continue
			}
			log.Println(message)
            api.handleMsg(incomingConnection, message)	
			
		}
	}
}
