
function obj_has(obj,val){
    return (Object.values(obj).indexOf(val) != -1)
}

async function fetch_json(file){
    let response = await fetch(file)
    return response.json()
}

async function fetch_xml(file){
    let response = await fetch(file)
    let text = await response.text()
    let parser = new DOMParser();
    return parser.parseFromString(text,"text/xml")
}


function event(event_name,data){
	var event = new CustomEvent(event_name, {detail:data});
	window.dispatchEvent(event);
}

export{
    fetch_json,
    fetch_xml,
    obj_has,
    event
};