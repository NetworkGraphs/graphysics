import { defined,true_defined } from "../libs/web-js-utils.js";
import {Geometry} from "../libs/geometry.js"
let geom = new Geometry()

let g = null;
let engine = null;
let width=0,height=0;
let last_run = 0;
let last_delta = 0;
let drag = {}
let to_run_layout = false

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

function keep_horizontal(body){
    const delta = 0 - body.angle;
    body.torque = 0.5 * delta;//P controller, the air friction will do the rest
}
function dist_to_force(dist){
    let force = 0
    if(dist < 150){
        force = -0.03;
    }
    if(dist > 250){
        force = 0.03;
    }
    return force
}
function attract_neighbors(vertex){
    for(let [vid,v] of Object.entries(vertex.neighbors)){
        const dist = geom.distance(vertex.body.position,v.body.position)
        const force = dist_to_force(dist)
        if(force != 0){
            let v_force = geom.modulate(v.body.position,vertex.body.position,force)
            v.body.force = v_force
            console.log(`forcing ${v.label} <= ${vertex.label} : ${force} (${v_force.x.toFixed(1)},${v_force.y.toFixed(1)})`)
        }
    }
}

function apply_custom_forces(){
    for(let [vid,v] of Object.entries(g.vertices)){
        keep_horizontal(v.body);
        if(v.forces.used){
            if(true_defined(v.forces.attract_neighbors)){
                attract_neighbors(v);
            }
        }
    }
}

class Physics{
    constructor(graph_data){
        g = graph_data
        engine = Matter.Engine.create({enableSleeping:true})
        engine.world.gravity.y = 0.0

        window.addEventListener( 'vertex_drag', onVertexDrag, false );
        this.paused = false
    }

    create_bodies(parent_div){
        width = parent_div.offsetWidth
        height = parent_div.offsetHeight
        for(let [vid,v] of Object.entries(g.vertices)){
            v.body = Matter.Bodies.rectangle(v.viewBox.x,v.viewBox.y,v.viewBox.width,v.viewBox.height,
                {id:v.id,label:v.label,mass:5,frictionAir:0.3}
                )
            Matter.World.addBody(engine.world,v.body)
            v.viewBox.placed = false//allows to override physics
            v.viewBox.moved = true
        }
    }

    place_body(v){
        if(!defined(v.pinned) || !v.pinned){
            Matter.Body.setPosition(v.body,Matter.Vector.create(v.viewBox.x,v.viewBox.y))
            v.viewBox.moved |= true
        }
    }
    pause(){
        this.paused = true
    }
    resume(){
        this.paused = false
    }
    run(){
        if(this.paused){
            return
        }

        apply_custom_forces();
        const{delta,correction} = get_delta_correction();
        Matter.Engine.update(engine,delta,correction);
        for(let [vid,v] of Object.entries(g.vertices)){
            if(v.viewBox.placed){
                this.place_body(v)
                v.viewBox.placed = false
                v.viewBox.moved |= true
            }
            v.viewBox.x = v.body.position.x
            v.viewBox.y = v.body.position.y
            v.viewBox.angle = v.body.angle
            v.viewBox.moved |= (v.body.speed > 0)
        }
    }

}

export {Physics};

