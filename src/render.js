import {html,clear,send} from "../libs/web-js-utils.js"
import {Svg} from "../libs/svg_utils.js"
import {Menu} from "./menu.js"

let utl = new Svg()
let menu = new Menu()

let g = null;
let svg = null;
let config = null;
let menu_v = null;
let attraction = false;


function onMenuAction(e){
    if(e.detail.action == "pin"){
        e.detail.v.pinned = true
        e.detail.v.svg.shape.classList.add("pinned")
    }else if(e.detail.action == "unpin"){
        e.detail.v.pinned = false
        e.detail.v.svg.shape.classList.remove("pinned")
    }
}

function onVertexMenu(e){
    if(e.detail.type == "start"){
        menu_v = g.vertices[e.detail.id]
        let vb = menu_v.viewBox
        let pin_name = menu_v.pinned?"unpin":"pin"
        let buttons = menu.call({svg:svg,x:vb.x,y:vb.y,actions:["attract","layout",pin_name]})
        buttons[pin_name].addEventListener(    'click', (e)=>{send("menu_action",{type:"click",action:e.target.getAttribute("data-name"),v:menu_v} )}, false );
        buttons["layout"].addEventListener( 'click', (e)=>{send("menu_action",{type:"click",action:e.target.getAttribute("data-name"),v:menu_v} )}, false );
        buttons["attract"].addEventListener('mousedown', (e)=>{
            send("menu_action",{type:"start",action:e.target.getAttribute("data-name"),v:menu_v} )
            attraction = true
        }, false );
        buttons["attract"].addEventListener('mouseup', (e)=>{
            send("menu_action",{type:"end",action:e.target.getAttribute("data-name"),v:menu_v} )
            attraction = false
        }, false );
        buttons["attract"].addEventListener('mouseleave', (e)=>{
            send("menu_action",{type:"end",action:e.target.getAttribute("data-name"),v:menu_v} )
            attraction = false
        }, false );
    }else if(e.detail.type == "end"){
        if(attraction){
            send("menu_action",{type:"end",action:"attract",v:menu_v} )
        }
    }
}

function onVertexHover(e){
    const vertex = g.vertices[e.detail.id]
    if(e.detail.type == "enter"){
        vertex.svg.shape.classList.add("hover")
        for(let [vid,v] of Object.entries(vertex.neighbors)){
            v.svg.shape.classList.add("hoverneighbor")
        }
        for(let [eid,e] of Object.entries(vertex.edges)){
            e.svg.path.classList.add("hover")
        }
        console.log(`hover enter: ${vertex.label}`)
    }else if(e.detail.type == "exit"){
        vertex.svg.shape.classList.remove("hover")
        for(let [vid,v] of Object.entries(vertex.neighbors)){
            v.svg.shape.classList.remove("hoverneighbor")
        }
        for(let [eid,e] of Object.entries(vertex.edges)){
            e.svg.path.classList.remove("hover")
        }
        console.log(`hover exit: ${vertex.label}`)
    }
}

function onVertexDrag(e){
    if(e.detail.type == "start"){
        const svg_vertex = g.vertices[e.detail.id].svg.shape
        svg_vertex.classList.add("drag")
    }else if(e.detail.type == "end"){
        const svg_vertex = g.vertices[e.detail.id].svg.shape
        svg_vertex.classList.remove("drag")
    }
}

class Render{
    constructor(graph_data){
        g = graph_data
        window.addEventListener( 'vertex_hover', onVertexHover, false );
        window.addEventListener( 'vertex_drag', onVertexDrag, false );
        window.addEventListener( 'vertex_menu', onVertexMenu, false );
        window.addEventListener( 'menu_action', onMenuAction, false );
    }

