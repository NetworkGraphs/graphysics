
function obj_has(obj,val){
    return (Object.values(obj).indexOf(val) != -1)
}

async function fetch_json(file){
    let response = await fetch(file)
    return response.json()
}

function event(event_name,data){
	var event = new CustomEvent(event_name, {detail:data});
	window.dispatchEvent(event);
}

export{
    fetch_json,
    obj_has,
    event
};