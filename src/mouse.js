import {event} from "./utils.js"

let state ={over_vertex:false,id:0,coord:{x:0,y:0},offset:{x:0,y:0},dragging:false,acting:false,menu:false};

function onContext(e){
    e.preventDefault();
    e.stopPropagation();
}

function onMousePan(e){
    const is_vertex = e.target.classList.contains("vertex")
    let dx = e.clientX - state.coord.x;
    let dy = e.clientY - state.coord.y;
    let vdx = e.offsetX - state.offset.x;
    let vdy = e.offsetY - state.offset.y;
    if(e.type == "mousemove"){
        //console.log(state)
        if(!state.dragging && !state.menu){//then no update for the hover state machine
            if(is_vertex){
                if(!state.over_vertex){
                    state.id = e.target.id
                    state.over_vertex = true
                    event("vertex_hover",{type:"enter",id:state.id})
                }else{
                    if(e.target.id != state.id){
                        event("vertex_hover",{type:"exit",id:state.id})//exit old
                        state.id = e.target.id
                        event("vertex_hover",{type:"enter",id:state.id})//enter new
                    }
                }
            }else{
                if(state.over_vertex){
                    event("vertex_hover",{type:"exit",id:state.id})
                    state.over_vertex = false
                }
            }
        }
        if((e.buttons == 1) && state.dragging){
            event("vertex_drag",{type:"move",tx:vdx,ty:vdy})
        }
        if(!is_vertex && (e.buttons != 1) && (e.buttons == 2) && !state.menu){
            if(state.over_vertex){
                state.over_vertex = false
                event("vertex_hover",{type:"exit",id:state.id})
            }
        }
    }else if(e.type == "mousedown"){
        if((e.buttons == 1) && is_vertex){
            state.dragging = true
            state.id = e.target.id
            event("vertex_drag",{type:"start",id:state.id})
        }else if((e.buttons == 2) && is_vertex){
            state.menu = true
            state.id = e.target.id
            event("vertex_menu",{type:"start",id:state.id})
        }
    }else if(e.type == "mouseup"){
        if(state.dragging){
            state.dragging = false
            event("vertex_drag",{type:"end",id:state.id})
        }
    }
    state.coord.x = e.clientX;
    state.coord.y = e.clientY;
    state.offset.x = e.offsetX;
    state.offset.y = e.offsetY;
    e.preventDefault();
    e.stopPropagation();
}

function onVertexMenu(e){
    if(e.detail.type == "end"){
        state.menu = false
    }
}
class Mouse{
    init(element){

        element.addEventListener( 'touchstart', onMousePan, false );
        element.addEventListener( 'touchend', onMousePan, false );
        element.addEventListener( 'mousedown', onMousePan, false );
        element.addEventListener( 'mouseup', onMousePan, false );
        element.addEventListener( 'mousemove', onMousePan, false );
        element.addEventListener( 'contextmenu', onContext, false );
        window.addEventListener( 'vertex_menu', onVertexMenu, false );
    
    }
    
    
}

export {Mouse};
