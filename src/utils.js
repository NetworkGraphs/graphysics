
async function fetch_json(file){
    let response = await fetch(file)
    return response.json()
}

export{
    fetch_json
};