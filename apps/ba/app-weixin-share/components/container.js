import React from 'react'
import QrCode from '../qrcode'
import ReactDOM from 'react-dom'
// import QRCode from 'qrcode.react'
class Container extends React.Component{
    constructor() {
        super()
        this.state = {
            url: ''
            
        }
    }
    componentDidMount() {
        this.getQrCode();
    }

    getQrCode = () => {
        let qr2 =  new QrCode(document.getElementById('qrCode'),{
            width: 180,
            height: 180,
            colorDark : "#000000",
            colorLight : "#ffffff",
            
        })
        
        let shareUrl = this.props.data[0];
        let url = `${location.origin}/share-oss${shareUrl}`
        qr2.makeCode(url)
  }

    render(){
        return (
            <div id='qrCode'>
                
            </div>
        )
    }
}

export default Container