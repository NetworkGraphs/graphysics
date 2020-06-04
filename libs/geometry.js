import {Vector} from "./Vector.js"
import { defined } from "./web-js-utils.js"

//* [wikipedia - lines intersection](https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection)


let min = Math.min
let max = Math.max
let abs = Math.abs
let pi = Math.PI
let two_pi = Math.PI * 2

function dist_sqr(va,vb){
    const dx = va.x-vb.x
    const dy = va.y-vb.y
    return (dx * dx + dy * dy)
}

function mod_2_pi(angle){
    if(angle < 0){
        angle = angle + two_pi
    }
    else if(angle > two_pi){
        angle = angle - two_pi
    }
    return angle%two_pi
}

function betwee_angles(ref,a1,a2){
    let sum1 = mod_2_pi(ref - a1)
    let sum2 = mod_2_pi(a2 - ref)
    let res = ((sum1+sum2) <= pi)
    //console.log(`${ref.toFixed(2)}  ${res?"is":"is not"} between [${a1.toFixed(2)},${a2.toFixed(2)}] `)
    //console.log(`sum1=${sum1} sum2=${sum2} `)
    return res
}

class Geometry{
    center(va,vb){
        return ({x:(va.x+vb.x)/2,y:(va.y+vb.y)/2})
    }
    
    distance(va,vb){
        const dx = va.x-vb.x
        const dy = va.y-vb.y
        return Math.sqrt(dx * dx + dy * dy)
    }
    
    walls_distance(point,w,h){
        let walls_dist = []
        walls_dist.push(abs(point.x))
        walls_dist.push(abs(point.y))
        walls_dist.push(abs(w-point.x))
        walls_dist.push(abs(h-point.y))
        return min(...walls_dist)
    }
    
    interpolate(p1,p2,dist){
        const dir = Vector.normalise(Vector.sub(p2,p1))
        return Vector.add(p1,Vector.mult(dir,dist))
    }

    modulate(p1,p2,dist){
        const dir = Vector.normalise(Vector.sub(p2,p1))
        return Vector.mult(dir,dist)
    }

    edge_offset(e,offset){
        let p1,p2
        if(defined(e.p1) &&defined(e.p2)){
            p1 = e.p1
            p2 = e.p2
        }else{
            p1 = e.outV.viewBox
            p2 = e.inV.viewBox
        }
        const edge_dir = Vector.sub(p1,p2)
        let offset_dir = Vector.perp(edge_dir)
        let offset_dir_n = Vector.normalise(offset_dir)
        let offset_vect = Vector.mult(offset_dir_n,offset)
        let res_p1 = Vector.add(p1,offset_vect)
        let res_p2 = Vector.add(p2,offset_vect)
        return {p1:res_p1,p2:res_p2}
    }

    edge_distance(point,edge){
        const debug = false
        const epsilon = 1//unit is pixels therefore 1 is already too small
        const p = {x:point.viewBox.x,y:point.viewBox.y}
        const e1 = {x:edge.inV.viewBox.x,y:edge.inV.viewBox.y}
        const e2 = {x:edge.outV.viewBox.x,y:edge.outV.viewBox.y}
    
        const length = dist_sqr(e1,e2)
        if(length < epsilon){
            return [this.distance(p,e1),false]
        }
        let t = ((p.x - e1.x) * (e2.x - e1.x) + (p.y - e1.y) * (e2.y - e1.y)) / length;
        t = max(0, min(1, t));
        const projection = {    x: e1.x + t * (e2.x - e1.x),
                                y: e1.y + t * (e2.y - e1.y) }
        //check if projection is outside the edge segment
        const e1_p = Vector.sub(p,e1)
        const p_e2 = Vector.sub(e2,p)
        const e1_e2 = Vector.sub(e2,e1)
        if(Vector.dot(e1_p,e1_e2) < 0){//point beyond e1
            const d = this.distance(p,e1)
            return [d,false]
        }else if(Vector.dot(e1_e2,p_e2) < 0){//point beyond e2
            const d = this.distance(p,e2)
            return [d,false]
        }else{
            const d = this.distance(p,projection)
            return [d,true]
        }
    }

    rel_to_abs(box,point){
        let res = Vector.rotate(point,box.angle)
        return Vector.add(res,box)
    }

