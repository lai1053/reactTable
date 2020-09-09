import React from 'react'
import {Checkbox, Row, Col, message, Form, Input} from 'antd'
export default class BackupZtInfo extends React.Component{
    constructor (props) {
        super(props)
        this.state = {
            defaultValue: this.props.inputVal,
            inputVal: this.props.inputVal,
            vocational: 2
        }
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }
    onOk = async () => {
        const { inputVal, vocational} = this.state;
        const { webapi, orgId } = this.props;
        let option = {
            orgId:orgId,
            bfFileName:inputVal,
            type:vocational
        }
        let res = await webapi.ztgl.backupZt(option);
        if(res.accessUrl){
            window.open(res.accessUrl);
        }
    }
    onBoundaryChange = (e) => {
        let vocational = e.target.checked ? 2 : 3;
        this.setState({
            vocational: vocational
        })
	}
    onFileNameChange = (e) => {
        e.persist()
        this.setState({
            inputVal: e.target.value
        })
    }
    render () {
        const {defaultValue, vocational } = this.state;
        return (
            <div>
                <Row gutter={16} style={{marginTop:"10px"}}>
                    <Col span={6}>
                        <span style={{'float':"right", marginTop:"8px"}}>
                            文件名称：
                        </span>
                        <span style={{'float':"right", marginTop:"11px", marginRight:"5px",color:"red"}}>*</span>
                    </Col>
                    <Col span={16}>
                        <Form.Item>
                            <Input type="text" defaultValue={defaultValue} onChange={this.onFileNameChange}/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={6}>
                        <span style={{'float':"right"}}>
                            数据备份范围：
                        </span>
                        <span style={{'float':"right", marginTop:"3px", marginRight:"5px",color:"red"}}>*</span>
                    </Col>
                    <Col span={17}  style={{marginBottom:"10px"}}>
                        <Checkbox
                            checked={ vocational==3 ? false : true }
                            onChange={this.onBoundaryChange.bind(this)}
                        >
                            业务（销项、进项、费用、资金、薪酬、资产、存货）
                        </Checkbox>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={6}></Col>
                    <Col span={17} style={{marginBottom:"10px"}}>
                        <Checkbox
                            checked={true}
                            disabled={true}
                        >
                            财务（凭证、账簿、报表、结账）
                        </Checkbox>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={6}></Col>
                    <Col span={17} style={{marginBottom:"10px"}}>
                        <Checkbox
                            checked={true}
                            disabled={true}
                        >
                            基础设置（基础档案、科目管理、期初数据）
                        </Checkbox>
                    </Col>
                </Row>
            </div>
        )
    }
}