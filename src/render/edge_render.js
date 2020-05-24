/**
 * edge render types
 * - straight line weight
 * - path over edge label
 * - line arrow
 * - curved horizontal first
 */
import {html, defined} from "../../libs/web-js-utils.js"
import {Geometry} from "../../libs/geometry.js"
let geom = new Geometry()

function text_path(e){
    //let [x1,y1,x2,y2] = [e.outV.viewBox.x,e.outV.viewBox.y,e.inV.viewBox.x,e.inV.viewBox.y]
    let offset = e.multi.used?5+20*e.multi.rank:5
    if(e.inV.viewBox.x<e.outV.viewBox.x){
        let {p1,p2} = geom.edge_offset(e,-offset)
        return `M ${p2.x} ${p2.y} L ${p1.x} ${p1.y}`
    }else{
        let {p1,p2} = geom.edge_offset(e,offset)
        return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`
    }
}

function path_arrow(arrow){
    const a_width = 20
    const a_body_height = 10
    arrow.base = geom.rel_to_abs(arrow,{x:-a_body_height,y:0})
    arrow.left = geom.rel_to_abs(arrow,{x:-a_width,y:a_body_height})
    arrow.right  = geom.rel_to_abs(arrow,{x:-a_width,y:-a_body_height})
    return `M ${arrow.x},${arrow.y}
            L ${arrow.left.x},${arrow.left.y}
            L ${arrow.base.x},${arrow.base.y}
            L ${arrow.right.x},${arrow.right.y}
            L ${arrow.x},${arrow.y}`
}

function path_circle(center,r){
    return `M ${center.x},${center.y}
            m ${-r},0
            a ${r},${r} 0,1,0 ${2*r},0
            a ${r},${r} 0,1,0 ${-2*r},0`
}

function line_arrow(e){
    let [x1,y1,x2,y2] = [e.outV.viewBox.x,e.outV.viewBox.y,e.inV.viewBox.x,e.inV.viewBox.y]
    let arrow = geom.edge_box_int(e,e.inV.viewBox)
    let path = path_arrow(arrow)
    return `M ${x1} ${y1} L ${arrow.base.x} ${arrow.base.y} ${path} `
}

function line_simple(e){
    let [x1,y1,x2,y2] = [e.outV.viewBox.x,e.outV.viewBox.y,e.inV.viewBox.x,e.inV.viewBox.y]
    return `M ${x1} ${y1} L ${x2} ${y2} `
}

// (0.1, 1, 3) => 1.1,1
function edge_weight_to_width(weight,scale){
    const epsilon = 0.1
    if(weight < epsilon){
        return (min+weight)
    }else{
        let val = (max - (0.2/weight))
        if(val < (min+epsilon)){
            val = min+epsilon
        }
        return 
    }
}

class Edge{

    create(top_svg,e){
        let s_width = (1+e.weight*5)
        let svg = {}
        svg.group       = html(top_svg,/*html*/`<g id="edge_${e.label}"/>`)
        svg.path        = html(svg.group,/*html*/`<path class="edge path default arrow" d="${line_simple(e)}" stroke-width="2" />`)
        if(defined(e.label)){
            svg.textpath    = html(svg.group,/*html*/`<path id="e_p_${e.id}" d="${text_path(e)}" visibility="hidden" />`)
            svg.text        = html(svg.group,/*html*/` <text class="e_text" class="edge text" >
                                                        <textPath href="#e_p_${e.id}" text-anchor="middle" startOffset="50%">
                                                            ${e.label}
                                                        </textPath>
                                                    </text>`)
        }
        e.svg = svg
    }

    update(e){
        if(e.svg.path.classList.contains("line")){
            e.svg.path.setAttribute("d",line_simple(e))
        }else if(e.svg.path.classList.contains("arrow")){
            e.svg.path.setAttribute("d",line_arrow(e))
        }
        if(defined(e.label)){
            e.svg.textpath.setAttribute("d",text_path(e))
        }
    }
}

export {Edge}
