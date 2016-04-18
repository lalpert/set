/**
 * Created by russell on 4/15/16.
 */

import Storage from './Storage'

// TODO: reloadConfig probably shouldn't be passed in. Need to refactor
export default (address, store, reloadConfig, processMessage) => {
  var reconnectDelay = 10;
  const MaxReconnectDelay = 5000;
  const queue = [];
  const connect = () => {
    const ws = new WebSocket(address);
    ws.onopen = () => {
      store.dispatch({type: "ADD_WS", ws: ws});
      const player = store.getState().player;
      console.log("name", player.name);
      if (player.id) {
        send({type: "REJOIN_GAME", id: player.id, secret: player.secret});
      } else {
        send({type: "JOIN_GAME", name: player.name});
      }
      const queueCopy = queue.slice();
      queue.length = 0;
      queueCopy.forEach(send);
      reconnectDelay = 10;
    };

    ws.onmessage = (msg) => {
      const message = JSON.parse(msg.data);
      console.log(msg.data);
      if (!message.type) {
        console.warn("No type defined! Msg:", msg.data);
      } else if (message.type == "ERROR") {
        store.dispatch({type: "CLEAR"});
        Storage.clearConfig().then(() => {
          reloadConfig(store.dispatch)
        }).then(connect);
      } else {
        store.dispatch(processMessage(message));
      }
    };

    ws.onerror = (err) => {
      console.warn("connection error: ", err.message);
      setTimeout(connect, reconnectDelay);
      reconnectDelay *= 2;
      reconnectDelay = Math.min(reconnectDelay, MaxReconnectDelay);
    };

    ws.onclose = (err) => {
      console.warn("connection closed: ", err.code, err.reason);
      setTimeout(connect, reconnectDelay);
      reconnectDelay *= 2;
      reconnectDelay = Math.min(reconnectDelay, MaxReconnectDelay);
    }
  };

  const send = (msg) => {
    try {
      store.getState().ws.send(JSON.stringify(msg));
      return true;
    } catch (e) {
      queue.push(msg);
      return false;
    }
  };

  return {send, connect};
};
