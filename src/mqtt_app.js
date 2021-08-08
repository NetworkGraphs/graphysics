/** http://w3c.github.io/html-reference/input.color.html
 * 
 * sent events:
 * - mqtt_message
 */

import {event} from "./utils.js"

let client;
let mqtt_connected = false;
let subscribe_topic = ""

function init(mqtt_config){
  subscribe_topic = mqtt_config.subscribe
  mqtt_connect(mqtt_config)
}

// called when the client connects
function onConnect() {
  mqtt_connected = true;
  // Once a connection has been made, make a subscription and send a message.
  console.log("mqtt_app> onConnect() mqtt running");

  client.subscribe(subscribe_topic);
  console.log(`mqtt_app> - subscribed to ${subscribe_topic}`);
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:"+responseObject.errorMessage);
  }
  mqtt_connected = false;
}

// called when a message arrives
function onMessageArrived(message) {
  //console.log(`mqtt_app> ${message.destinationName}	=> ${message.payloadString}`);
  event("mqtt_message",{topic:message.destinationName,payload:JSON.parse(message.payloadString)});
}

function mqtt_connect(config){
    // Create a client instance
    const client_name = window.location.hostname + '#' + config.client;
    client = new Paho.MQTT.Client(config.host, Number(config.port), client_name);
    // set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    // connect the client
    client.connect({onSuccess:onConnect});
}

export{init}
