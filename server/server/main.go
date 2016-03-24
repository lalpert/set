package main

import (
	"flag"
	"log"
	"math/rand"
	"net/http"
	"time"
)

var addr = flag.String("addr", ":8080", "http service address")

func main() {
	log.Println("Hey!")
	flag.Parse()
	rand.Seed(time.Now().UnixNano())
	go hubSingleton.run()
	http.HandleFunc("/ws", serveWs)
	err := http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
