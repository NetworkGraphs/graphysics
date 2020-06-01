import {event} from "./utils.js"
import { defined } from "../libs/web-js-utils.js";

let state ={over_vertex:false,id:0,coord:{x:0,y:0},offset:{x:0,y:0},dragging:false,acting:false,menu:false};

function onContext(e){
    e.preventDefault();
    e.stopPropagation();
}

function get_pointers_Firefox(e,t_id){
    let pointer_x,pointer_y
    if(defined(e.offsetX)){
        pointer_x = e.offsetX
        pointer_y = e.offsetY
    }else if(defined(e.layerX))
    {
        pointer_x = e.layerX
        pointer_y = e.layerY
    }else if(e.touches.length>0){
        pointer_x = e.touches[t_id].pageX
        pointer_y = e.touches[t_id].pageY
    }else{
        pointer_x = state.offset.x
        pointer_y = state.offset.y
    }
    return [pointer_x,pointer_y]
}
function get_pointers_default(e,t_id){
    let pointer_x = defined(e.offsetX)?e.offsetX:   ((e.touches.length>0)?(e.touches[t_id].pageX):state.offset.x)
    let pointer_y = defined(e.offsetY)?e.offsetY:   ((e.touches.length>0)?(e.touches[t_id].pageY):state.offset.y)
    return [pointer_x,pointer_y]
}

function onMousePan(e){
    const is_vertex = e.target.classList.contains("vertex")
    let pointe_1 = defined(e.buttons)?(e.buttons == 1):(e.touches.length == 1)
    let pointer_2 = defined(e.buttons)?(e.buttons == 2):(e.touches.length == 2)
    let t_id = pointer_2?1:0
    let [pointer_x,pointer_y] = get_pointers_default(e,t_id)
    let vdx = pointer_x - state.offset.x;
    let vdy = pointer_y - state.offset.y;
    //console.log(`tx:${vdx},ty:${vdy}    px:${e.touches[0].PageX},py:${e.touches[0].PageY}`)
    //console.log(e)
    if(["mousemove","touchmove"].includes(e.type)){
        //console.log(`dragging:${state.dragging} , over_vertex:${state.over_vertex}`)
        if(!state.dragging && !state.menu){//then no update for the hover state machine
            if(is_vertex){
                if(!state.over_vertex){
                    state.id = e.target.id
                    state.over_vertex = true
                    event("vertex_hover",{type:"enter",id:state.id,x:pointer_x,y:pointer_y})
                }else{
                    if(e.target.id != state.id){
                        event("vertex_hover",{type:"exit",id:state.id})//exit old
                        state.id = e.target.id
                        event("vertex_hover",{type:"enter",id:state.id,x:pointer_x,y:pointer_y})//enter new
                    }else{
                        event("vertex_hover",{type:"move",id:state.id,x:pointer_x,y:pointer_y})
                    }
                }
            }else{
                if(state.over_vertex){
                    event("vertex_hover",{type:"exit",id:state.id})
                    state.over_vertex = false
                }
            }
        }
        if(pointe_1 && state.dragging){
            //console.log(e)
            //console.log(`tx:${vdx},ty:${vdy}`)
            event("vertex_drag",{type:"move",tx:vdx,ty:vdy})
        }
        if(!is_vertex && !pointe_1 && pointer_2 && !state.menu){
            if(state.over_vertex){
                state.over_vertex = false
                event("vertex_hover",{type:"exit",id:state.id})
            }
        }
    }else if(["mousedown","touchstart"].includes(e.type)){
        if(pointe_1 && is_vertex){
            state.dragging = true
            state.id = e.target.id
            event("vertex_drag",{type:"start",id:state.id})
        }else if(pointer_2 && is_vertex){
            state.menu = true
            state.id = e.target.id
            event("context_menu",{menu:"Vertex",type:"start",id:state.id,x:pointer_x,y:pointer_y})
        }else if(pointer_2){
            state.menu = true
            event("context_menu",{menu:"Global",type:"start",x:pointer_x,y:pointer_y})
        }
    }else if(["mouseup","touchend"].includes(e.type)){
        if(state.dragging){
            state.dragging = false
            event("vertex_drag",{type:"end",id:state.id})
        }
    }
    state.offset.x = pointer_x;
    state.offset.y = pointer_y;
    if(!["touchstart","touchend","touchmove"].includes(e.type)){
        e.preventDefault();
    }
    if(!["touchstart","mousedown"].includes(e.type)){
        e.stopPropagation();
    }
}

function onVertexMenu(e){
    if(e.detail.type == "end"){
        state.menu = false
    }
}
class Mouse{
    init(element){

        element.addEventListener( 'touchstart', onMousePan, false );
        element.addEventListener( 'touchend',   onMousePan, false );
        element.addEventListener( 'touchmove',  onMousePan, false );
        element.addEventListener( 'mousedown',  onMousePan, false );
        element.addEventListener( 'mouseup',    onMousePan, false );
        element.addEventListener( 'mousemove',  onMousePan, false );
        element.addEventListener( 'contextmenu',onContext, false );
        window.addEventListener( 'context_menu', onVertexMenu, false );
    
    }
    
    
}

export {Mouse};