    edge_box_int(edge,box){
        let p1,p2
        if(defined(edge.p1) &&defined(edge.p2)){
            p1 = edge.p1
            p2 = edge.p2
        }else{
            p1 = {x:edge.outV.viewBox.x,y:edge.outV.viewBox.y}
            p2 = {x:edge.inV.viewBox.x,y:edge.inV.viewBox.y}
        }
        let diag_angle = Math.atan2(box.height,box.width)
        const w2 = box.width / 2
        const h2 = box.height / 2
        box.p1 = this.rel_to_abs(box,{x:w2,y:h2})
        box.p2 = this.rel_to_abs(box,{x:-w2,y:h2})
        box.p3 = this.rel_to_abs(box,{x:-w2,y:-h2})
        box.p4 = this.rel_to_abs(box,{x:w2,y:-h2})
        let edge_box_angle = Vector.angle(p2,p1)
        //let deb = Vector.sub(p2,p1)
        //let angle = Math.atan2(deb.y, deb.x)
        //console.log(`(${edge.outV.label} - ${edge.inV.label}) [${deb.x.toFixed(2)},${deb.y.toFixed(2)}] angle = ${edge_box_angle.toFixed(2)} = ${angle.toFixed(2)}`)
        box.p1.angle = Vector.angle(box,box.p1)
        box.p2.angle = Vector.angle(box,box.p2)
        box.p3.angle = Vector.angle(box,box.p3)
        box.p4.angle = Vector.angle(box,box.p4)
        //console.log(box)
        let int_point
        if(betwee_angles(edge_box_angle,box.p4.angle,box.p1.angle)){
            int_point = this.intersection({v1:box.p1,v2:box.p4},{v1:p1,v2:p2})
        }else if(betwee_angles(edge_box_angle,box.p1.angle,box.p2.angle)){
            int_point = this.intersection({v1:box.p1,v2:box.p2},{v1:p1,v2:p2})
        }else if(betwee_angles(edge_box_angle,box.p2.angle,box.p3.angle)){
            int_point = this.intersection({v1:box.p2,v2:box.p3},{v1:p1,v2:p2})
        }else{
            int_point = this.intersection({v1:box.p3,v2:box.p4},{v1:p1,v2:p2})
        }
        return {angle:pi+edge_box_angle,x:int_point.x,y:int_point.y}
    }

    /**
     * returns the intersection point of two lines defined by e1 and e2
     * @param {*} e1 edge with two points on line 1
     * @param {*} e2 edge with two points on line 2
     */
    intersection(e1,e2){
        const x1 = e1.v1.x
        const y1 = e1.v1.y
        const x2 = e1.v2.x
        const y2 = e1.v2.y
        const x3 = e2.v1.x
        const y3 = e2.v1.y
        const x4 = e2.v2.x
        const y4 = e2.v2.y
        const x1_y2_m_y1_x2 = (x1*y2 - y1*x2)
        const x3_y4_m_y3_x4 = (x3*y4 - y3*x4)
        const denominator = ((x1-x2)*(y3-y4) - (y1-y2)*(x3-x4))
        return {x:(x1_y2_m_y1_x2*(x3-x4) - (x1-x2)*x3_y4_m_y3_x4) / denominator,
                y:(x1_y2_m_y1_x2*(y3-y4) - (y1-y2)*x3_y4_m_y3_x4) / denominator}
    }

    /**
     * returns the intersection point of two lines defined by edge1={p1,p2} and edge2={p3,p4}
     */
    intersection_points(p1,p2,p3,p4){
        const x1 = p1.x
        const y1 = p1.y
        const x2 = p2.x
        const y2 = p2.y
        const x3 = p3.x
        const y3 = p3.y
        const x4 = p4.x
        const y4 = p4.y
        const x1_y2_m_y1_x2 = (x1*y2 - y1*x2)
        const x3_y4_m_y3_x4 = (x3*y4 - y3*x4)
        const denominator = ((x1-x2)*(y3-y4) - (y1-y2)*(x3-x4))
        return {x:(x1_y2_m_y1_x2*(x3-x4) - (x1-x2)*x3_y4_m_y3_x4) / denominator,
                y:(x1_y2_m_y1_x2*(y3-y4) - (y1-y2)*x3_y4_m_y3_x4) / denominator}
    }

