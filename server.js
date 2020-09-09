const http = require('http')
const fs = require('fs')
const express = require('express');

const proxy = require('http-proxy-middleware');

const app = express()

const arr = [{
    path: '/icon.css',
    exec: /icon\.\w+\.css/
},{
    path: '/vendor/vendor.dll.js',
    exec: /vendor\.\w+\.dll\.js/
}, {
    path: '/edf.min.js',
    exec: /edf\.\w+\.min\.js/
}, {
    path: '/icon.min.js',
    exec: /icon\.\w+\.min\.js/
}, {
    path: '/checkLowBrowser.js',
    exec: /checkLowBrowser\.\w+\.js/
}, {
    path: '/yellowTheme.css',
    exec: /yellowTheme\.\w+\.css/
}]

app.use('/v1', proxy({target: 'http://172.16.10.22:30288/', changeOrigin: true}))
app.all('*',function(req, res) {
    try{
        if( req.url === '/' ) {
            const index = fs.readFileSync('./dist/index.html', 'utf-8')
            res.end(index)
            return 
        }else{
            const flag = arr.find(item => item.path === req.url)
            if( flag ) {
                const pathArr = req.url.slice(1).split('/')
                if( pathArr.length == 1) {
                    const files = fs.readdirSync('./dist')
                    let result = files.find(item => flag.exec.test(item))
                    const index = fs.readFileSync(`./dist/${result}`, 'utf-8')
                    const type = result.split('.').pop()
                    switch(type){
                        case 'js':
                            console.log('这是js文件')
                            res.writeHead(200, {
                                'Content-Type': 'application/javascript' 
                            })
                            break;
                        case 'css':
                            res.writeHead(200, {
                                'Content-Type': 'text/css' 
                            })
                            break;
                        default:
                            break;
                    }
                    res.end(index)
                    return 
                }else if( pathArr.length > 1 ) {
                    pathArr.pop()
                    const files = fs.readdirSync('./dist/'+pathArr.join('/'))
                    let result = files.find(item => flag.exec.test(item))
                    const index = fs.readFileSync(`./dist/`+pathArr.join('/') + `/${result}`, 'utf-8')
                    const type = result.split('.').pop()
                    switch(type){
                        case 'js':
                            console.log('这是js文件')
                            res.writeHead(200, {
                                'Content-Type': 'application/javascript' 
                            })
                            break;
                        case 'css':
                            res.writeHead(200, {
                                'Content-Type': 'text/css' 
                            })
                            break;
                        default:
                            break;
                    }
                    res.end(index)
                    return 
                }
            }else{
                const index = fs.readFileSync(`./dist${req.url}`)
                const type = req.url.split('.').pop()
                switch(type){
                    case 'js':
                        console.log('这是js文件')
                        res.writeHead(200, {
                            'Content-Type': 'application/javascript' 
                        })
                        break;
                    case 'css':
                        res.writeHead(200, {
                            'Content-Type': 'text/css' 
                        })
                        break;
                    default:
                        break;
                }
                res.end(index)
                return 
            }
        }
        
    }catch(err){
        res.end('报错了')
    }
})
app.listen(8080)