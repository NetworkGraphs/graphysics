import {obj_has} from "../utils.js"
import {html,html_tag} from "../../libs/web-js-utils.js"

let Vector = Matter.Vector

let g_debug = false
let g_demo_step = 0
let svg = null
let demo_svgs = []

let min = Math.min
let max = Math.max

function center(va,vb){
    return ({x:(va.x+vb.x)/2,y:(va.y+vb.y)/2})
}

/**
 * returns true if edges segments intersect each other (not the full lines scope)
 * common point segments will return true intersection result
 * @param {*} e1 
 * @param {*} e2 
 */
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

function dist_sqr(va,vb){
    const dx = va.x-vb.x
    const dy = va.y-vb.y
    return (dx * dx + dy * dy)
}

function walls_distance(point,w,h){
    let walls_dist = []
    walls_dist.push(Math.abs(point.x))
    walls_dist.push(Math.abs(point.y))
    walls_dist.push(Math.abs(w-point.x))
    walls_dist.push(Math.abs(h-point.y))
    return Math.min(...walls_dist)
}

function draw_edge_distance(p,projection,d,color,text){
    html_tag(demo_svgs,"path",/*html*/`<path d="M ${p.x} ${p.y} L ${projection.x} ${projection.y}" stroke="${color}" stroke-width="1" />`)
    let c = center(p,projection)
    html(demo_svgs,/*html*/`<text x="${c.x}" y="${c.y}" class="d_text" dominant-baseline="middle" text-anchor="middle" style="pointer-events:none">${d.toFixed(2)}</text>`)
}

