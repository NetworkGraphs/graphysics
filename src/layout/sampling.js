import {obj_has} from "../utils.js"
import {html,html_tag} from "../../libs/web-js-utils.js"

let g_debug = false
let g_demo_step = 0
let svg = null
let demo_svgs = []

let min = Math.min
let max = Math.max

function intersect(e1,e2){
    const epsilon = 1
    const epsilon_a = 0.0001
    const x1 = e1.inV.viewBox.x
    const y1 = e1.inV.viewBox.y
    const x2 = e1.outV.viewBox.x
    const y2 = e1.outV.viewBox.y
    const x3 = e2.inV.viewBox.x
    const y3 = e2.inV.viewBox.y
    const x4 = e2.outV.viewBox.x
    const y4 = e2.outV.viewBox.y

    if(Math.max(x1,x2) < Math.min(x3,x4)){
        return false
    }
    if(Math.min(x1,x2) > Math.max(x3,x4)){
        return false
    }
    if(Math.max(y1,y2) < Math.min(y3,y4)){
        return false
    }
    if(Math.min(y1,y2) > Math.max(y3,y4)){
        return false
    }
    //we are within bounding boxes
    if(Math.abs(x1-x2) < epsilon){//A1 is vertical
        if((x3<x1)&&(x4>x1)){
            return true
        }
        if((x3>x1)&&(x4<x1)){
            return true
        }
    }
    if(Math.abs(x3-x4) < epsilon){//A2 is vertical
        if((x1<x3)&&(x2>x3)){
            return true
        }
        if((x1>x3)&&(x2<x3)){
            return true
        }
    }
    //safe division as not vertical
    const a1 = (y1-y2)/(x1-x2)
    const a2 = (y3-y4)/(x3-x4)
    if(Math.abs(a1-a2) < epsilon_a){//parallel
        return false
    }
    //safe division as not parallel
    const b1 = y1 - a1*x1
    const b2 = y3 - a2*x3
    const xa = (b2-b1)/(a1-a2)
    if( ( xa < max(min(x1,x2), min(x3,x4)) )
        ||
        ( xa > min(max(x1,x2), max(x3,x4)) )
    ){
        return false
    }else{
        return true
    }
}

function samples_in_rect(nb,w,h,box_w,box_h){
    let res = []
    for(let i = 0;i<nb; i++){
        res.push({
            x:Math.round(box_w/2 + (Math.random()*(w-box_w))),
            y:Math.round(box_h/2 + (Math.random()*(h-box_h)))
        })
    }
    return res
}

function distance(va,vb){
    const dx = va.x-vb.x
    const dy = va.y-vb.y
    return Math.sqrt(dx * dx + dy * dy)
}

function walls_distance(point,w,h){
    let walls_dist = []
    walls_dist.push(Math.abs(point.x))
    walls_dist.push(Math.abs(point.y))
    walls_dist.push(Math.abs(w-point.x))
    walls_dist.push(Math.abs(h-point.y))
    return Math.min(...walls_dist)
}

function get_placed_others_edges(sample,placed_vertices){
    let edges = []
    for(let [vid,v] of Object.entries(placed_vertices)){
        for(let [eid,e] of Object.entries(v.edges)){
            if(placed_vertices.includes(e.inV) && placed_vertices.includes(e.outV)){
                let own_edge = ((e.inV == sample)||(e.outV == sample))
                //discard if own edge, and not if already in
                if(!own_edge && !edges.includes(e)){
                    edges.push(e)
                }
            }
        }
    }
    return edges
}

function get_own_tobe_placed_edges(sample,placed_vertices){
    let edges = []
    for(let [eid,e] of Object.entries(sample.edges)){
        //one of the edges vertices is the self vertex (sample), so any of || would fulfill the match
        if(placed_vertices.includes(e.inV) || placed_vertices.includes(e.outV)){
            if(!edges.includes(e)){
                edges.push(e)
            }
        }
    }
    return edges
}

function copy_without_neighbors(sample,placed_vertices){
    let res = []
    for(let [vid,v] of Object.entries(placed_vertices)){
        if(!obj_has(sample.neighbors,v)){
            res.push(v)
        }
    }
    return res
}

