
let g = null;
let engine = null;

function centrality(vertices){
    let central = []
    for(let [vid,v] of Object.entries(vertices)){
        //could here add configurable centrality with weights
        central.push({c:Object.keys(v.edges).length,v:v})
    }
    central.sort((a,b)=>{return (b.c - a.c)})

    let sorted = []
    central.forEach((obj)=>{
        sorted.push(obj.v)
    })
    return sorted
}

function samples_in_rect(nb,w,h,box_w,box_h){
    let res = []
    for(let i = 0;i<nb; i++){
        res.push({
            x:Math.round(box_w/2 + (Math.random()*(w-box_w))),
            y:Math.round(box_h/2 + (Math.random()*(h-box_h)))
        })
    }
    return res
}

function distance(va,vb){
    const dx = va.x-vb.x
    const dy = va.y-vb.y
    return Math.sqrt(dx * dx + dy * dy)
}

function walls_distance(point,w,h){
    let walls_dist = []
    walls_dist.push(Math.abs(point.x))
    walls_dist.push(Math.abs(point.y))
    walls_dist.push(Math.abs(w-point.x))
    walls_dist.push(Math.abs(h-point.y))
    return Math.min(...walls_dist)
}

function neighbors_walls_cost(sample,seeds,w,h,walls){
    let free_dist = []
    for(let j= 0;j<seeds.length;j++){
        free_dist.push(distance(sample,seeds[j].viewBox))
    }
    if(walls){
        free_dist.push(walls_distance(sample,w,h))
    }
    const min_free_dist = Math.min(...free_dist)//the minimal distance is taken to reject the sample
    return ((min_free_dist < 10)?10000:(100.0/min_free_dist))
}

function sample_free_neighbors(v,placed,width,height,debug=false){
    let best_index = -1
    let best_cost = Number.MAX_VALUE;
    const nb_samples = 100
    let samples = samples_in_rect(nb_samples,width,height,v.viewBox.width,v.viewBox.height)
    for(let i=0;i<nb_samples;i++){
        const s = samples[i]
        const cost = neighbors_walls_cost(s,placed,width,height,true)
        if(debug){
            console.log(`   cost: ${cost.toFixed(2)}`)
        }
        if(cost < best_cost){
            best_index = i
            best_cost = cost
        }
    }
    if(debug){
        console.log(`best_cost = ${best_cost.toFixed(2)}`)
    }
    let best_sample = samples[best_index]
    return [best_sample.x,best_sample.y]

    //let x,y
    //x = v.viewBox.width/2 + Math.round((width-v.viewBox.width) * Math.random())
    //y = v.viewBox.height/2 + Math.round((height-v.viewBox.height) * Math.random())
    //return [x,y]
}

let last_run = 0;
let last_delta = 0;

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

class Physics{
    constructor(graph_data){
        g = graph_data
        engine = Matter.Engine.create({enableSleeping:true})
        engine.world.gravity.y = 0.0
    }

    create(parent_div){
        let width = parent_div.offsetWidth
        let height = parent_div.offsetHeight
        let central_order = centrality(g.vertices)
        let placed = []
        for(let [vid,v] of Object.entries(central_order)){
            [v.viewBox.x,v.viewBox.y] = sample_free_neighbors(v,placed,width,height)
            placed.push(v)
            v.body = Matter.Bodies.rectangle(v.viewBox.x,v.viewBox.y,v.viewBox.width,v.viewBox.height,
                {id:v.id,mass:5,frictionAir:0.3}
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

