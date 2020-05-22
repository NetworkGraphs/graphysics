import {GraphIo} from "./graph_io.js"
import { Render } from "./render.js"
import { Physics } from "./physics.js"
import { Mouse } from "./mouse.js"
import { Layout } from "./layout.js";

//singelton protected members
let graph   = null
let gio     = null
let render  = null
let physics = null
let mouse   = null
let layout = null
let parent_div = null

function onVertexMenuAction(e){
    console.log(`${e.detail.v.label} => ${e.detail.action}:${e.detail.type}`)
    if(e.detail.action == "layout"){
        e.detail.v.pinned = true
        e.detail.v.svg.shape.classList.add("pinned")
        layout.propagate_neighbors(graph,{
            width:parent_div.offsetWidth,
            height:parent_div.offsetHeight,
            v:e.detail.v,
            demo:0
        })
        .then(console.log("layout promise done"))
    }
}

function onGlobalMenuAction(e){
    let demo = (e.detail.action == "demo")?1:0
    console.log(`graph_app> onGlobalMenuAction(demo=${demo})`)
    layout.centrals_first(graph,{
        width:parent_div.offsetWidth,
        height:parent_div.offsetHeight,
        demo:demo
    })
    .then(console.log("layout promise done"))
}

function onMenuAction(e){
    if(e.detail.menu == "Vertex"){
        onVertexMenuAction(e)
    }else if(e.detail.menu == "Global"){
        onGlobalMenuAction(e)
    }
}

function onDragEvents(event){
    event.stopPropagation();
    event.preventDefault();
    if(event.type == "dragenter"){
        event.dataTransfer.dropEffect = "copy";
    }
    if(event.type == "drop"){
        if(event.dataTransfer.files.length == 1){
            reload(event.dataTransfer.files[0])
            .then(console.log("reload() done"))
        }else{
            console.warn("only one file drop allowed");
            console.log(event.dataTransfer.files);
        }
    };
}

async function reload(file){
    console.log(`graph_app> reloading file : ${file.name}`)
    physics.pause()
    render.pause()
    await gio.import_file(file);
    console.log(graph)
    render.fitLabels()
    //layout will define vertices boxes positions
    await layout.centrals_first(graph,{width:parent_div.offsetWidth,height:parent_div.offsetHeight})
    //create physical models of vertices boxes with their sizes and positions
    physics.create_bodies(parent_div)
    //creates svg elements of vertices boxes with their sizes and positions
    render.create_graph()
    physics.resume()
    render.resume()
    console.log("reload() end")
}

class GraphApp{
    constructor(){
        graph = {} // shared data between all singleton classes
        gio = new GraphIo(graph)
        render = new Render(graph)
        physics = new Physics(graph)
        mouse = new Mouse()
        layout = new Layout()
        window.addEventListener( 'menu_action', onMenuAction, false );
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, onDragEvents, false)
        });
    }

    async load(config,p_div){
        parent_div = p_div
        await gio.import_file(config.default_graph_file)
        console.log(graph)
        //required svg before create_graph()
        render.create_svg(parent_div,config)
        //defines vertices boxes sizes
        render.fitLabels()
        //layout will define vertices boxes positions
        await layout.centrals_first(graph,{width:parent_div.offsetWidth,height:parent_div.offsetHeight})
        //create physical models of vertices boxes with their sizes and positions
        physics.create_bodies(parent_div)
        //creates svg elements of vertices boxes with their sizes and positions
        render.create_graph()
        mouse.init(parent_div)
    }

    run(){
        physics.run()
        render.update()
    }

}

export {GraphApp};

