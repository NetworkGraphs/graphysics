import { defined, clear } from "../libs/web-js-utils.js";
import {select_vertex_position,clear_demo,start_demo} from "./layout/sampling.js"

function degree_centrality(vertices){
    let central = []
    for(let [vid,v] of Object.entries(vertices)){
        //could here add configurable centrality with weights
        central.push({c:Object.keys(v.edges).length,v:v})
    }
    central.sort((a,b)=>{return (b.c - a.c)})

    let sorted = []
    central.forEach((obj)=>{
        sorted.push(obj.v)
    })
    return sorted
}

function neighbors_centrality(vertices,center){
    for(let [vid,v] of Object.entries(vertices)){
        v.added = false
        v.done = false
    }


    let neighbors = [center]
    center.added = true
    let processing = [center]
    while(processing.length > 0){
        let vertex = processing.shift()
        vertex.done = true
        for(let [vid,v] of Object.entries(vertex.neighbors)){
            if(!v.added){
                neighbors.push(v)
                v.added = true
            }
            if(!v.done){
                processing.push(v)
            }
        }
    }

    for(let [vid,v] of Object.entries(vertices)){
        if(!v.added){//finally add the disconnected set
            neighbors.push(v)
        }
        delete v.added
        delete v.done
    }
    return neighbors
}

function remove_add_pinned(g,vertices,already_placed){
    for(let [vid,v] of Object.entries(g.vertices)){
        if(defined(v.pinned) && v.pinned){
            already_placed.push(v)
            vertices.splice(vertices.indexOf(v),1)
        }
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function readKey() {
    return new Promise(resolve => {
        window.addEventListener('keypress', resolve, {once:true});
        window.addEventListener('mousedown',  resolve, {once:true} );
    });
}

function list_visibility(svg_list,visible){
    svg_list.forEach((s)=>{
        s.svg.group.setAttribute("visibility",visible?"visible":"hidden")
    })
}

function edges_visibility(v,visible){
    for(let [eid,e] of Object.entries(v.edges)){
        e.svg.group.setAttribute("visibility",visible?"visible":"hidden")
    }
}
function edges_placed_visible(g,already_placed){
    for(let [eid,e] of Object.entries(g.edges)){
        if(already_placed.includes(e.inV) && already_placed.includes(e.outV)){
            e.svg.group.setAttribute("visibility","visible")
        }
    }
}
function show_edges_if(v){
    for(let [eid,e] of Object.entries(v.edges)){
        if((e.inV.svg.group.getAttribute("visibility") == "visible")&&
           (e.outV.svg.group.getAttribute("visibility") == "visible")){
            e.svg.group.setAttribute("visibility","visible")
        }
    }
}

class Layout{
    async centrals_first(g,params){
        let central_order = degree_centrality(g.vertices)
        let already_placed = []
        remove_add_pinned(g,central_order,already_placed)

        let demo = defined(params.demo)?params.demo:0
        if(demo!=0){
            list_visibility(central_order,false)
            edges_visibility(g,false)
        }

        for(let i=0;i<central_order.length;i++){
            start_demo(g.svg,"g_svg_prop")
            let v = central_order[i]
            let demo = defined(params.demo)?params.demo:0
            let[x,y] = select_vertex_position(v,already_placed,{g:g,width:params.width,height:params.height,demo:demo,debug:false})//for debug : (v.id==6),
            v.viewBox.x = x
            v.viewBox.y = y
            v.viewBox.placed = true
            if(demo!=0){
                v.svg.group.setAttribute("visibility","visible")
                show_edges_if(v)
                await readKey()
            }
            already_placed.push(v)
            clear_demo()
        }
        //no disconnected edges handling required in centrality layout
    }

    async propagate_neighbors(g,params){
        let neighbors_order = neighbors_centrality(g.vertices,params.v)
        //neighbors_order.forEach((n)=>{console.log(n.label)})
        let already_placed = []
        remove_add_pinned(g,neighbors_order,already_placed)
        list_visibility(already_placed,true)
        list_visibility(neighbors_order,false)
        edges_visibility(g,false)
        edges_placed_visible(g,already_placed)
        
        for(let i=0;i<neighbors_order.length;i++){
            start_demo(g.svg,"g_svg_prop")
            let v = neighbors_order[i]
            let demo = defined(params.demo)?params.demo:0
            let [x,y] = select_vertex_position(v,already_placed,{
                g:g,
                width:params.width,
                height:params.height,
                demo:demo,
                debug:false
            })//for debug : ,(v.id==6)
            v.viewBox.x = x
            v.viewBox.y = y
            v.viewBox.placed |= true
            v.svg.group.setAttribute("visibility","visible")
            show_edges_if(v)
            already_placed.push(v)
            console.log(`selected pos ${v.label}`)
            if(demo!=0){
                //await delay(demo)
                await readKey()
            }
            clear_demo()
        }
        edges_visibility(g,true)

    }
}


export{Layout};
