import {html,html_tag,add_sheet,remove_sheet,defined} from "../libs/web-js-utils.js"
import {event} from "./utils.js"
import {Svg} from "../libs/svg_utils.js"

let utl = new Svg()

let svg = null;
let menu_svg = null;
let buttons = {};
let texts = {};
let vertex = null;

let state = {active:false}
let sheet = null

/**
 * 
 * @param {*} rel : relative position [0,1] around the 360° circle
 * @param {*} radius 
 */
function angle_pos(rel,radius){
    let angle = rel * 2 * Math.PI
    let x = radius * Math.cos(angle)
    let y = radius * Math.sin(angle)
    return [x,y]
}

function remove(){
    if(state.active){
        svg.removeChild(menu_svg)
        console.log("menu over")
        state.active = false
        event("vertex_menu",{type:"end"})
        remove_sheet(sheet)
        //can't remove sheet : document.adoptedStyleSheets.splice(document.adoptedStyleSheets.indexOf(sheet))
    }
}

function onMouseLeave(e){
    remove()
}

function onPointerDown(e){
    let pointer_2 = defined(e.buttons)?(e.buttons == 2):(e.touches.length == 2)
    if(pointer_2 || (!e.target.classList.contains("svg_menu"))){
        remove()
    }
}

function onContext(e){
    e.preventDefault();
    e.stopPropagation();
}

class Menu{
    call(Params){
        const circle_radius = 80
        const pie_radius_start = 20
        const pie_radius_end = 90

        vertex = Params.v
        svg = Params.svg
        let [x,y] = [Params.x,Params.y]
        menu_svg = html(svg,/*html*/`<g id="g_menu"/>`)
        html_tag(menu_svg,"circle",/*html*/`
        <circle class="svg_menu" cx="${x}" cy="${y}" r="10" fill="rgba(120,160,200,0.5)" >
            <animate attributeName="r" begin="0s" values="10;${circle_radius}" keyTimes="0;1" calcMode="spline" keySplines="0 .75 .25 1" dur="300ms" repeatCount="1" fill="freeze"/>
        </circle>`)
        menu_svg.getElementsByTagName("animate")[0].beginElement()
        state.active = true
        menu_svg.addEventListener( 'mouseleave', onMouseLeave, false );
        svg.addEventListener( 'mousedown', onPointerDown, false );
        svg.addEventListener( 'touchstart', onPointerDown, false );
        menu_svg.addEventListener( 'contextmenu', onContext, false );

        const len = Params.actions.length
        buttons = {}
        texts = {}
        Params.actions.forEach((a,i)=>{
            const start = i / len
            const stop = (i+1) / len
            const margin = 0.01
            let pie = utl.pie(menu_svg,x,y,pie_radius_start,pie_radius_end,start,stop,margin)
            buttons[a] = pie
            pie.setAttribute("data-name",a)
            pie.setAttribute("visibility","hidden")
            pie.classList.add("svg_menu")
            pie.classList.add("pie_element")
            let [tx,ty] = angle_pos((start+stop)/2,(pie_radius_start+pie_radius_end)/2)
            texts[a] = html(menu_svg,/*html*/`<text x="${x+tx}" y="${y+ty}" class="m_text" dominant-baseline="middle" text-anchor="middle" style="pointer-events:none" visibility="hidden">${a}</text>`)
        })
        Params.actions.forEach((action,i)=>{
            setTimeout(()=>{
                buttons[action].setAttribute("visibility","visible")
                texts[action].setAttribute("visibility","visible")
            },200+i*50)
        })
        sheet = new CSSStyleSheet()
        sheet.insertRule(/*css*/`
        path.pie_element{
            fill:hsl(140, 80%, 35%)
        }`)
        sheet.insertRule(/*css*/`
        path.pie_element:hover{
            fill:hsl(140, 80%, 45%)
        }`)
        sheet.insertRule(/*css*/`
        path.pie_element:hover:active{
            fill:hsl(140, 80%, 65%)
        }`)
        sheet.insertRule(/*css*/`
        text.m_text{
            font: bold 12px Verdana, Helvetica, Arial, sans-serif;
            color:hsl(240, 80%, 65%)
        }`)
        add_sheet(sheet)
        return buttons
    }
    update_action(old_action_name,new_action_name){
        let pie = buttons[old_action_name]
        pie.setAttribute("data-name",new_action_name)
        let text = texts[old_action_name]
        text.innerHTML = new_action_name
        buttons[new_action_name] = pie
        texts[new_action_name] = text
        return buttons
    }
}

export{Menu};

