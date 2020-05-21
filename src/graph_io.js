import {fetch_json,fetch_xml} from "./utils.js"
import {defined} from "../libs/web-js-utils.js"

let g = null;

function element_to_map(element){
    let res = {};
    for(let j = 0; j < element.attributes.length; j++){
        let attribute = element.attributes[j];
        res[attribute.name] = attribute.value;
    }
    let data = element.getElementsByTagName("data");
    for(let j = 0; j < data.length; j++){
        let key = data[j].getAttribute("key");
        let value = data[j].textContent;
        res[key] = value;
    }
return res;
}

function replace(obj,bad,good){
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
    replace(res,"_id","id")
    replace(res,"_type","type")
    return res;
}

function replace_edge(edge){
    replace(edge,"_id","id")
    replace(edge,"_label","label")
    if(!defined(edge.label) && defined(name)){
        edge.label = edge.name;
    }
    replace(edge,"_type","type")
    replace(edge,"_inV", "inV")
    replace(edge,"_outV","outV")
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
    let res = import_to_obj_graph(graph);
    add_references(res);
    return res
}

function import_xml_graph(xmlDoc){
    let graph = {};
    graph.vertices = {};
    graph.edges = {};
    let verticesNodes = xmlDoc.getElementsByTagName("node");
    console.log(`graph> graphml file has ${verticesNodes.length} vertices`);
    if(verticesNodes.length == 0){
        alert("no vertices (nodes) found in graphml");
        return;
    }
    for(let i = 0; i < verticesNodes.length; i++){
        let v_node = verticesNodes[i];
        let vid = v_node.getAttribute("id");
        graph.vertices[vid] = element_to_map(v_node);
    }
    let edgeNodes = xmlDoc.getElementsByTagName("edge");
    console.log(`graph> graphml file has ${edgeNodes.length} edges`);
    for(let i = 0; i < edgeNodes.length; i++){
        let e_node = edgeNodes[i];
        let eid = e_node.getAttribute("id");
        let edge = element_to_map(e_node);
        replace(edge,"source","outV");
        replace(edge,"target","inV");
        graph.edges[eid] = edge;
    }
    add_references(graph);
    return graph
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
                let xmlDoc = await fetch_xml(file)
                let res = import_xml_graph(xmlDoc)
                g.vertices = res.vertices
                g.edges = res.edges
                return
            }
        }else if(typeof(file) == "drop"){

        }else{
            return
        }
    }

}

export {GraphIo};

