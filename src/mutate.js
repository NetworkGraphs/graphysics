import { defined, clear } from "../libs/web-js-utils.js";

import { Render } from "./render.js"

//singelton protected members
let render  = new Render()

function remove_neighbors_edges(vertex,gr_neighbor,edges){
    vertex.group.backup[gr_neighbor.id] = {}
    let backup = vertex.group.backup[gr_neighbor.id]
    delete vertex.neighbors[gr_neighbor.id]
    if(defined(vertex.in_neighbors[gr_neighbor.id])){
        backup.in_neighbor = gr_neighbor
        delete vertex.in_neighbors[gr_neighbor.id]
    }else if(defined(vertex.out_neighbors[gr_neighbor.id])){
        backup.out_neighbor = gr_neighbor
        delete vertex.out_neighbors[gr_neighbor.id]
    }
    backup.edges = []
    for(let [eid,e] of Object.entries(edges)){
        if(defined(vertex.edges[e.id])){
            backup.edges.push(e)
            delete vertex.edges[e.id]
        }
    }
}

//TODO have to rework the addition without the backup rather use the group vertex info to reconstruct it
function add_neighbors_edges(vertex,gr_neighbor,edges){
    let backup = vertex.group.backup[gr_neighbor.id]
    vertex.neighbors[gr_neighbor.id] = gr_neighbor
    if(defined(backup.in_neighbor)){
        vertex.in_neighbors[gr_neighbor.id] = gr_neighbor
    }else if(defined(backup.out_neighbor)){
        vertex.out_neighbors[gr_neighbor.id] = gr_neighbor
    }
    for(let [eid,e] of Object.entries(backup.edges)){
        edges[eid] = e
    }
    backup = {}
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
    }
    ungroup(g,vertex){
        let gr = vertex.group
        gr.used = false

        vertex.neighbors = gr.neighbors
        vertex.in_neighbors = gr.in_neighbors
        vertex.out_neighbors = gr.out_neighbors
        gr.neighbors = []
        gr.in_neighbors = []
        gr.out_neighbors = []
        vertex.edges = gr.edges
        gr.edges = []
        
        for(let [eid,e] of Object.entries(vertex.edges)){
            render.show_edge(e)
        }
        for(let [vid,v] of Object.entries(vertex.neighbors)){
            add_neighbors_edges(v,vertex,vertex.edges)
            render.add_hover(v)
        }
    }
}

export{Mutate};
