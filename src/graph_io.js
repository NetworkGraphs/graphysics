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

function select_label(obj){
    if(!defined(obj.label) && defined(obj.name)){
        obj.label = obj.name;
    }
}

function rename_vertex(vertex){
    replace(vertex,"_label","label")
    replace(vertex,"_type", "type")

    select_label(vertex)
}

function rename_edge(edge){
    
    replace(edge,"_label",  "label")
    replace(edge,"_type",   "type")
    replace(edge,"_inV",    "inV")
    replace(edge,"_outV",   "outV")
    replace(edge,"source",  "outV");
    replace(edge,"target",  "inV");

    select_label(edge)
    edge.weight =defined(edge.weight)?edge.weight:1;
}
function rename_properties(graph){
    for(let [vid,v] of Object.entries(graph.vertices)){
        rename_vertex(v)
    }
    for(let [eid,e] of Object.entries(graph.edges)){
        rename_edge(e)
    }
}
function rename_list_ids(graph){
    graph.vertices.forEach(vertex => {
        replace(vertex,"_id",   "id")
    });
    graph.edges.forEach(edge => {
        replace(edge,"_id",   "id")
    });
}

function add_references_from_ids(graph){
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

function add_multi_edges_info(graph){
    //reset counts to 0
    for(let [vid,v] of Object.entries(graph.vertices)){
        v.multi = {}
        v.multi.edge_count = {}
        v.multi.edge_index = {}
        for(let [nid,neighbor] of Object.entries(v.neighbors)){
            v.multi.edge_count[nid] = 0
            v.multi.edge_index[nid] = 0
        }
    }
    //add edges to each neighbor's counter
    for(let [vid,v] of Object.entries(graph.vertices)){
        for(let [eid,edge] of Object.entries(v.edges)){
            let partner_id = (edge.inV.id != v.id)?edge.inV.id:edge.outV.id
            v.multi.edge_count[partner_id] += 1
        }
    }
    for(let [eid,e] of Object.entries(graph.edges)){
        e.multi = {used:false}
        const count = e.inV.multi.edge_count[e.outV.id]
        const other_count_check = e.outV.multi.edge_count[e.inV.id]
        if(count != other_count_check){
            console.warn(`multi edge count failure with (${e.inV.label},${e.outV.label})`)
        }
        if(count > 1){
            e.multi.used = true
            e.multi.length = count
            const current_index = e.inV.multi.edge_index[e.outV.id]
            e.multi.rank = current_index
            //to keep the index unique, increment in both duplicated structures (structures exist exactly x2 times)
            e.inV.multi.edge_index[e.outV.id] += 1
            e.outV.multi.edge_index[e.inV.id] += 1
        }
    }
    for(let [vid,v] of Object.entries(graph.vertices)){
        delete v.multi.edge_index   //after the loop, it has the same value as edge_count, so uselessly redundant
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
    rename_list_ids(graph)//must be applied before the graph can be turned into a map (object)
    let res = import_to_obj_graph(graph);
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
        graph.edges[eid] = edge;
    }
    return graph
}

function readFile(file){
    return new Promise((resolve,reject)=>{
        var reader = new FileReader();
        reader.onloadend = function(e) {
            resolve(reader.result)
        };
        reader.onerror = reject
        reader.readAsText(file);
    })
}

class GraphIo{
    constructor(graph_data){
        g = graph_data
    }

    async import_file(file){
        let res = null
        if(typeof(file) == "string"){
            let extension = file.split('.').pop();
            if(extension == "json"){
                let data = await fetch_json(file)
                res = import_json_graph(data)
            }else if(extension == "graphml"){
                let xmlDoc = await fetch_xml(file)
                res = import_xml_graph(xmlDoc)
            }
        }else if(typeof(file) == "object"){
			let extension = file.name.split('.').pop();
			var reader = new FileReader();
			if(extension == "json"){
                let text_res = await readFile(file)
                var result = JSON.parse(text_res);
                res = import_json_graph(result);
    
			}else if(extension == "graphml"){
                let text_res = await readFile(file)
                let parser = new DOMParser();
                let xmlDoc = parser.parseFromString(text_res,"text/xml");
                res = import_xml_graph(xmlDoc);
			}
			else{
				alert(`unsupported graph format '${extension}'`);
			}
			reader.readAsText(file);
        }
        if(res == null){
            return
        }
        rename_properties(res);
        add_references_from_ids(res);
        add_multi_edges_info(res);
        g.vertices = res.vertices
        g.edges = res.edges
        return
    }

}

export {GraphIo};