    /**
     * returns true if edges segments intersect each other (not the full lines scope)
     * common point segments will return true intersection result
     * @param {*} e1 
     * @param {*} e2 
     */
    intersect(e1,e2){
        const epsilon = 1
        const epsilon_a = 0.0001
        const x1 = e1.inV.viewBox.x
        const y1 = e1.inV.viewBox.y
        const x2 = e1.outV.viewBox.x
        const y2 = e1.outV.viewBox.y
        const x3 = e2.inV.viewBox.x
        const y3 = e2.inV.viewBox.y
        const x4 = e2.outV.viewBox.x
        const y4 = e2.outV.viewBox.y

        if(max(x1,x2) < min(x3,x4)){
            return false
        }
        if(min(x1,x2) > max(x3,x4)){
            return false
        }
        if(max(y1,y2) < min(y3,y4)){
            return false
        }
        if(min(y1,y2) > max(y3,y4)){
            return false
        }
        //we are within bounding boxes
        if(Math.abs(x1-x2) < epsilon){//A1 is vertical
            if((x3<x1)&&(x4>x1)){
                return true
            }
            if((x3>x1)&&(x4<x1)){
                return true
            }
        }
        if(Math.abs(x3-x4) < epsilon){//A2 is vertical
            if((x1<x3)&&(x2>x3)){
                return true
            }
            if((x1>x3)&&(x2<x3)){
                return true
            }
        }
        //safe division as not vertical
        const a1 = (y1-y2)/(x1-x2)
        const a2 = (y3-y4)/(x3-x4)
        if(Math.abs(a1-a2) < epsilon_a){//parallel
            return false
        }
        //safe division as not parallel
        const b1 = y1 - a1*x1
        const b2 = y3 - a2*x3
        const xa = (b2-b1)/(a1-a2)
        if( ( xa < max(min(x1,x2), min(x3,x4)) )
            ||
            ( xa > min(max(x1,x2), max(x3,x4)) )
        ){
            return false
        }else{
            return true
        }
    }

    compute_path_points(path,step_size){
        let res = []
        const path_lenght = path.getTotalLength()
        const nb_steps = Math.round(path_lenght / step_size)
        for(let i=0;i<nb_steps;i++){
            let dist = step_size * i
            res.push(path.getPointAtLength(dist))
        }
        console.log(`path length: ${path_lenght.toFixed(1)} , step:${step_size} , nb:${nb_steps}`)
        return res
    }

    inside_id(x,y,id){
        let res = document.elementFromPoint(x,y)
        if(res == null){
            return false
        }else{
            return (res.id == id)
        }
    }

    bounding_box(vertices){
        let max_x = Number.MIN_VALUE
        let max_y = Number.MIN_VALUE
        let min_x = Number.MAX_VALUE
        let min_y = Number.MAX_VALUE
        console.log(vertices)
        for(let [vid,v] of Object.entries(vertices)){
            if(v.viewBox.x < min_x){
                min_x = v.viewBox.x
            }
            if(v.viewBox.x > max_x){
                max_x = v.viewBox.x
            }
            if(v.viewBox.y < min_y){
                min_y = v.viewBox.y
            }
            if(v.viewBox.y > max_y){
                max_y = v.viewBox.y
            }
        }
        return {x:min_x,y:min_y,width:max_x-min_x,height:max_y-min_y}
    }

    vertices_box(vertex){
        let w2 = vertex.viewBox.width / 2
        let h2 = vertex.viewBox.height / 2
        let min_x = vertex.viewBox.x - w2
        let min_y = vertex.viewBox.y - h2
        let max_x = vertex.viewBox.x + w2
        let max_y = vertex.viewBox.y + h2
        for(let [vid,v] of Object.entries(vertex.group.neighbors)){
            let wv2 = v.viewBox.width / 2
            let hv2 = v.viewBox.height / 2
            let tx = v.viewBox.x - wv2
            let bx = v.viewBox.x + wv2
            let ty = v.viewBox.y - hv2
            let by = v.viewBox.y + hv2
            if(tx < min_x){
                min_x = tx
            }
            if( bx > max_x){
                max_x = bx
            }
            if(ty < min_y){
                min_y = ty
            }
            if(by > max_y){
                max_y = by
            }
        }
        return {x:min_x,y:min_y,width:max_x-min_x,height:max_y-min_y}
    }

}

export{Geometry}
