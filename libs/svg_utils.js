import {defined,html,html_tag} from "./web-js-utils.js"

function color_list_to_stops(color_list){
    let res = ""
    color_list.forEach((color,index)=>{
        const percent = (100 * index / (color_list.length-1)).toFixed(0)
        res += /*html*/`<stop offset="${percent}%" stop-color="${color}"/>`
    })
    return res
}

class Svg{
    constructor(svg_element){
        this.el = svg_element
    }
    set_parent(svg_element){
        this.el = svg_element
    }
    
    path(d,color,opacity){
        return html(this.el,
        /*html*/`<path d="${d}" stroke="red" stroke-width="0" fill="${color}" fill-opacity="${opacity}"/>`
        )
    }

    text(x,y,str){
        html(this.el,/*html*/`<text x="${x}" y="${y}">${str}</text>`)
    }

    circle(x,y,params={}){
        //if(!defined(params.parent)){parent=this.el}
        let if_id = (defined(params.id))?`id=${params.id}`:""
        return html(this.el,
        /*html*/`<circle ${if_id} cx=${x} cy=${y} r="3" stroke="black" stroke-width="3" fill="red" />`
        );
    }

    circ(x,y){
        //if(parent==null){parent=this.el}
        return html(this.el,
        /*html*/`<circle cx=${x} cy=${y} r="3" stroke="black" stroke-width="3" fill="red" />`
        );
    }
    
    pie_dash(parent,x,y,radius_start,radius_stop,angle_start,angle_stop){
        const circ_rad = (radius_start+radius_stop) / 2
        const stroke_width = (radius_stop - radius_start)
        const circ_length = 2 * Math.PI * circ_rad
        const dash_length = (angle_stop - angle_start) * circ_length
        const dash_start = angle_start * circ_length
        return html_tag(parent,"circle",/*html*/`
        <circle cx=${x} cy=${y} r="${circ_rad}" 
            stroke-dasharray="${dash_length} ${circ_length}" 
            stroke-dashoffset="${dash_start}" 
            stroke-width="${stroke_width}" 
            stroke="rgba(0,100,0,0.5)" 
            fill="rgba(0,0,0,0)" />
        `);
    }

    /**
     * 
     * @param {*} parent : parent SVG element
     * @param {*} x : x coordinates of the pie arcs center
     * @param {*} y : y coordinates of the pie arcs center
     * @param {*} radius_start : small radius
     * @param {*} radius_stop : big radius
     * @param {*} angle_start : beginning in a scale of [0,1] for the whole 360° circle
     * @param {*} angle_stop  : stop in a scale of [0,1] for the whole 360° circle
     * @param {*} color : filling color
     */
    pie(parent,x,y,radius_start,radius_stop,angle_start,angle_stop,margin){
        const s_marg = margin * radius_stop / radius_start
        const small_start_x = x + radius_start * Math.cos((angle_start + s_marg) * 2 * Math.PI)
        const small_start_y = y + radius_start * Math.sin((angle_start + s_marg) * 2 * Math.PI)
        const small_stop_x  = x + radius_start * Math.cos((angle_stop  - s_marg)  * 2 * Math.PI)
        const small_stop_y  = y + radius_start * Math.sin((angle_stop  - s_marg)  * 2 * Math.PI)

        const big_start_x   = x + radius_stop  * Math.cos((angle_start + margin) * 2 * Math.PI)
        const big_start_y   = y + radius_stop  * Math.sin((angle_start + margin) * 2 * Math.PI)
        const big_stop_x    = x + radius_stop  * Math.cos((angle_stop - margin)  * 2 * Math.PI)
        const big_stop_y    = y + radius_stop  * Math.sin((angle_stop - margin)  * 2 * Math.PI)

        //(rx ry x-axis-rotation large-arc-flag sweep-flag x y)
        return html_tag(parent,"path",/*html*/`
        <path   d=" M ${small_start_x} ${small_start_y} 
                    A ${radius_start},${radius_start} 0,0,1 ${small_stop_x},${small_stop_y}
                    L ${big_stop_x} ${big_stop_y} 
                    A ${radius_stop},${radius_stop} 0,0,0 ${big_start_x},${big_start_y}
                    L ${small_start_x} ${small_start_y} 
                    Z
                    "
                stroke-width="0" />
        `)
    }
    
    circle_p_id(parent,x,y,id){
        //
        return html(parent,
        /*html*/`<circle id=${id} cx=${x} cy=${y} r="3" stroke="black" stroke-width="2" fill="#1F7BFD" />`
        );
    }
    
