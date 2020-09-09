var domain = location.hostname
var protocol = location.protocol
var xhr = null;
var appBasicInfo = {}
if(window.XMLHttpRequest){
    xhr = new XMLHttpRequest();
} else {
    xhr = new ActiveXObject('Microsoft.XMLHTTP')
}
xhr.open('post', '/v1/app/queryConfigByAppDomain', true)
xhr.setRequestHeader('Accept', 'application/json')
xhr.setRequestHeader('Content-Type', 'application/json')
xhr.onreadystatechange = function(){
    if(xhr.readyState == 4){
        if(xhr.status == 200){
            setBasicInfo(JSON.parse(xhr.responseText))
        } else {
            console.log("Get basic information error!")
        }
    }
}
if(domain == 'localhost' || /^127.|^172.|^192./.test(domain)) {
    domain = 'dev.aierp.cn'
}

xhr.send(JSON.stringify({appDomain: domain}))

function setBasicInfo(res) {
    if(res.result) {
        var info = JSON.parse(res.value.appAttributes)
        appBasicInfo.title = info.title
        appBasicInfo.name = info.name
        appBasicInfo.companyName = info.companyName
        appBasicInfo.companyNameShort = info.companyNameShort
        appBasicInfo.copyright1 = info.copyright1 || ''
        appBasicInfo.copyright2 = info.copyright2 || ''
        appBasicInfo.copyright3 = info.copyright3 || ''
        appBasicInfo.apiDomain = protocol + '//' + info[domain].apiDomain
        if(domain == 'localhost' || domain == '127.0.0.1' || domain == '0.0.0.0'){
            appBasicInfo.apiDomain = protocol + '//' + info['localhost'].apiDomain
        }
        appBasicInfo.runningMode = res.value.runningMode
        appBasicInfo.directory = info.directory
        appBasicInfo.beianDomain = info.beianDomain
        //设置标题
        document.querySelector('title').innerText = appBasicInfo.title
        //设置favicon
        document.querySelector('#favicon').href = './vendor/img/' + appBasicInfo.directory + '/favicon.ico' 
    }else {
        console.log(res.error.message)
    }
}