import { defined, clear,add_members } from "../libs/web-js-utils.js";

import { Render } from "./render.js"

//singelton protected members
let render  = new Render()

function log_edges(v){
    let text = ""
    for(let [eid,e] of Object.entries(v.edges)){
        //text = text + `${e.id} : ${e.inV.id} - ${e.outV.id}`
        text = text + `${e.id} `
    }
    console.log(`${v.label} edges = ${text}`)
}

function remove_neighbors_edges(vertex,gr_neighbor,edges){
    delete vertex.neighbors[gr_neighbor.id]
    if(gr_neighbor.id in vertex.in_neighbors){
        delete vertex.in_neighbors[gr_neighbor.id]
    }else if(gr_neighbor.id in vertex.out_neighbors){
        delete vertex.out_neighbors[gr_neighbor.id]
    }
    for(let [eid,e] of Object.entries(edges)){
        if(e.id in vertex.edges){
            delete vertex.edges[e.id]
        }
    }
}

function add_neighbors_edges(vertex,gr_neighbor){
    if(!(gr_neighbor.id in vertex.neighbors)){
        vertex.neighbors[gr_neighbor.id] = gr_neighbor
    }
    for(let [eid,e] of Object.entries(gr_neighbor.edges)){
        if(e.inV.id == vertex.id){
            if(!(eid in vertex.edges)){
                vertex.edges[eid] = e
                vertex.out_neighbors[gr_neighbor.id] = gr_neighbor
            }
        }
        if(e.outV.id == vertex.id){
            if(!(eid in vertex.edges)){
                vertex.edges[eid] = e
                vertex.in_neighbors[gr_neighbor.id] = gr_neighbor
            }
        }
    }
}

class Mutate{
    group(g,vertex){
        let gr = vertex.group
        gr.used = true

        gr.neighbors = vertex.neighbors
        gr.in_neighbors = vertex.in_neighbors
        gr.out_neighbors = vertex.out_neighbors
        vertex.neighbors = []
        vertex.in_neighbors = []
        vertex.out_neighbors = []
        gr.edges = vertex.edges
        vertex.edges = []
        for(let [eid,e] of Object.entries(gr.edges)){
            render.hide_edge(e)
        }
        for(let [vid,v] of Object.entries(gr.neighbors)){
            remove_neighbors_edges(v,vertex,gr.edges)
            render.remove_hover(v)
        }
        render.create_group(vertex)
        vertex.svg.shape.classList.add("group")
    }
    ungroup(g,vertex){
        let gr = vertex.group
        gr.used = false

        add_members(vertex.neighbors,gr.neighbors)
        add_members(vertex.in_neighbors,gr.in_neighbors)
        add_members(vertex.out_neighbors,gr.out_neighbors)
        gr.neighbors = []
        gr.in_neighbors = []
        gr.out_neighbors = []
        add_members(vertex.edges,gr.edges)

        gr.edges = []
        
        for(let [vid,v] of Object.entries(vertex.neighbors)){
            add_neighbors_edges(v,vertex)
            render.add_hover(v)
        }
        for(let [eid,e] of Object.entries(vertex.edges)){
            render.show_edge(e)
        }
        render.remove_group(vertex)
        vertex.svg.shape.classList.remove("group")
    }

    all_groups(graph){
        for(let [vid,v] of Object.entries(graph.vertices)){
            if(v.group.used){
                mutate.group(graph,v)
            }else{
                for(let [eid,e] of Object.entries(v.edges)){
                    if((e.label == "group") && (e.outV.id == vid)){
                        console.log(`grouping ${v.name}`)
                        this.group(graph,v)
                        break
                    }
                }
            }
        }
    }
}

export{Mutate};