    rect(x,y,w,h){
        return html(this.el,
        /*html*/`<rect x="${x}" y="${y}" rx="3" width="${w}" height="${h}" stroke="black" stroke-width="0" fill="green" />`
        );
    }
    
    rect_p(parent,x,y,w,h){
        return html(parent,
        /*html*/`<rect x="${x}" y="${y}" rx="3" width="${w}" height="${h}" stroke="black" stroke-width="0" fill="green" />`
        );
    }
    
    box(b){
        return html(this.el,
        /*html*/`<rect x="${b.x}" y="${b.y}" rx="5" width="${b.width}" height="${b.height}" stroke="black" stroke-width="0" fill="green" />`
        );
    }
    
    eline(e,col){
        let d = `M ${e.v1.x} ${e.v1.y} L ${e.v2.x} ${e.v2.y} `
        return html(this.el,
        /*html*/`<path d="${d}" stroke="${col}" stroke-width="2" />`
        )
    }
    
    line(l,col){
        let d = `M ${l.p1.x} ${l.p1.y} L ${l.p2.x} ${l.p2.y} `
        return html(this.el,
        /*html*/`<path d="${d}" stroke="${col}" stroke-width="2" />`
        )
    }
    
    pline(v1,v2,col){
        let d = `M ${v1.x} ${v1.y} L ${v2.x} ${v2.y} `
        return html(this.el,
        /*html*/`<path d="${d}" stroke="${col}" stroke-width="1" />`
        )
    }

    pattern(parent,url,w,h){
        return html(parent,/*html*/`
            <defs>
                <pattern id="image" x="0" y="0" patternUnits="userSpaceOnUse" height="1" width="1" >
                    <image x="0" y="0" xlink:href=${url} ></image>
                </pattern>
            </defs>
            <rect width="${w}" height="${h}" fill="url(#image)" fill-opacity="0.1"/>
        `)
    }

    filter_turb_disp(parent,params){
        return html(parent,/*html*/`
            <filter id="${params.id}">
            <feTurbulence type="turbulence" baseFrequency="${params.turb_freq}"
                numOctaves="2" result="turbulence"/>
            <feDisplacementMap in2="turbulence" in="SourceGraphic"
                scale="${params.disp_scale}" xChannelSelector="R" yChannelSelector="A"/>
            </filter>
      `)
    }

    filter_light_shadow(parent,params){
        return html(parent,/*html*/`
            <filter id="${params.id}" x="-50%" width="200%" y="-50%" height="200%">
                <feDiffuseLighting in="SourceGraphic" result="light" light-color="white">
                    <fePointLight x="${params.lx}" y="${params.ly}" z="${params.lz}"></fePointLight>
                </feDiffuseLighting>
                <feComposite in="SourceGraphic" in2="light" operator="arithmetic" k1="0.8" k2="0.2" k3="0" k4="0"></feComposite>
                <feDropShadow dx="${params.dx}" dy="${params.dy}" stdDeviation="3"></feDropShadow>
            </filter>`)
    }
    filter_light(parent,params){
        return html(parent,/*html*/`
            <filter id="${params.id}" width="200%" height="200%">
                <feDiffuseLighting in="SourceGraphic" result="light" light-color="white">
                    <fePointLight x="${params.lx}" y="${params.ly}" z="${params.lz}"></fePointLight>
                </feDiffuseLighting>
                <feComposite in="SourceGraphic" in2="light" operator="arithmetic" k1="0.8" k2="0.2" k3="0" k4="0"></feComposite>
            </filter>`)
    }
    filter_shadow(parent,params){
        return html(parent,/*html*/`
            <filter id="${params.id}" width="200%" height="200%">
                <feDropShadow dx="${params.dx}" dy="${params.dy}" stdDeviation="3"></feDropShadow>
            </filter>`)
    }
    gradient_linear(parent,params){
        return html(parent,/*html*/`
            <linearGradient id="${params.id}" x1="0%" y1="0%" x2="0%" y2="100%">
            ${color_list_to_stops(params.colors)}
            </linearGradient>
            `)
    }
    gradient_radial(parent,params){
        return html(parent,/*html*/`
            <radialGradient id="${params.id}" cx="0%" cy="0%">
            ${color_list_to_stops(params.colors)}
            </radialGradient>
            `)
    }
  
    save(fileName,evg_element=null){
        if(evg_element == null){evg_element = this.el}
        let s = new XMLSerializer();
        const svg_str = s.serializeToString(evg_element);
        var blob = new Blob([svg_str], {type: 'image/svg+xml'});
        saveAs(blob, fileName);
    }
    
}

export{
    Svg
}
