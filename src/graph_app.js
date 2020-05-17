import {GraphIo} from "./graph_io.js"
import { Render } from "./render.js"
import { Physics } from "./physics.js"
import { Mouse } from "./mouse.js"

//singelton protected members
let graph   = null
let gio     = null
let render  = null
let physics = null
let mouse   = null

class GraphApp{
    constructor(){
        graph = {} // shared data between all singleton classes
        gio = new GraphIo(graph)
        render = new Render(graph)
        physics = new Physics(graph)
        mouse = new Mouse()
    }

    async load(config,parent_div){
        await gio.import_file(config.default_graph_file)
        render.setViewBoxes(config)
        console.log(graph)
        render.create(parent_div)
        physics.create(parent_div)
        mouse.init(parent_div)
    }

    run(){
        physics.run()
        render.update()
    }

}

export {GraphApp};

