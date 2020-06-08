import {fetch_json,fetch_xml} from "./utils.js"
import {defined,get_if_defined,replace} from "../libs/web-js-utils.js"
import {graphviz} from "../libs/graphviz.js"


let g = null;
let config = null;

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

function select_label(obj){
    if(config.io.name_over_label){
        if(defined(obj.name)){
            obj.label = obj.name;
        }else if(defined(obj.properties)){
            if(defined(obj.properties.name)){
                obj.label = obj.properties.name[0].value
            }
        }
    }else if(!defined(obj.label) && defined(obj.name)){
        obj.label = obj.name;
    }else if(defined(obj.label) && obj.label == "\\N"){//empty string in dot
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

/**
 * an edge goes from its outV to its inV
 * an out_neighbor is a neighbor which common edge is going out to
 * an in_neighbor is a neighbor which common edge is coming in from
 * @param {*} graph 
 */
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
function init_forces(graph){
    for(let [vid,v] of Object.entries(graph.vertices)){
        v.forces = {used:false}
    }
}
function init_groups_ifndef(graph){
    for(let [vid,v] of Object.entries(graph.vertices)){
        if(!defined(v.group)){
            v.group = {used:false}
        }
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

//only properties will be kept selective members vertices and edges only will be passed to the finale graph
function import_dot_graph(dot){
    console.log(dot)
    let graph = {};
    graph.vertices = {};
    graph.edges = {};
    graph.properties = {}
    graph.properties.name = dot.name
    graph.properties.directed = dot.directed
    let add_edge_id = dot.edges.length//global to ensure unique added id beyong existing ones from dot
    let dot_height = parseFloat(dot.bb.split(',')[3])

    function is_group(obj){return (defined(obj.bb) && defined(obj.nodes))}
    function is_not_group(obj){return (defined(obj.pos))}
    function gv_group_to_vertex(obj){
        let group_v = {id:obj._gvid,name:obj.name,label:obj.label}
        get_if_defined(group_v,obj,"color")
        if(defined(obj.lp)){
            let [x,y] = obj.lp.split(',')
            group_v.viewBox = {x:parseFloat(x),y:dot_height-parseFloat(y)}
        }else{
            let [tx,ty,bx,by] = obj.bb.split(',')
            group_v.viewBox = { x:(parseFloat(tx)+parseFloat(bx))/2,
                                y:dot_height-parseFloat(by)}
        }
        obj.nodes.forEach((vid)=>{
            graph.edges[add_edge_id] = {id:add_edge_id, inV:vid,outV:group_v.id,type:"edge",label:"group"}
            add_edge_id += 1
        })
        group_v.group = {used:true}
        return group_v
    }
    function gv_to_vertex(obj){
        let vertex = {id:obj._gvid,name:obj.name,label:obj.label,color:obj.color}
        get_if_defined(vertex,obj,"color")
        get_if_defined(vertex,obj,"shape")
        let [x,y] = obj.pos.split(',')
        vertex.viewBox = {x:parseFloat(x),y:dot_height-parseFloat(y)}
        return vertex
    }
    function gv_safe_to_vertex(obj){
        let vertex = {id:obj._gvid}
        get_if_defined(vertex,obj,"name")
        get_if_defined(vertex,obj,"label")
        get_if_defined(vertex,obj,"color")
        get_if_defined(vertex,obj,"shape")
        let [x,y] = obj.pos.split(',')
        vertex.viewBox = {x:parseFloat(x),y:dot_height-parseFloat(y)}
        return vertex
    }
    function gv_to_edge(dot_e){
        let edge = {id:dot_e._gvid,inV:dot_e.head,outV:dot_e.tail}
        if(defined(dot_e.label)){
            edge.label = dot_e.label
        }
        let path = dot_e.pos.split(' ')
        if(path.length > 5){
            edge.dot_path = []
            path[0] = path[0].replace("e,","")
            path.forEach((point,id)=>{
                if(id!=0){
                    let [x,y] = point.split(',')
                    edge.dot_path.push({x:parseFloat(x),y:dot_height-parseFloat(y)})
                }
            })
        }
        return edge
    }

    dot.objects.forEach((obj,vid)=>{
        if(is_group(obj)){
            graph.vertices[vid] = gv_group_to_vertex(obj)
        }else if(is_not_group(obj)){
            graph.vertices[vid] = gv_to_vertex(obj)
        }else{
            console.warn(`vertex ${obj._gvid} could not be identified`)
            //graph.vertices[vid] = gv_safe_to_vertex(obj)
        }
    })
    dot.edges.forEach((edge,eid)=>{
        graph.edges[eid] = gv_to_edge(edge)
    })

    graph.properties.layout_done = true
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

    async import_file(file,cfg){
        if(cfg != null){
            config=cfg
        }
        let res = null
        if(typeof(file) == "string"){
            let extension = file.split('.').pop();
            if(extension == "json"){
                let data = await fetch_json(file)
                res = import_json_graph(data)
            }else if(extension == "graphml"){
                let xmlDoc = await fetch_xml(file)
                res = import_xml_graph(xmlDoc)
            }else if(extension == "gv"){
                let response = await fetch(file)
                let dot_text = await response.text()
                let dot_json_text = await graphviz.layout(dot_text, "json", "dot")
                let dot_json = JSON.parse(dot_json_text)
                res = import_dot_graph(dot_json);
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
			}else if(extension == "gv"){
                let dot_text = await readFile(file)
                let dot_json_text = await graphviz.layout(dot_text, "json", "dot")
                let dot_json = JSON.parse(dot_json_text)
                res = import_dot_graph(dot_json);
			}
			else{
				alert(`unsupported graph format '${extension}'`);
			}
			reader.readAsText(file);
        }
        if(res == null){
            return
        }
        console.log(res)
        rename_properties(res);
        add_references_from_ids(res);
        add_multi_edges_info(res);
        init_forces(res);
        init_groups_ifndef(res);
        g.vertices = res.vertices
        g.edges = res.edges
        g.layout_done = false//init to false, override by res.properties
        Object.assign(g,res.properties)
        return
    }

}

export {GraphIo};

