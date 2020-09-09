import React from 'react'
import { Button, Tag, Upload, Icon, Modal} from 'edf-component'

class DownLoadFile extends React.Component {
    constructor(props) {
        super(props)
        this.props.setOkListener(this.ok)
    }

    ok = () => {
        return false
    }
    render() {
        const downLoad = this.props.downLoad
        console.log(downLoad, 'downLoad')
        return (
            <div>
                <div>
                    <div><Icon fontFamily='edficon' type='jinggao' style={{ fontSize: '22px', color: '#fa7c63' }} /></div>
                    <div>
                        <div>亲，您导入的期初余额存在导入失败数据，其中导入成功1条，失败1条</div>
                        <div>您可以下载已标识出问题的期初余额，在此基础修改后再上传哟~</div>
                    </div>
                </div>
                <div style={{ width: '100%', textAlign: 'center' }}>
                    <Button type='primary' style={{ height: '26px', width: '80px' }} onClick={this.downLoad}>下载并完善</Button>
                </div>
            </div>
        )
    }
}

export default DownLoadFile

