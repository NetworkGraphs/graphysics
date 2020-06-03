/**
 * group render
 */
import {html, defined,add_style_element} from "../../libs/web-js-utils.js"
import {Vector} from "../../libs/Vector.js"
import {Geometry} from "../../libs/geometry.js"
let geom = new Geometry()

function group_vertices(vertex){
    let d = `M ${vertex.viewBox.x},${vertex.viewBox.y} `
    for(let [vid,v] of Object.entries(vertex.group.neighbors)){
        d += `L ${v.viewBox.x},${v.viewBox.y} `
    }
    d += `L ${vertex.viewBox.x},${vertex.viewBox.y}`
    return d
}

class Group{

    create(top_svg,vertex){
        let svg = {}
        svg.group       = html(top_svg,/*html*/`<g id="group_vert_${vertex.id}"/>`)
        svg.path        = html(svg.group,/*html*/`<path class="vert_group" d="${group_vertices(vertex)}"/>`)
        vertex.group.svg = svg
        add_style_element(top_svg,/*css*/`
        path.vert_group{
            fill        :rgba(0,0,0,0.4);
            stroke-width:2;
            stroke      :#840221;
            pointer-events:none;
        `)
    }
    update(vertex){
        vertex.group.svg.path.setAttribute("d",group_vertices(vertex))
    }
    remove(top_svg,vertex){
        top_svg.removeChild(vertex.group.svg.group)
        vertex.group.svg = null
    }
}

export {Group}
