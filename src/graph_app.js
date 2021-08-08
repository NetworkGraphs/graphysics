import {GraphIo} from "./graph_io.js"
import { Render } from "./render.js"
import { Physics } from "./physics.js"
import { Mouse } from "./mouse.js"
import { Layout } from "./layout.js";
import { Mutate } from "./mutate.js";
import { defined } from "../libs/web-js-utils.js";

//singelton protected members
let graph   = null
let gio     = null
let render  = null
let physics = null
let mouse   = null
let layout = null
let mutate = null
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
    }else if(e.detail.action == "attract"){
        let forces = e.detail.v.forces
        if(e.detail.type == "start"){
            forces.used = true
            forces.attract_neighbors = true
        }else if(e.detail.type == "end"){
            forces.used = false
            forces.attract_neighbors = false
        }
    }else if(e.detail.action == "group"){
        mutate.group(graph,e.detail.v)
    }else if(e.detail.action == "ungroup"){
        mutate.ungroup(graph,e.detail.v)
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

function onMqttMessage(e){
    const topic = e.detail.topic
    const data = e.detail.payload
    //console.log(`graph_app> ${topic}	=> ${JSON.stringify(data)}`);
    const action = topic.split('/')[1]
    if(action == "reload"){
        common_load(null, true, null, data)
    }else if(action == "update"){
        for(const vertex of data.vertices){
            let v = graph.vertices[vertex.id]
            v.viewBox.x = vertex.viewBox.x
            v.viewBox.y = vertex.viewBox.y
            v.viewBox.placed = true
        }
    }
}


async function common_load(file,reload,config=null,graph_input=null){
    if(reload){
        console.log(`graph_app> reloading`)
        physics.pause()
        render.pause()
    }
    if(graph_input){
        console.log("graph_app> mqtt : graph_input")
        gio.import_json(graph_input)
    }else{
        console.log(`graph_app> file : ${file.name}`)
        await gio.import_file(file,config)
    }
    console.log(graph)
    if(!reload){
        //required svg before create_graph()
        render.create_svg(parent_div,config)
    }
    //defines vertices boxes sizes
    render.fitLabels()
    if(!graph.layout_done){
        //layout will define vertices boxes positions
        await layout.centrals_first(graph,{width:parent_div.offsetWidth,height:parent_div.offsetHeight})
    }
    delete graph.layout_done
    //create physical models of vertices boxes with their sizes and positions
    physics.create_bodies(parent_div)
    //creates svg elements of vertices boxes with their sizes and positions
    render.create_graph()
    mutate.all_groups(graph)

    if(reload){
        physics.resume()
        render.resume()
        console.log("reload() end")
    }else{
        mouse.init(parent_div)
    }

}

async function reload(file){
    await common_load(file,true)
    return
}

class GraphApp{
    constructor(){
        graph = {} // shared data between all singleton classes
        gio = new GraphIo(graph)
        render = new Render()
        render.init(graph)
        physics = new Physics(graph)
        mouse = new Mouse()
        layout = new Layout()
        mutate = new Mutate()
        window.addEventListener( 'menu_action', onMenuAction, false );
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, onDragEvents, false)
        });
        window.addEventListener( 'mqtt_message', onMqttMessage, false);

    }

    async load(config,p_div){
        parent_div = p_div
        await common_load(config.default_graph_file,false,config)
        return
    }

    run(){
        physics.run()
        render.update()
    }

}

export {GraphApp};

