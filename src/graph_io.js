import {fetch_json} from "./utils.js"
import {defined} from "../libs/web-js-utils.js"

let g = null;

function replace(obj,good,bad){
    if(!defined(obj[good])){
        if(defined(obj[bad])){
            obj[good] = obj[bad]
            delete obj[bad]
        }
    }
}

function import_vertex(vertex){
    let res = vertex;
    res.label = defined(vertex.label)?vertex.label:vertex.name;
    replace(res,"id","_id")
    replace(res,"type","_type")
    return res;
}

function replace_edge(edge){
    replace(edge,"id","_id")
    replace(edge,"label","_label")
    if(!defined(edge.label) && defined(name)){
        edge.label = edge.name;
    }
    replace(edge,"type","_type")
    replace(edge,"inV","_inV")
    replace(edge,"outV","_outV")
    edge.weight =defined(edge.weight)?edge.weight:1;
}

function add_references(graph){
    for(let [vid,v] of Object.entries(graph.vertices)){
        v.neighbors = {};
        v.in_neighbors = {};
        v.out_neighbors = {};
        v.edges = {};
        for(let [eid,e] of Object.entries(graph.edges)){
                if(e.inV == vid){
                    v.in_neighbors[e.outV] = graph.vertices[e.outV];
                    v.neighbors[e.outV] = graph.vertices[e.outV];
                    v.edges[eid] = graph.edges[eid];
                }
                if(e.outV == vid){
                    v.out_neighbors[e.inV] = graph.vertices[e.inV];
                    v.neighbors[e.inV] = graph.vertices[e.inV];
                    v.edges[eid] = graph.edges[eid];
                }
            }
    }
    for(let [eid,e] of Object.entries(graph.edges)){
        e.inV = graph.vertices[e.inV]
        e.outV = graph.vertices[e.outV]
    }
}

function import_to_obj_graph(graph){
    let res = {};
    res.vertices = {};
    graph.vertices.forEach(vertex => {
        res.vertices[vertex.id]=vertex;
    });
    res.edges = {};
    graph.edges.forEach(edge => {
        res.edges[edge.id]=edge;
    });
    add_references(res);
    return res;
}


function import_json_graph(input){
    //    ----    support both graph structures    ----
    let graph = {};
    if(defined(input.graph)){
        graph = input.graph;
    }
    else{
        if(defined(input.vertices)){
            graph.vertices = input.vertices;
            graph.edges = input.edges;
        }
    }
    //    ----    Unify parameters names    ----
    graph.vertices.forEach(vertex =>{
        vertex = import_vertex(vertex);
    });
    graph.edges.forEach(edge => {
        replace_edge(edge);
    });
    
    return import_to_obj_graph(graph);
}

class GraphIo{
    constructor(graph_data){
        g = graph_data
    }

    async import_file(file){
        if(typeof(file) == "string"){
            let extension = file.split('.').pop();
            if(extension == "json"){
                let data = await fetch_json(file)
                let res = import_json_graph(data)
                g.vertices = res.vertices
                g.edges = res.edges
                return
            }else if(extension == "graphml"){
                return
            }
        }else if(typeof(file) == "drop"){

        }else{
            return
        }
    }

}

export {GraphIo};

