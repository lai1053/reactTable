import React from 'react'
import QrCode from './qrcode'

class QrCodeComponent extends React.Component {
    constructor() {
        super()
        this.state = {
            url: ''
        }
    }

    componentDidMount() {
        if (this.props.onCustomize) {
            this.getQrCodeOnCustomize();
        } else {
            this.getQrCode();
        }
    }

    getQrCode = () => {
        let qr = new QrCode(document.getElementById('qrCode'), {
            width: 180,
            height: 180,
            colorDark: "#000000",
            colorLight: "#ffffff"
        })
        let shareUrl = this.props.data[0],
            url = `${location.origin}/share-oss${shareUrl}`
        qr.makeCode(url)
    }

    getQrCodeOnCustomize = () => {
        let qr = new QrCode(document.getElementById(this.props.id || 'portalQrCode'), {
            width: this.props.width || 120,
            height: this.props.width || 120,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: 1
        })
        qr.makeCode(this.props.url)
    }

    render() {
        if (this.props.onCustomize) {
            return (
                <div id={this.props.id || 'portalQrCode'} style={this.props.style}>
                    {this.props.children || null}
                </div>
            )
        } else {
            return (
                <div id='qrCode'>
                </div>
            )
        }

    }
}

export default QrCodeComponent
