import {event} from "./utils.js"

let state ={over_vertex:false,coord:{x:0,y:0},offset:{x:0,y:0},dragging:false,acting:false};

function onContext(e){
    if(e.target.tagName == "rect"){
        e.preventDefault();
        e.stopPropagation();
    }
}

function onMousePan(e){
    const is_vetex = e.target.classList.contains("vertex")
    let dx = e.clientX - state.coord.x;
    let dy = e.clientY - state.coord.y;
    let vdx = e.offsetX - state.offset.x;
    let vdy = e.offsetY - state.offset.y;
    if(e.type == "mousemove"){
        if((e.buttons == 1) && state.dragging){
            event("mouse_vertex",{type:"drag_move",tx:vdx,ty:vdy})
        }
    }else if(e.type == "mousedown"){
        if((e.buttons == 1) && is_vetex){
            state.dragging = true
            event("mouse_vertex",{type:"drag_start",id:e.target.id})
        }
    }else if(e.type == "mouseup"){
        if(state.dragging){
            state.dragging = false
            event("mouse_vertex",{type:"drag_end"})
        }
    }
    state.coord.x = e.clientX;
    state.coord.y = e.clientY;
    state.offset.x = e.offsetX;
    state.offset.y = e.offsetY;
    e.preventDefault();
    e.stopPropagation();
}

class Mouse{
    init(element){

        element.addEventListener( 'touchstart', onMousePan, false );
        element.addEventListener( 'touchend', onMousePan, false );
        element.addEventListener( 'mousedown', onMousePan, false );
        element.addEventListener( 'mouseup', onMousePan, false );
        element.addEventListener( 'mousemove', onMousePan, false );
        element.addEventListener( 'contextmenu', onContext, false );
    
    }
    
    
}

export {Mouse};