function interset_cost(sample,placed_vertices){
    const others_edges = get_placed_others_edges(sample,placed_vertices)//not including own
    const own_tobe_placed_edges = get_own_tobe_placed_edges(sample,placed_vertices)
    for(let [oeid,own_e] of Object.entries(own_tobe_placed_edges)){
        for(let [eid,e] of Object.entries(others_edges)){
            if(intersect(own_e,e)){
                /*stop processing and */return 10
            }
        }
    }
    if(g_debug){
        //console.log(placed_edges)
    }
    return 0
}

function neighbors_walls_cost(sample,seeds,w,h,walls){
    let free_dist = []
    for(let j= 0;j<seeds.length;j++){
        free_dist.push(distance(sample,seeds[j].viewBox))
    }
    if(walls){
        free_dist.push(walls_distance(sample,w,h))
    }
    const min_free_dist = Math.min(...free_dist)//the minimal distance is taken to reject the sample
    return ((min_free_dist < 10)?10000:(100.0/min_free_dist))
}

function plot_iteration(samples,best_index,i_costs){

    for(let i=0;i<samples.length;i++){
        const s = samples[i]
        if(i_costs[i] == 0){
            html_tag(demo_svgs,"circle",/*html*/`<circle cx=${s.x} cy=${s.y} r="5" stroke="black" stroke-width="0" fill="black" />`)
        }else{
            html_tag(demo_svgs,"circle",/*html*/`<circle cx=${s.x} cy=${s.y} r="5" stroke="black" stroke-width="0" fill="red" />`)
        }
    }
    let best_sample = samples[best_index]
    let [bx,by] = [best_sample.x,best_sample.y]
    if(i_costs[best_index] != 0){
        html_tag(demo_svgs,"circle",/*html*/`<circle cx=${bx} cy=${by} r="10" stroke="black" stroke-width="2" fill="red" />`)
    }else{
        html_tag(demo_svgs,"circle",/*html*/`<circle cx=${bx} cy=${by} r="10" stroke="black" stroke-width="2" fill="green" />`)
    }
}

function select_vertex_position(v,placed,params){
    //console.time("select_pos")
    g_debug = params.debug
    g_demo_step = params.demo
    svg = params.g.svg
    let best_index = -1
    let best_cost = Number.MAX_VALUE;
    let i_costs = []
    const nb_samples = 100
    let samples = samples_in_rect(nb_samples,params.width,params.height,v.viewBox.width,v.viewBox.height)
    for(let i=0;i<nb_samples;i++){
        const s = samples[i]
        const dist_cost = neighbors_walls_cost(s,placed,params.width,params.height,true)
        //assignment needed for intersection calculation of potential sample coordinates
        //v needs to be passed for neighbors information
        v.viewBox.x = s.x
        v.viewBox.y = s.y
        const i_cost = interset_cost(v,placed)
        i_costs.push(i_cost)
        const cost = dist_cost + i_cost
        if(params.debug){
            console.log(`${i}) total:${cost.toFixed(2)} , dist_cost: ${dist_cost.toFixed(2)} , i_cost:${i_cost}`)
        }
        if(cost < best_cost){
            best_index = i
            best_cost = cost
        }
    }
    if(params.debug){
        console.log(`best_cost = ${best_cost.toFixed(2)} at best_index = ${best_index}`)
    }
    if(best_index == -1){
        console.warning("sampling failed")
        let [x,y] = [   Math.round((Math.random()*params.width)),
                        Math.round((Math.random()*params.height))
                    ]
        return [x,y]
    }else{
        let best_sample = samples[best_index]
        v.viewBox.x = best_sample.x
        v.viewBox.y = best_sample.y
        if(i_costs[best_index] != 0){
            console.log(`i_cost failed for ${v.label}`)
        }
        //console.timeEnd("select_pos")
        if(g_demo_step!=0){
            plot_iteration(samples,best_index,i_costs)
        }

        return [best_sample.x,best_sample.y]
    }

}

function start_demo(svg,id){
    demo_svgs = html(svg,/*html*/`<g id="${id}"/>`)
}

function clear_demo(){
    demo_svgs.parentElement.removeChild(demo_svgs)
}

export {select_vertex_position,start_demo,clear_demo};
