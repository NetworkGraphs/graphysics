/**
 * edge render types
 * - straight line weight
 * - path over edge label
 * - line arrow
 * - curved horizontal first
 */
import {html, defined} from "../../libs/web-js-utils.js"
import {Vector} from "../../libs/Vector.js"
import {Geometry} from "../../libs/geometry.js"
let geom = new Geometry()

function rank_to_offset(e,text=false){
    let offset = e.multi.used?-10+20*e.multi.rank:5
    offset += text?3:0
    if(e.inV.viewBox.x<e.outV.viewBox.x){
        offset = -offset
    }
    return offset
}

//[outV->inV] dist(center + label.width/2) + Vertical offset
function edge_label_offset(e){
    let [v1,v2] = [e.outV.viewBox,e.inV.viewBox]
    const offset = rank_to_offset(e)
    const length = geom.distance(v1,v2)
    const p1_dist = (length/2)-(e.viewBox.width/2)
    const p2_dist = p1_dist + e.viewBox.width
    const dir = Vector.normalise(Vector.sub(v2,v1))
    let p1 = Vector.add(v1,Vector.mult(dir,p1_dist))
    let p2 = Vector.add(v1,Vector.mult(dir,p2_dist))
    let res_edge = geom.edge_offset({p1:p1,p2:p2},offset)
    return [res_edge.p1,res_edge.p2]
}

function text_path(e){
    //let [x1,y1,x2,y2] = [e.outV.viewBox.x,e.outV.viewBox.y,e.inV.viewBox.x,e.inV.viewBox.y]
    let offset = rank_to_offset(e,true)
    let {p1,p2} = geom.edge_offset(e,offset)
    if(e.inV.viewBox.x<e.outV.viewBox.x){
        return `M ${p2.x} ${p2.y} L ${p1.x} ${p1.y}`
    }else{
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
    if(e.multi.used){
        let p1 = e.outV.viewBox//temporary fill with default
        let [p2,p3] = edge_label_offset(e)
        let p4 = e.inV.viewBox
        let arrow = geom.edge_box_int({p1:p3,p2:p4},e.inV.viewBox)
        let a_path = path_arrow(arrow)
        let path=`M ${p1.x},${p1.y}
                L ${p2.x},${p2.y}
                L ${p3.x},${p3.y}
                L ${arrow.base.x} ${arrow.base.y} 
                ${a_path}
                M ${arrow.base.x} ${arrow.base.y} 
                L ${p3.x},${p3.y}
                L ${p2.x},${p2.y}
                L ${p1.x},${p1.y}
                `
        //console.log(path)
        return path
    }else{
        let arrow = geom.edge_box_int(e,e.inV.viewBox)
        let a_path = path_arrow(arrow)
        return `M ${e.outV.viewBox.x},${e.outV.viewBox.y}
                L ${arrow.base.x} ${arrow.base.y} 
                ${a_path}
                Z`
    }
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
        svg.path        = html(svg.group,/*html*/`<path class="edge path default d_arrow" d="${line_arrow(e)}" stroke-width="2" />`)
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
        if(e.svg.path.classList.contains("d_arrow")){
            e.svg.path.setAttribute("d",line_arrow(e))
        }else if(e.svg.path.classList.contains("d_line")){
            e.svg.path.setAttribute("d",line_simple(e))
        }
        if(defined(e.label)){
            e.svg.textpath.setAttribute("d",text_path(e))
        }
    }
}

export {Edge}
