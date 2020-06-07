
let template = document.createElement("template")

function defined(obj){
    return (typeof(obj) != "undefined")
}

function true_defined(obj){
    return ((typeof(obj) != "undefined") &&(obj == true))
}

function uid(){
    return Date.now()+"_"+Math.floor(Math.random() * 10000)
}

function suid(){
    let date = (Date.now()).toString();
    const sub = date.substring(date.length-6,date.length-1);
    return sub+"_"+Math.floor(Math.random() * 10000)
}

function send(event_name,data){
	var event = new CustomEvent(event_name, {detail:data});
	window.dispatchEvent(event);
}

function temp(html_text){
    const fragment = document.createRange().createContextualFragment(html_text);
    template.appendChild(fragment);//this also returns fragment, not the newly created node
    return template.childNodes[template.childNodes.length-1];
}

function html(parent,html_text){
    parent.insertAdjacentHTML("beforeend",html_text);
    return parent.childNodes[parent.childNodes.length-1];
}

function htmls(parent,html_text){
    parent.insertAdjacentHTML("beforeend",html_text);
    return parent.childNodes;
}

function html_tag(parent,tagName,html_text){
    parent.insertAdjacentHTML("beforeend",html_text);
    let elements = parent.getElementsByTagName(tagName);
    let res_svg =  elements[elements.length-1];
    return res_svg;
}

function css(sheet,text){
    sheet.insertRule(text);
}

function br(parent){
    parent.appendChild(document.createElement("br"))
}

function hr(parent){
    parent.appendChild(document.createElement("hr"))
}

function image(parent,url){
    return html_tag(parent,"image",/*html*/`
        <image x="0" y="0" xlink:href=${url}></image>
    `)
}

//mini jQuery like events wrapper
class Events{
    constructor(){
        const events_list = ["click","change","input"]
        events_list.forEach((evtName)=>{
            this[evtName] = (element,func)=> {
                element.addEventListener(evtName,func)
            }
        })
    }
}

function save_json(object,fileName){
    const json_str = JSON.stringify(object,null,'\t');
    var blob = new Blob([json_str], {type: 'application/json'});
    saveAs(blob, fileName);
}

function rand_col() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function clear(element){
    let children = [ ...element.children];
    children.forEach((child)=>{
        child.parentElement.removeChild(child)
    })
}

function remove_sheet(sheet){
    let bkp_sheets = document.adoptedStyleSheets
    document.adoptedStyleSheets = []
    for(let i=0;i<bkp_sheets.length-1;i++){
        if(bkp_sheets[i] != sheet){
            document.adoptedStyleSheets = [...document.adoptedStyleSheets,bkp_sheets[i]];
        }
    }
}

function add_sheet(sheet){
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
}

function add_members(obj_dest,obj_src){
    for(let [id,item] of Object.entries(obj_src)){
        if(!(id in obj_dest)){
            obj_dest[id] = item
        }
    }
}

function get_if_defined(dest,src,member){
    if(defined(src[member])){
        dest[member] = src[member]
    }
}

function add_style_element(parent, string){
    let style = document.createElement("style")
    style.innerHTML = string
    parent.appendChild(style);
}
function replace(obj,bad,good){
    if(!defined(obj[good])){
        if(defined(obj[bad])){
            obj[good] = obj[bad]
            delete obj[bad]
        }
    }
}


export{
    html,
    br,hr,
    defined,
    Events,
    save_json,
    rand_col,
    image,
    uid,
    suid,
    send,
    temp,
    css,
    html_tag,
    htmls,
    clear,
    add_sheet,
    remove_sheet,
    true_defined,
    add_members,
    add_style_element,
    get_if_defined,
    replace
}