    create(parent_div,sheet){
        let [w,h] = [parent_div.offsetWidth,parent_div.offsetHeight]
        svg = html(parent_div,/*html*/`<svg id="main_svg" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"></svg>`);
        utl.set_parent(svg)
        this.draw()
        const select_color    = "hsl(140, 80%, 50%)"
        const default_color   = "hsl(140, 80%, 90%)"
        const darken_color    = "hsl(140, 80%, 33%)"
        this.sheet = new CSSStyleSheet()
        this.sheet.insertRule(/*css*/`
        .vertex.pinned {
            filter: url(#f_pinned);
            fill :  hsl(100,80%,60%)
        }`);
        this.sheet.insertRule(/*css*/`
        .vertex.drag {
            filter: url(#f_drag);
            fill :  ${select_color}
        }`);
        this.sheet.insertRule(/*css*/`
        .vertex.hover {
            filter: url(#f_default);
            fill :  ${select_color}
        }`);
        this.sheet.insertRule(/*css*/`
        .vertex.hoverneighbor {
            filter: url(#f_default);
            fill :  ${select_color}
        }`);
        this.sheet.insertRule(/*css*/`
        .vertex.default {
            filter: url(#f_default);
            fill :  ${default_color}
        }`);
        this.sheet.insertRule(/*css*/`
        .v_text {
            font: ${config.render.font}
        }`);
        this.sheet.insertRule(/*css*/`
        .e_text {
            font: ${config.render.font}
        }`);
        this.sheet.insertRule(/*css*/`
        .edge.hover {
            stroke: ${select_color}
        }`);
        this.sheet.insertRule(/*css*/`
        .edge.default {
            stroke: ${default_color}
        }`);
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.sheet];

    }
    

    setViewBoxes(cfg){
        config = cfg
        let check_canvas = document.createElement("canvas")
        let ctx = check_canvas.getContext("2d")
        ctx.font = config.render.font
        let vm = config.render.v_margin * 2
        let hm = config.render.h_margin * 2
        for(let [vid,v] of Object.entries(g.vertices)){
            let box = ctx.measureText(v.label)
            let height = box.fontBoundingBoxAscent + box.fontBoundingBoxDescent
            v.viewBox = {width:box.width+hm,height:height+vm}
        }
    }

    draw(){
        clear(svg)
        utl.filter_light(       svg,{id:"f_pinned",            lx:-20,ly:-10,lz:10})
        utl.filter_light_shadow(svg,{id:"f_default",            lx:-20,ly:-10,lz:10,dx:5,dy:2})
        utl.filter_light_shadow(svg,{id:"f_hover",              lx:-20,ly:-10,lz:10,dx:5,dy:2})
        utl.filter_light_shadow(svg,{id:"f_drag",               lx:-20,ly:-10,lz:10,dx:15,dy:8})
        let g_edges = html(svg,/*html*/`<g ig="edges">`)
        for(let [eid,e] of Object.entries(g.edges)){
            let [x1,y1,x2,y2] = [e.outV.viewBox.x,e.outV.viewBox.y,e.inV.viewBox.x,e.inV.viewBox.y]
            let s_width = (1+e.weight*5)
            e.svg = {}
            e.svg.group = html(g_edges,/*html*/`<g id="edge_${e.label}"/>`)
            e.svg.path = html(e.svg.group,/*html*/`<path id="e_p_${e.id}" class="edge path default" d="M ${x1} ${y1} L ${x2} ${y2}" stroke-width="${s_width}" />`)
            e.svg.text = html(e.svg.group,/*html*/` <text class="e_text" class="edge text" >
                                                        <textPath href="#e_p_${e.id}" startOffset="50%">
                                                            ${e.label}
                                                        </textPath>
                                                    </text>`)
        }
        let g_vertices = html(svg,/*html*/`<g id="vertices"/>`)
        for(let [vid,v] of Object.entries(g.vertices)){
            let [x,y,w,h] = [-v.viewBox.width/2,-v.viewBox.height/2,v.viewBox.width,v.viewBox.height]
            v.svg = {}
            v.svg.group = html(g_vertices,/*html*/`<g id="vert_${v.name}"/>`)
            v.svg.shape = html(v.svg.group,/*html*/`<rect  class="vertex shape default" id="${v.id}" x="${x}" y="${y}" rx="3" width="${w}" height="${h}" />`)
            html(v.svg.group,/*html*/`<text class="v_text" dominant-baseline="middle" text-anchor="middle" style="pointer-events:none">${v.label}</text>`)
            v.svg.group.setAttribute("transform", `translate(${v.viewBox.x},${v.viewBox.y}) rotate(${0})`);
        }

        html(svg,/*html*/`
                <a href="${config.github.link}" target="_blank">
                    <image x="0" y="${svg.parentElement.clientHeight-50}" height="30" xlink:href="${config.github.image}" ></image>
                </a>`)
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
                e.svg.path.setAttribute("d",`M ${x1} ${y1} L ${x2} ${y2}`)
            }
        }
        for(let [vid,v] of Object.entries(g.vertices)){
            v.viewBox.moved = false
        }
    }

}

export {Render};

