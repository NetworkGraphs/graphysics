/**
 * edge render types
 * - straight line weight
 * - path over edge label
 * - line arrow
 * - curved horizontal first
 */
import {html} from "../../libs/web-js-utils.js"
import {Geometry} from "../../libs/geometry.js"
let geom = new Geometry()

function text_path(e){
    //let [x1,y1,x2,y2] = [e.outV.viewBox.x,e.outV.viewBox.y,e.inV.viewBox.x,e.inV.viewBox.y]
    let {p1,p2} = geom.edge_offset(e,5)
    return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`
}

function path_circle(c,r){
    return `M ${c.x},${c.y}
            m ${-r},0
            a ${r},${r} 0,1,0 ${2*r},0
            a ${r},${r} 0,1,0 ${-2*r},0`
}

function path_arrow(e){
    let [x1,y1,x2,y2] = [e.outV.viewBox.x,e.outV.viewBox.y,e.inV.viewBox.x,e.inV.viewBox.y]
    let arrow = geom.edge_box_int(e,e.inV.viewBox)
    return `M ${x1} ${y1} L ${x2} ${y2} ${path_circle(arrow,10)} `
}

function path_simple(e){
    let [x1,y1,x2,y2] = [e.outV.viewBox.x,e.outV.viewBox.y,e.inV.viewBox.x,e.inV.viewBox.y]
    return `M ${x1} ${y1} L ${x2} ${y2} `
}

class Edge{

    line_create(top_svg,e){
        let s_width = (1+e.weight*5)
        let svg = {}
        svg.group       = html(top_svg,/*html*/`<g id="edge_${e.label}"/>`)
        svg.path        = html(svg.group,/*html*/`<path class="edge path default" d="${path_simple(e)}" stroke-width="2" />`)
        svg.textpath    = html(svg.group,/*html*/`<path id="e_p_${e.id}" d="${text_path(e)}" visibility="hidden" />`)
        svg.text        = html(svg.group,/*html*/` <text class="e_text" class="edge text" >
                                                    <textPath href="#e_p_${e.id}" text-anchor="middle" startOffset="50%">
                                                        ${e.label}
                                                    </textPath>
                                                </text>`)
        e.svg = svg
    }

    line_update(e){
        let [x1,y1,x2,y2] = [e.outV.viewBox.x,e.outV.viewBox.y,e.inV.viewBox.x,e.inV.viewBox.y]
        e.svg.path.setAttribute("d",path_simple(e))
        e.svg.textpath.setAttribute("d",text_path(e))
    }
}

export {Edge}
