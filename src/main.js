import {GraphApp} from "./graph_app.js"
import {fetch_json} from "./utils.js"
import * as mqtt from './mqtt_app.js';


async function main(){
    console.log("main() start")
    let graph = new GraphApp()
    const config = await fetch_json("./config.json")
    await graph.load(config,document.body)
    
    function animate(){
        graph.run();
        requestAnimationFrame( animate );
    }
    
    animate();
    console.log("main() done")

    if(config.mqtt.enabled){
        mqtt.init(config.mqtt);
    }
    
}

main()
.then(console.log("main() waiting"))
