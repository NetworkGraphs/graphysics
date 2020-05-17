import { defined } from "../libs/web-js-utils.js";
import {select_vertex_position} from "./layout/sampling.js"

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

class Layout{
    centrals_first(g,params){
        let central_order = degree_centrality(g.vertices)
        let already_placed = []
        remove_add_pinned(g,central_order,already_placed)
        
        central_order.forEach((v)=>{
            [v.viewBox.x,v.viewBox.y] = select_vertex_position(v,already_placed,{g:g,width:params.width,height:params.height,demo:100,debug:false})//for debug : (v.id==6),
            already_placed.push(v)
        })
    }
    propagate_neighbors(g,params){
        let neighbors_order = neighbors_centrality(g.vertices,params.v)
        //neighbors_order.forEach((n)=>{console.log(n.label)})
        let already_placed = []
        remove_add_pinned(g,neighbors_order,already_placed)
        
        neighbors_order.forEach((v)=>{
            [v.viewBox.x,v.viewBox.y] = select_vertex_position(v,already_placed,{g:g,width:params.width,height:params.height,debug:false})//for debug : ,(v.id==6)
            already_placed.push(v)
        })
    }
}


export{Layout};
