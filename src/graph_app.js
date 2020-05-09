import {GraphIo} from "./graph_io.js"
import { Render } from "./render.js"
import { Physics } from "./physics.js"

//singelton protected members
let graph   = null
let gio     = null
let render  = null
let physics = null

class GraphApp{
    constructor(){
        graph = {} // shared data between all singleton classes
        gio = new GraphIo(graph)
        render = new Render(graph)
        physics = new Physics(graph)
    }

    async load(config,parent_div){
        await gio.import_file(config.default_graph_file)
        render.setViewBoxes(config.render)
        console.log(graph)
        physics.create(parent_div)
        render.create(parent_div)
    }

    run(){
        physics.run()
        render.update()
    }

}

export {GraphApp};

