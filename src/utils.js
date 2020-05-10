
function obj_has(obj,val){
    return (Object.values(obj).indexOf(val) != -1)
}

async function fetch_json(file){
    let response = await fetch(file)
    return response.json()
}

export{
    fetch_json,
    obj_has
};