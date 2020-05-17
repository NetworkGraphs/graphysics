import { defined } from "../libs/web-js-utils.js";
import { Layout } from "./layout.js";

let g = null;
let engine = null;
let width=0,height=0;
let last_run = 0;
let last_delta = 0;
let drag = {}
let to_run_layout = false
let layout = new Layout()

function get_delta_correction(){
    let delta = 1000/60;            //used as default for first interations only
    let correction = 1.0;           //used as default for first interations only
    const max_cpu_ms = 100;         //used to filter page sleep in the background 100 => 1000/100 = 10 fps
    if(last_run == 0){              //first run -> no delta, no correction
        const this_run = Date.now();
        last_run = this_run;
    }
    else{
        if(last_delta == 0){        //second run -> first delta but no correction yet
            const this_run = Date.now();
            delta = this_run - last_run;
            if(delta > max_cpu_ms){        //avoids instabilities after pause (window in background) or with slow cpu
                delta = max_cpu_ms;
            }
            last_run = this_run;
            last_delta = delta;
        }
        else{                       //run > 2 => delta + correction
            const this_run = Date.now();
            delta = this_run - last_run;
            if(delta > max_cpu_ms){        //avoids instabilities after pause (window in background) or with slow cpu
                delta = max_cpu_ms;
            }
            correction = delta / last_delta;
            //console.log(`phy> delta: ${delta}, last_delta:${last_delta} , correction: ${correction}`);
            last_run = this_run;
            last_delta = delta;
        }
    }
    return {delta:delta, correction:correction};
}

function onVertexDrag(e){
    if(e.detail.type == "start"){
        const body = g.vertices[e.detail.id].body
        console.log(`drag start: ${body.label} at (${body.position.x} , ${body.position.y})`)
        drag.position = body.position
        drag.constraint = Matter.Constraint.create({
            bodyA: body,
            length:0,
            stiffness: 0.03,
            damping: 0.03,
            pointB:body.position
        });
        Matter.World.addConstraint(engine.world,drag.constraint);
    }else if(e.detail.type == "end"){
        console.log(`drag end`)
        Matter.World.remove(engine.world,drag.constraint);
    }else if(e.detail.type == "move"){
        drag.position = Matter.Vector.add(drag.position,Matter.Vector.create(e.detail.tx,e.detail.ty));
        drag.constraint.pointB = drag.position;
    }
}

function onMenuAction(e){
    console.log(`${e.detail.v.label} => ${e.detail.action}:${e.detail.type}`)
    if(e.detail.action == "layout"){
        e.detail.v.pinned = true
        e.detail.v.svg.shape.classList.add("pinned")
        layout.propagate_neighbors(g,{width:width,height:height,v:e.detail.v})
        place_bodies()
    }
}

function create_bodies(){
    for(let [vid,v] of Object.entries(g.vertices)){
        v.body = Matter.Bodies.rectangle(v.viewBox.x,v.viewBox.y,v.viewBox.width,v.viewBox.height,
            {id:v.id,label:v.label,mass:5,frictionAir:0.3}
            )
        Matter.World.addBody(engine.world,v.body)
        v.viewBox.moved = true
    }
}

function place_bodies(){
    for(let [vid,v] of Object.entries(g.vertices)){
        if(!defined(v.pinned) || !v.pinned){
            Matter.Body.setPosition(v.body,Matter.Vector.create(v.viewBox.x,v.viewBox.y))
            v.viewBox.moved |= true
        }
    }
}

class Physics{
    constructor(graph_data){
        g = graph_data
        engine = Matter.Engine.create({enableSleeping:true})
        engine.world.gravity.y = 0.0

        window.addEventListener( 'vertex_drag', onVertexDrag, false );
        window.addEventListener( 'menu_action', onMenuAction, false );
    }

    create(parent_div){
        width = parent_div.offsetWidth
        height = parent_div.offsetHeight
        layout.centrals_first(g,{width:width,height:height})
        create_bodies()
    }

    run(){
        const{delta,correction} = get_delta_correction();
        Matter.Engine.update(engine,delta,correction);
        for(let [vid,v] of Object.entries(g.vertices)){
            v.viewBox.x = v.body.position.x
            v.viewBox.y = v.body.position.y
            v.viewBox.angle = 180*v.body.angle / Math.PI
            v.viewBox.moved |= (v.body.speed > 0)
        }
    }

}

export {Physics};