function edge_distance(point,edge){
    const debug = false
    const epsilon = 1//unit is pixels therefore 1 is already too small
    const p = {x:point.viewBox.x,y:point.viewBox.y}
    const e1 = {x:edge.inV.viewBox.x,y:edge.inV.viewBox.y}
    const e2 = {x:edge.outV.viewBox.x,y:edge.outV.viewBox.y}

    //if(g_demo_step!=0){html_tag(demo_svgs,"circle",/*html*/`<circle cx=${e1.x} cy=${e1.y} r="5" stroke="black" stroke-width="0" fill="green" />`)}
    //if(g_demo_step!=0){html_tag(demo_svgs,"circle",/*html*/`<circle cx=${e2.x} cy=${e2.y} r="5" stroke="black" stroke-width="0" fill="green" />`)}
    //if(g_demo_step!=0){html_tag(demo_svgs,"circle",/*html*/`<circle cx=${p.x} cy=${p.y} r="5" stroke="black" stroke-width="0" fill="blue" />`)}    
    const length = dist_sqr(e1,e2)
    if(length < epsilon){
        return [distance(p,e1),false]
    }
    let t = ((p.x - e1.x) * (e2.x - e1.x) + (p.y - e1.y) * (e2.y - e1.y)) / length;
    t = Math.max(0, Math.min(1, t));
    const projection = {    x: e1.x + t * (e2.x - e1.x),
                            y: e1.y + t * (e2.y - e1.y) }
    //check if projection is outside the edge segment
    const e1_p = Vector.sub(p,e1)
    const p_e2 = Vector.sub(e2,p)
    const e1_e2 = Vector.sub(e2,e1)
    if(Vector.dot(e1_p,e1_e2) < 0){//point beyond e1
        const d = distance(p,e1)
        if((g_demo_step!=0)&&debug)draw_edge_distance(p,projection,d,"red",`${point.label} outside (${edge.inV.label} , ${edge.outV.label})`)
        if(debug)console.log(`   ed:outside ${point.label} / (${edge.inV.label} , ${edge.outV.label}) => dist=${d}`)
        return [d,false]
    }else if(Vector.dot(e1_e2,p_e2) < 0){//point beyond e2
        const d = distance(p,e2)
        if((g_demo_step!=0)&&debug)draw_edge_distance(p,projection,d,"red",`${point.label} outside (${edge.inV.label} , ${edge.outV.label})`)
        if(debug)console.log(`   ed:outside ${point.label} / (${edge.inV.label} , ${edge.outV.label}) => dist=${d}`)
        return [d,false]
    }else{
        //if(g_demo_step!=0){html_tag(demo_svgs,"circle",/*html*/`<circle cx=${projection.x} cy=${projection.y} r="5" stroke="black" stroke-width="3" fill="green" />`)}
        const d = distance(p,projection)
        if((g_demo_step!=0)&&debug)draw_edge_distance(p,projection,d,"green",`${point.label} in (${edge.inV.label} , ${edge.outV.label})`)
        if(debug)console.log(`   ed:inside ${point.label} / (${edge.inV.label} , ${edge.outV.label}) => dist=${d}`)
        return [d,true]
    }
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

function common_vertex(e1,e2){
    return ((e1.inV.id == e2.inV.id) || (e1.inV.id == e2.outV.id) || (e1.outV.id == e2.inV.id) || (e1.outV.id == e2.outV.id))
}
function own_edge(vertex,edge){
    return ((edge.inV.id == vertex.id) || (edge.outV.id == vertex.id))
}

function interset_cost(sample,placed_vertices,others_edges,own_tobe_placed_edges){
    //if(g_demo_step!=0){
    //    others_edges.forEach((e)=>{
    //        console.log(`  other's edge : ${e.inV.label} ${e.outV.label}`)
    //        html_tag(demo_svgs,"path",/*html*/`<path class="else" d="M ${e.inV.viewBox.x} ${e.inV.viewBox.y} L ${e.outV.viewBox.x} ${e.outV.viewBox.y}" stroke-width="10" stroke-color="black" />`)
    //    })
    //    console.log(`   placing : ${sample.label}`)
    //    own_tobe_placed_edges.forEach((e)=>{
    //        console.log(`  own edge : ${e.inV.label} ${e.outV.label}`)
    //        html_tag(demo_svgs,"path",/*html*/`<path class="else" d="M ${e.inV.viewBox.x} ${e.inV.viewBox.y} L ${e.outV.viewBox.x} ${e.outV.viewBox.y}" stroke-width="10"  stroke-color="black" />`)
    //    })
    //}
    for(let [oeid,own_e] of Object.entries(own_tobe_placed_edges)){
        for(let [eid,e] of Object.entries(others_edges)){
            if(!common_vertex(own_e,e) && intersect(own_e,e)){
                //console.log(`  !intersection! : ${e.inV.label}-${e.outV.label} intersects with ${own_e.inV.label}-${own_e.outV.label}`)
                /*stop processing and */return 10
            }
        }
    }
    if(g_debug){
        //console.log(placed_edges)
    }
    return 0
}

function neighbors_walls_cost(vertex,seeds,w,h){
    let sample = {x:vertex.viewBox.x,y:vertex.viewBox.y}
    let free_dist = []
    for(let j= 0;j<seeds.length;j++){
        free_dist.push(distance(sample,seeds[j].viewBox))
    }
    free_dist.push(walls_distance(sample,w,h))
    const min_free_dist = Math.min(...free_dist)//the minimal distance is taken to reject the sample
    return ((min_free_dist < 10)?10:(100.0/min_free_dist))
}

function distance_to_edges_cost(vertex,placed,others_edges,own_tobe_placed_edges){
    let free_dist = []
    //console.log(`   checking other's edges ${vertex.label}`)
    others_edges.forEach((e)=>{
        if(!own_edge(vertex,e)){
            const [dist,inside] = edge_distance(vertex,e)
            free_dist.push(dist)
        }
    })
    //console.log(`   checking own edges ${vertex.label}`)
    own_tobe_placed_edges.forEach((e)=>{
        placed.forEach((vertex)=>{
            if(!own_edge(vertex,e)){
                const [dist,inside] = edge_distance(vertex,e)
                if(inside){
                    free_dist.push(dist)
                }
            }
        })
    })
    //free_dist.push(walls_distance(sample,w,h))
    if(free_dist.length == 0){
        return 0//no edges, no cost
    }else{
        const min_free_dist = Math.min(...free_dist)//the minimal distance is taken to reject the sample
        const cost = ((min_free_dist < 10)?10:(100.0/min_free_dist))
        //console.log(`   min dist ${vertex.label} (${vertex.viewBox.x},${vertex.viewBox.y}) is ${min_free_dist.toFixed(1)} costs: ${cost.toFixed(2)}`)
        return cost
    }
}

function plot_iteration(samples,best_index,costs){
    const color_margin = Math.max(...costs) - Math.min(...costs)
    for(let i=0;i<samples.length;i++){
        const s = samples[i]
        const s_h_col = 200 + 160 * costs[i]/ color_margin
        html_tag(demo_svgs,"circle",/*html*/`<circle cx=${s.x} cy=${s.y} r="5" stroke="black" stroke-width="0" fill="hsl(${s_h_col},82%,56%)" />`)
    }
    let best_sample = samples[best_index]
    const s_h_col = 200 + 160 * costs[best_index]/ color_margin
    let [bx,by] = [best_sample.x,best_sample.y]
    html_tag(demo_svgs,"circle",/*html*/`<circle cx=${bx} cy=${by} r="25" stroke="hsl(${s_h_col},82%,56%)" stroke-width="3" fill="rgba(0,0,0,0)" />`)
}

function select_vertex_position(v,placed,params){
    //console.time("select_pos")
    g_debug = params.debug
    g_demo_step = params.demo
    svg = params.g.svg
    let best_index = -1
    let best_cost = Number.MAX_VALUE;
    let costs = []
    const others_edges = get_placed_others_edges(v,placed)//not including own, computed once for all samples
    const nb_samples = 1000
    let samples = samples_in_rect(nb_samples,params.width,params.height,v.viewBox.width,v.viewBox.height)

    for(let i=0;i<nb_samples;i++){
        v.viewBox.x = samples[i].x//needed for neighbors info
        v.viewBox.y = samples[i].y
        const own_tobe_placed_edges = get_own_tobe_placed_edges(v,placed)
        const dist_cost = neighbors_walls_cost(v,placed,params.width,params.height,true)
        const i_cost = interset_cost(v,placed,others_edges,own_tobe_placed_edges)
        const e_cost = distance_to_edges_cost(v,placed,others_edges,own_tobe_placed_edges)
        const cost = dist_cost + i_cost + e_cost
        costs.push(cost)
        if(cost < best_cost){
            best_index = i
            best_cost = cost
        }
        if(params.debug){console.log(`${i}) total:${cost.toFixed(2)} , dist_cost: ${dist_cost.toFixed(2)} , i_cost:${i_cost.toFixed(2)} , e_cost:${e_cost.toFixed(2)}`)}
    }
    if(params.debug){console.log(`best_cost for ${v.label} = ${best_cost.toFixed(2)} at best_index = ${best_index}`)}
    if(best_index == -1){
        console.warn("sampling failed")
        let [x,y] = [   Math.round((Math.random()*params.width)),
                        Math.round((Math.random()*params.height))
                    ]
        return [x,y]
    }else{
        let best_sample = samples[best_index]
        v.viewBox.x = best_sample.x
        v.viewBox.y = best_sample.y
        console.log(`    selected cost for ${v.label} (${v.viewBox.x},${v.viewBox.y}) : ${costs[best_index]}`)
        //console.timeEnd("select_pos")
        if(g_demo_step!=0){
            plot_iteration(samples,best_index,costs)
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
