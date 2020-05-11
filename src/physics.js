import {centrality,select_vertex_position} from "./layout/sampling.js"

let g = null;
let engine = null;

let last_run = 0;
let last_delta = 0;
let drag = {}

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

function onMouseVertex(e){
    if(e.detail.type == "drag_start"){
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
    }else if(e.detail.type == "drag_end"){
        console.log(`drag end`)
        Matter.World.remove(engine.world,drag.constraint);
    }else if(e.detail.type == "drag_move"){
        drag.position = Matter.Vector.add(drag.position,Matter.Vector.create(e.detail.tx,e.detail.ty));
        drag.constraint.pointB = drag.position;
    }
}

class Physics{
    constructor(graph_data){
        g = graph_data
        engine = Matter.Engine.create({enableSleeping:true})
        engine.world.gravity.y = 0.0

        window.addEventListener( 'mouse_vertex', onMouseVertex, false );
    }

    create(parent_div){
        let width = parent_div.offsetWidth
        let height = parent_div.offsetHeight
        let central_order = centrality(g.vertices)
        let already_placed = []
        for(let [vid,v] of Object.entries(central_order)){
            [v.viewBox.x,v.viewBox.y] = select_vertex_position(v,already_placed,width,height)//for debug : ,(v.id==6)
            already_placed.push(v)
            v.body = Matter.Bodies.rectangle(v.viewBox.x,v.viewBox.y,v.viewBox.width,v.viewBox.height,
                {id:v.id,label:v.label,mass:5,frictionAir:0.3}
                )
            Matter.World.addBody(engine.world,v.body)
        }
    }

    run(){
        const{delta,correction} = get_delta_correction();
        Matter.Engine.update(engine,delta,correction);
        for(let [vid,v] of Object.entries(g.vertices)){
            v.viewBox.x = v.body.position.x
            v.viewBox.y = v.body.position.y
            v.viewBox.angle = 180*v.body.angle / Math.PI
            v.viewBox.moved = (v.body.speed > 0)
        }
    }

}

export {Physics};

