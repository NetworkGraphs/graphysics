import {html,clear} from "../libs/web-js-utils.js"
import {Svg} from "../libs/svg_utils.js"

let utl = new Svg()

let g = null;
let svg = null;

class Render{
    constructor(graph_data){
        g = graph_data
    }

    create(parent_div){
        let [w,h] = [parent_div.offsetWidth,parent_div.offsetHeight]
        svg = html(parent_div,/*html*/`<svg id="main_svg" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"></svg>`);
        utl.set_parent(svg)
        this.draw()
    }

    setViewBoxes(config){
        let check_canvas = document.createElement("canvas")
        let ctx = check_canvas.getContext("2d")
        ctx.font = config.font
        let m = config.margin * 2
        for(let [vid,v] of Object.entries(g.vertices)){
            let box = ctx.measureText(v.label)
            let height = box.fontBoundingBoxAscent + box.fontBoundingBoxDescent
            v.viewBox = {width:box.width+m,height:height+m}
        }
    }

    draw(){
        clear(svg)
        let g_edges = html(svg,/*html*/`<g ig="edges">`)
        for(let [eid,e] of Object.entries(g.edges)){
            let [x1,y1,x2,y2] = [e.outV.viewBox.x,e.outV.viewBox.y,e.inV.viewBox.x,e.inV.viewBox.y]
            let s_width = (1+e.weight*5)
            e.svg = html(g_edges,/*html*/`<path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="rgb(50,150,50)" stroke-width="${s_width}">`)
        }
        let g_vertices = html(svg,/*html*/`<g id="vertices"/>`)
        for(let [vid,v] of Object.entries(g.vertices)){
            let [x,y,w,h] = [-v.viewBox.width/2,-v.viewBox.height/2,v.viewBox.width,v.viewBox.height]
            v.svg = html(g_vertices,/*html*/`<g id="vert_${v.name}"/>`)
            html(v.svg,/*html*/`<rect  class="vertex" id="${v.id}" x="${x}" y="${y}" rx="3" width="${w}" height="${h}" fill="rgb(100,205,100)" />`)
            html(v.svg,/*html*/`<text x="0" y="0" dominant-baseline="middle" text-anchor="middle" style="pointer-events:none">${v.label}</text>`)
            v.svg.setAttribute("transform", `translate(${v.viewBox.x},${v.viewBox.y}) rotate(${0})`);
        }
    }

    update(){
        for(let [vid,v] of Object.entries(g.vertices)){
            if(v.viewBox.moved){
                v.svg.setAttribute("transform", `translate(${v.viewBox.x},${v.viewBox.y}) rotate(${v.viewBox.angle})`);
            }
        }
        for(let [eid,e] of Object.entries(g.edges)){
            if(e.outV.viewBox.moved || e.inV.viewBox.moved){
                let [x1,y1,x2,y2] = [e.outV.viewBox.x,e.outV.viewBox.y,e.inV.viewBox.x,e.inV.viewBox.y]
                e.svg.setAttribute("d",`M ${x1} ${y1} L ${x2} ${y2}`)
            }
        }
    }

}

export {Render};

