import {defined,html} from "./web-js-utils.js"

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
            <filter id="${params.id}" width="200%" height="200%">
                <feDiffuseLighting in="SourceGraphic" result="light" light-color="white">
                    <fePointLight x="-30" y="-10" z="20"></fePointLight>
                </feDiffuseLighting>
                <feComposite in="SourceGraphic" in2="light" operator="arithmetic" k1="0.8" k2="0.2" k3="0" k4="0"></feComposite>
                <feDropShadow dx="10" dy="5" stdDeviation="3"></feDropShadow>
            </filter>`)
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
