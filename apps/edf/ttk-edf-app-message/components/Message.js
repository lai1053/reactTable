import React, { Component } from 'react'
import { path } from 'edf-utils'

class Message extends Component {
    constructor() {
        super()
        this.state = {
            msgText: this.props
        }
    }

    getHost(url) {
        let host = null
        let regex = /.*\:\/\/([^\/?]*).*/
        let match = url.match(regex)
        if(typeof match != "undefined" && null != match)
            host = match[1]
        return host
    }

    getUrlParams(url) {
        let pattern = /(\w+)=(\w+)/ig
        let params = {}
        url.replace(pattern, function(a, b, c){
            params[b] = c
        })
        return params
    }

    componentDidMount() {
        let setContent = this.props.setContent
        let container = document.getElementById('detailMessage')
        let links = container.getElementsByTagName('a')
        for(let i = 0 ; i < links.length ; i++) {
            let url = links[i].getAttribute('href')
            let target = links[i].getAttribute('target')
            let content = links[i].innerHTML
            links[i].onclick = function() {
                if(target == '_self') {
                    if(url == 'ttk-edf-app-history') {
                        content = '历史更新'
                    }
                    setContent(content, url)
                }else if(target == '_blank') {
                    window.open(url)
                }
                return false
            }
        }
    }

    render() {
        let msgText = this.props.msgText

        return(
            <div id={'detailMessage'} dangerouslySetInnerHTML={{__html: msgText}} />
        )
    }
}

export default Message