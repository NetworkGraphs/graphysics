import { defined } from "../libs/web-js-utils.js";
import {centrality,select_vertex_position} from "./layout/sampling.js"

function remove_add_pinned(g,central_order,already_placed){
    for(let [vid,v] of Object.entries(g.vertices)){
        if(defined(v.pinned) && v.pinned){
            already_placed.push(v)
            central_order.splice(central_order.indexOf(v),1)
        }
    }
}

class Layout{
    centrals_first(g,params){
        let central_order = centrality(g.vertices)
        let already_placed = []
        remove_add_pinned(g,central_order,already_placed)
        
        for(let [vid,v] of Object.entries(central_order)){
            [v.viewBox.x,v.viewBox.y] = select_vertex_position(v,already_placed,params.width,params.height)//for debug : ,(v.id==6)
            already_placed.push(v)
        }
    }
    propagate_neighbors(g,params){
        let central_order = centrality(g.vertices)
        let already_placed = []
        remove_add_pinned(g,central_order,already_placed)
        
        for(let [vid,v] of Object.entries(central_order)){
            [v.viewBox.x,v.viewBox.y] = select_vertex_position(v,already_placed,params.width,params.height)//for debug : ,(v.id==6)
            already_placed.push(v)
        }
    }
}


export{Layout};
