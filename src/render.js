import {html,clear} from "../libs/web-js-utils.js"
import {Svg} from "../libs/svg_utils.js"

let utl = new Svg()

let g = null;
let svg = null;

class Render{
    constructor(graph_data){
        g = graph_data
    }

    init(parent_div){
        let [w,h] = [parent_div.offsetWidth,parent_div.offsetHeight]
        svg = html(parent_div,/*html*/`<svg id="main_svg" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"></svg>`);
        utl.set_parent(svg)
    }

    setViewBoxes(config){
        let check_canvas = document.createElement("canvas")
        let ctx = check_canvas.getContext("2d")
        ctx.font = config.font
        let m = config.margin * 2
        for(let [vid,v] of Object.entries(g.vertices)){
            let box = ctx.measureText(v.label)
            let height = box.fontBoundingBoxAscent + box.fontBoundingBoxDescent
            v.viewBox = {width:box.width+m,height:height+m}
        }
    }

    draw(){
        clear(svg)
        for(let [vid,v] of Object.entries(g.vertices)){
            v.svg = utl.rect(-v.viewBox.width/2,-v.viewBox.height/2,v.viewBox.width,v.viewBox.height)
            v.svg.setAttribute("transform", `translate(${v.viewBox.x},${v.viewBox.y}) rotate(${0})`);
        }
    }

    move(){
        for(let [vid,v] of Object.entries(g.vertices)){
            v.svg.setAttribute("transform", `translate(${v.viewBox.x},${v.viewBox.y}) rotate(${v.viewBox.angle})`);
        }
    }

}

export {Render};

