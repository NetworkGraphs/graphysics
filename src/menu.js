import {html} from "../libs/web-js-utils.js"
import {event} from "./utils.js"

let svg = null;
let menu_svg = null;
let vertex = null;

let state = {active:false}

function onMouseLeave(e){
    if(state.active){
        svg.removeChild(menu_svg)
        console.log("menu over")
        state.active = false
        event("vertex_menu",{type:"end"})
    }
}

function onContext(e){
        e.preventDefault();
        e.stopPropagation();
}

class Menu{
    call(Params){
        vertex = Params.v
        svg = Params.svg
        console.log(`menu called from ${vertex.label}`)
        let [x,y] = [vertex.viewBox.x,vertex.viewBox.y]
        menu_svg = html(svg,/*html*/`<circle  class="menu" cx="${x}" cy="${y}" r="60" fill="rgba(120,160,200,0.5)"/>`)
        state.active = true
        menu_svg.addEventListener( 'mouseleave', onMouseLeave, false );
        menu_svg.addEventListener( 'contextmenu', onContext, false );
    }
}

export{Menu};

