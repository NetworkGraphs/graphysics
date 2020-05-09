import {GraphApp} from "./graph_app.js"
import {fetch_json} from "./utils.js"

async function main(){
    let graph = new GraphApp()
    const config = await fetch_json("./config.json")
    await graph.load(config,document.body)
    
    function animate(){
        graph.run();
        requestAnimationFrame( animate );
    }
    
    animate();
}

main()
.then(/*main never returns*/)
