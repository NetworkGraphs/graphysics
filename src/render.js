import {html,clear} from "../libs/web-js-utils.js"
import {Svg} from "../libs/svg_utils.js"

let utl = new Svg()

let g = null;
let svg = null;

function onVertexHover(e){
    const vertex = g.vertices[e.detail.id]
    if(e.detail.type == "enter"){
        vertex.svg.vertex.classList.add("hover")
        for(let [vid,v] of Object.entries(vertex.neighbors)){
            v.svg.vertex.classList.add("hoverneighbor")
        }
        for(let [eid,e] of Object.entries(vertex.edges)){
            e.svg.classList.add("hover")
        }
        console.log(`hover enter: ${vertex.label}`)
    }else if(e.detail.type == "exit"){
        vertex.svg.vertex.classList.remove("hover")
        for(let [vid,v] of Object.entries(vertex.neighbors)){
            v.svg.vertex.classList.remove("hoverneighbor")
        }
        for(let [eid,e] of Object.entries(vertex.edges)){
            e.svg.classList.remove("hover")
        }
        console.log(`hover exit: ${vertex.label}`)
    }
}

function onVertexDrag(e){
    if(e.detail.type == "start"){
        const svg_vertex = g.vertices[e.detail.id].svg.vertex
        svg_vertex.classList.add("drag")
    }else if(e.detail.type == "end"){
        const svg_vertex = g.vertices[e.detail.id].svg.vertex
        svg_vertex.classList.remove("drag")
    }
}

class Render{
    constructor(graph_data){
        g = graph_data
        window.addEventListener( 'vertex_hover', onVertexHover, false );
        window.addEventListener( 'vertex_drag', onVertexDrag, false );
    }

    create(parent_div,sheet){
        let [w,h] = [parent_div.offsetWidth,parent_div.offsetHeight]
        svg = html(parent_div,/*html*/`<svg id="main_svg" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"></svg>`);
        utl.set_parent(svg)
        this.draw()
        const color             = "hsl(140, 80%, 50%)"
        const highlight_color   = "hsl(140, 80%, 90%)"
        const darken_color      = "hsl(140, 80%, 33%)"
        this.sheet = new CSSStyleSheet()
        this.sheet.insertRule(/*css*/`
        .vertex.drag {
            filter: url(#f_drag);
            fill :  ${highlight_color}
        }`);
        this.sheet.insertRule(/*css*/`
        .vertex.hover {
            filter: url(#f_default);
            fill :  ${highlight_color}
        }`);
        this.sheet.insertRule(/*css*/`
        .vertex.hoverneighbor {
            filter: url(#f_default);
            fill :  ${highlight_color}
        }`);
        this.sheet.insertRule(/*css*/`
        .vertex.default {
            filter: url(#f_default);
            fill :  ${color}
        }`);
        this.sheet.insertRule(/*css*/`
        .edge.hover {
            stroke: ${color}
        }`);
        this.sheet.insertRule(/*css*/`
        .edge.default {
            stroke: ${darken_color}
        }`);
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.sheet];
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
        utl.filter_light_shadow(svg,{id:"f_default",            lx:-20,ly:-10,lz:10,dx:5,dy:2})
        utl.filter_light_shadow(svg,{id:"f_hover",              lx:-20,ly:-10,lz:10,dx:5,dy:2})
        utl.filter_light_shadow(svg,{id:"f_drag",               lx:-20,ly:-10,lz:10,dx:15,dy:8})
        let g_edges = html(svg,/*html*/`<g ig="edges">`)
        for(let [eid,e] of Object.entries(g.edges)){
            let [x1,y1,x2,y2] = [e.outV.viewBox.x,e.outV.viewBox.y,e.inV.viewBox.x,e.inV.viewBox.y]
            let s_width = (1+e.weight*5)
            e.svg = html(g_edges,/*html*/`<path class="edge default" d="M ${x1} ${y1} L ${x2} ${y2}" stroke-width="${s_width}">`)
        }
        let g_vertices = html(svg,/*html*/`<g id="vertices"/>`)
        for(let [vid,v] of Object.entries(g.vertices)){
            let [x,y,w,h] = [-v.viewBox.width/2,-v.viewBox.height/2,v.viewBox.width,v.viewBox.height]
            v.svg = {}
            v.svg.group = html(g_vertices,/*html*/`<g id="vert_${v.name}"/>`)
            v.svg.vertex = html(v.svg.group,/*html*/`<rect  class="vertex default" id="${v.id}" x="${x}" y="${y}" rx="3" width="${w}" height="${h}" />`)
            html(v.svg.group,/*html*/`<text x="0" y="0" dominant-baseline="middle" text-anchor="middle" style="pointer-events:none">${v.label}</text>`)
            v.svg.group.setAttribute("transform", `translate(${v.viewBox.x},${v.viewBox.y}) rotate(${0})`);
        }
    }

    update(){
        for(let [vid,v] of Object.entries(g.vertices)){
            if(v.viewBox.moved){
                v.svg.group.setAttribute("transform", `translate(${v.viewBox.x},${v.viewBox.y}) rotate(${v.viewBox.angle})`);
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

