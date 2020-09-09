import React, { PureComponent } from 'react'
import moment from 'moment'
import { Radio, Select, Checkbox, Button, InputNumber, Tooltip, Input, DatePicker } from 'antd'
import Icon from '../icon/index'
import utils from 'edf-utils'

const Option = Select.Option;
const RadioGroup = Radio.Group;
const maxLineNum = [5, 6, 7]
const width = [190, 195, 200, 205, 210, 215, 220]
const height = [100, 105, 110, 115, 120, 125, 130]
class PrintOptionComponent3 extends PureComponent {
    constructor(props) {
        super(props)
        const { height, printTime, landscape, type, width, printHeadForEachPage, leftPadding, rightPadding, samePage, topPadding, bottomPadding, contentFontSize, printCover, printAuxData, isDayBook } = props
        this.state = {
            printTime: printTime || false,
            landscape: landscape || false,
            type: type ? type : 3,
            width: width ? parseFloat(width) : 215,
            height: height ? parseFloat(height) : 125,
            leftPadding: leftPadding,
            rightPadding: rightPadding,
            topPadding: topPadding,
            bottomPadding: bottomPadding,
            contentFontSize: contentFontSize,
            printCover: printCover,
            isDayBook: isDayBook,
            printAuxData: printAuxData,
            samePage: samePage || false,
            printAuxDataDisabled: samePage == true ? true : false,
            creator: props.creator ? props.creator : '',//自定义制表人
            supervisor: props.supervisor ? props.supervisor : '',//自定义财务负责人
            creatorButton: props.creatorType == -1 ? false : true,
            supervisorButton: props.supervisorType == -1 ? false : true,
            unitButton: props.unitPersonType == -1 ? false : true,
            unitPerson: props.unitPerson ? props.unitPerson : '',//自定义财务负责人
            unitPersonType: props.unitPersonType || props.unitPersonType == 0 ? props.unitPersonType : '', //财务负责人勾选项枚举类型(-1:没有勾选，0:自定义，1:制表人)
            creatorType: props.creatorType || props.creatorType == 0 ? props.creatorType : '', //制表人勾选项枚举类型(-1:没有勾选，0:自定义，1:制表人)
            supervisorType: props.supervisorType || props.supervisorType == 0 ? props.supervisorType : '', //财务负责人勾选项枚举类型(-1:没有勾选，0:自定义，1:制表人)
            enableddate: props.enableddate ? props.enableddate : '',
            customPrintTime: props.customPrintTime && props.customPrintTime != ' ' ? moment(props.customPrintTime, 'YYYY-MM-DD HH:mm:ss') : '',//自定义时间
            timeOriginal: props.customPrintTime ? 1 : 0,
            creatorFlag: false,
            editorFlag: false,
            unitFlag: false,
            cwfzr: props.cwfzr ? props.cwfzr : '',
            dwfzr: props.dwfzr ? props.dwfzr : '',
            rptPeriod: props.rptPeriod ? props.rptPeriod : '',
            faceTitle: props.faceTitle ? props.faceTitle : '',
            faceTitleFlag:false,
            rptPeriodFlag:false,
            from:props.from,
            printHeadForEachPage: printHeadForEachPage
        }
    }
    componentWillReceiveProps(nextProps) {
        const { isAllPrint, height, printTime, landscape, printHeadForEachPage, type, width, leftPadding, rightPadding, samePage, topPadding, bottomPadding, contentFontSize, printCover, printAuxData, isDayBook } = nextProps
        if(!isAllPrint){
            this.setState({
                printTime: printTime || false,
                landscape: landscape || false,
                type: type ? type : 3,
                width: width ? parseFloat(width) : 215,
                height: height ? parseFloat(height) : 125,
                leftPadding: leftPadding,
                rightPadding: rightPadding,
                topPadding: topPadding,
                bottomPadding: bottomPadding,
                contentFontSize: contentFontSize,
                printCover: printCover,
                isDayBook: isDayBook,
                printAuxData: printAuxData,
                samePage: samePage || false,
                printAuxDataDisabled: samePage == true ? true : false,
                creator: nextProps.creator ? nextProps.creator : '',//自定义制表人
                supervisor: nextProps.supervisor ? nextProps.supervisor : '',//自定义财务负责人
                creatorButton: nextProps.creatorType == -1 ? false : true,
                supervisorButton: nextProps.supervisorType == -1 ? false : true,
                unitButton: nextProps.unitPersonType == -1 ? false : true,
                unitPerson: nextProps.unitPerson ? nextProps.unitPerson : '',//自定义财务负责人
                unitPersonType: nextProps.unitPersonType || nextProps.unitPersonType == 0 ? nextProps.unitPersonType : '', //财务负责人勾选项枚举类型(-1:没有勾选，0:自定义，1:制表人)
                creatorType: nextProps.creatorType || nextProps.creatorType == 0 ? nextProps.creatorType : '', //制表人勾选项枚举类型(-1:没有勾选，0:自定义，1:制表人)
                supervisorType: nextProps.supervisorType || nextProps.supervisorType == 0 ? nextProps.supervisorType : '', //财务负责人勾选项枚举类型(-1:没有勾选，0:自定义，1:制表人)
                enableddate: nextProps.enableddate ? nextProps.enableddate : '',
                customPrintTime: nextProps.customPrintTime && nextProps.customPrintTime != ' ' ? moment(nextProps.customPrintTime, 'YYYY-MM-DD HH:mm:ss') : '',//自定义时间
                timeOriginal: nextProps.customPrintTime ? 1 : 0,
                creatorFlag: false,
                editorFlag: false,
                unitFlag: false,
                cwfzr: nextProps.cwfzr ? nextProps.cwfzr : '',
                dwfzr: nextProps.dwfzr ? nextProps.dwfzr : '',
                rptPeriod: nextProps.rptPeriod ? nextProps.rptPeriod : '',
                faceTitle: nextProps.faceTitle ? nextProps.faceTitle : '',
                faceTitleFlag:false,
                rptPeriodFlag:false,
                printHeadForEachPage: printHeadForEachPage,
                from:nextProps.from,
            })
        }
    }
    changeRadioState = (e) => {
        this.setState({
            value: e.target.value,
        })
    }
    changeAccount = (e) => {
        this.setState({
            printAccountChecked: e.target.checked,
        })
    }
    changeQuantity = (e) => {
        this.setState({
            printQuantityChecked: e.target.checked,
        })
    }
    changeMultiCurrency = (e) => {
        this.setState({
            printMultiChecked: e.target.checked,
        })
    }

    changePageSize = (e) => {
        this.setState({
            pageSize: e
        })
    }
    disabledDate = (time, type) => {
        const enableddate = this.state.enableddate
        let currentMonth = this.transformDateToNum(time)
        let enableddateMonth = this.transformDateToNum(enableddate)
        return currentMonth < enableddateMonth

    }
    transformDateToNum = (date) => {
        try {
            if (!date) {
                return 0
            }
            let time = date
            if (typeof date == 'string') {
                time = utils.date.transformMomentDate(date)
            }
            return parseInt(`${time.year()}${time.month() < 10 ? `0${time.month()}` : `${time.month()}`}`)
        } catch (err) {
            return 0
        }

    }
    changeWidth = (e) => {

        this.setState({
            width: e
        })
    }
    changeHeight = (e) => {
        this.setState({
            height: e
        })
    }
    changeCustom = (e, nameStr) => {
        if (nameStr == 'creator' && !!e) {
            this.setState({
                creatorFlag: false
            })
        }
        if (nameStr == 'supervisor' && !!e) {
            this.setState({
                editorFlag: false
            })
        }
        if (nameStr == 'rptPeriod' && !!e) {
            this.setState({
                rptPeriodFlag: false
            })
        }
        if (nameStr == 'faceTitle' && !!e) {
            this.setState({
                faceTitleFlag: false
            })
        }

        this.setState({
            [nameStr]: e.target.value.replace(/ /g, ""),
        })
    }
    changeState = (e, nameStr) => {
        this.setState({
            [nameStr]: e
        })
        if (nameStr == 'samePage') {
            this.setState({
                printAuxDataDisabled: e,
                // printAuxData: false,
            })
        }
        if (nameStr == 'creatorButton' && e == true) {
            this.setState({
                creatorType: this.state.creatorType !== -1 ? this.state.creatorType : 1,
            })
        }
        if (nameStr == 'supervisorButton' && e == true) {
            this.setState({
                supervisorType: this.state.supervisorType !== -1 ? this.state.supervisorType : 1,
            })
        }
        if (nameStr == 'unitButton' && e == true) {
            this.setState({
                unitPersonType: this.state.unitPersonType !== -1 ? this.state.unitPersonType : 1,
            })
        }
        if (nameStr == 'timeOriginal') {
            if (e == 0) {
                this.setState({
                    customPrintTime: '',
                })
            } else {
                if(this.props.source!='1'){
                    setTimeout(() => {
                        let editorDOM = document.getElementsByClassName('datePicker')[0]
                        debugger
                        editorDOM.click();
                        let _input = editorDOM.querySelector('input');
                        _input && _input.click()
                    }, 10);
                }
            }
        }

        if (nameStr == 'creatorType') {
            if (e != 0) {
                this.setState({
                    creator: '',
                    creatorFlag: false
                })
            } else {
                setTimeout(() => {
                    let editorDOM = document.getElementsByClassName('creatorTypeInput')[0]
                    editorDOM.focus();
                }, 10);
            }
        }
        if (nameStr == 'supervisorType') {
            if (e != 0) {
                this.setState({
                    supervisor: '',
                    editorFlag: false
                })
            } else {
                setTimeout(() => {
                    let editorDOM = document.getElementsByClassName('editorTypeInput')[0]
                    editorDOM.focus();
                }, 10);
            }
        }
        if (nameStr == 'unitPersonType') {
            if (e != 0) {
                this.setState({
                    unitPerson: '',
                    unitFlag: false
                })
            } else {
                setTimeout(() => {
                    let editorDOM = document.getElementsByClassName('unitPersonTypeInput')[0]
                    editorDOM.focus();
                }, 10);
            }
        }
    }
    dateChange = (key, value) => {
        // console.log(moment(value).format('YYYY-MM-DD HH：mm：ss'),  typeof moment(value).format('YYYY-MM-DD HH：mm：ss'))
        this.setState({
            [key]: value
        })
    }
    confirm = () => {
        var creatorFlag, editorFlag, unitFlag,rptPeriodFlag,faceTitleFlag
        if (this.state.creatorType == '0' && !this.state.creator) {
            creatorFlag = true
            this.setState({
                creatorFlag: true
            })
        }
        if (this.state.supervisorType == '0' && !this.state.supervisor) {
            editorFlag = true
            this.setState({
                editorFlag: true
            })
        }
        if (this.state.unitPersonType == '0' && !this.state.unitPerson) {
            unitFlag = true
            this.setState({
                unitFlag: true
            })
        }
        // if (!this.state.rptPeriod&&this.props.glFrom&& this.state.printCover) {
        if (!this.state.rptPeriod&& this.state.printCover) {
            editorFlag = true
            this.setState({
                rptPeriodFlag: true
            })
        }
        // if (!this.state.faceTitle&&this.props.glFrom&& this.state.printCover ) {
        if (!this.state.faceTitle&& this.state.printCover ) {
            faceTitleFlag = true
            this.setState({
                faceTitleFlag: true
            })
        }
        if (!editorFlag && !creatorFlag && !unitFlag&& !faceTitleFlag && !rptPeriodFlag) {
            if(!this.props.source){
                this.props.closeModal()
            }
            if (this.state.creatorButton == false) {
                this.state.creatorType = -1
            }
            if (this.state.supervisorButton == false) {
                this.state.supervisorType = -1
            }
            if (this.state.unitButton == false) {
                this.state.unitPersonType = -1
            }
            this.state.customPrintTime = this.state.timeOriginal == 1 ? this.state.customPrintTime ? moment(this.state.customPrintTime).format('YYYY-MM-DD HH:mm:ss') : ' ' : ''
            this.props.callBack(this.state)
        }
    }
    cancel = () => {
        this.props.closeModal()
    }
    confirmBatch = () => {
        var creatorFlag, editorFlag, unitFlag,rptPeriodFlag,faceTitleFlag
        if (this.state.creatorType == '0' && !this.state.creator) {
            creatorFlag = true
            this.setState({
                creatorFlag: true
            })
        }
        if (this.state.supervisorType == '0' && !this.state.supervisor) {
            editorFlag = true
            this.setState({
                editorFlag: true
            })
        }
        if (this.state.unitPersonType == '0' && !this.state.unitPerson) {
            unitFlag = true
            this.setState({
                unitFlag: true
            })
        }
        // if (!this.state.rptPeriod&&this.props.glFrom&& this.state.printCover) {
        if (!this.state.rptPeriod&& this.state.printCover) {
            editorFlag = true
            this.setState({
                rptPeriodFlag: true
            })
        }
        // if (!this.state.faceTitle&&this.props.glFrom&& this.state.printCover ) {
        if (!this.state.faceTitle&& this.state.printCover ) {
            faceTitleFlag = true
            this.setState({
                faceTitleFlag: true
            })
        }
        if (!editorFlag && !creatorFlag && !unitFlag&& !faceTitleFlag && !rptPeriodFlag) {
            if (this.state.creatorButton == false) {
                this.state.creatorType = -1
            }
            if (this.state.supervisorButton == false) {
                this.state.supervisorType = -1
            }
            if (this.state.unitButton == false) {
                this.state.unitPersonType = -1
            }
            this.state.customPrintTime = this.state.timeOriginal == 1 ? this.state.customPrintTime ? moment(this.state.customPrintTime).format('YYYY-MM-DD HH:mm:ss') : ' ' : ''
            return true
        }else{
            return false
        }
    }
    batchPrint2 = () => {
        if(this.confirmBatch()){
            if (this.state.creatorButton == false) {
                this.state.creatorType = -1
            }
            if (this.state.supervisorButton == false) {
                this.state.supervisorType = -1
            }
            if (this.state.unitButton == false) {
                this.state.unitPersonType = -1
            }
            this.state.customPrintTime = this.state.timeOriginal == 1 ? this.state.customPrintTime ? moment(this.state.customPrintTime).format('YYYY-MM-DD HH:mm:ss') : ' ' : ''
            this.state.prefixKey=this.props.typeKey
            return {formType: this.state.from, currentState: this.state,typeKey:this.props.typeKey}
        }
    }
    batchPrint3 = () => {
        if(this.confirmBatch()){
            if (this.state.creatorButton == false) {
                this.state.creatorType = -1
            }
            if (this.state.supervisorButton == false) {
                this.state.supervisorType = -1
            }
            if (this.state.unitButton == false) {
                this.state.unitPersonType = -1
            }
            this.state.customPrintTime = this.state.timeOriginal == 1 ? this.state.customPrintTime ? moment(this.state.customPrintTime).format('YYYY-MM-DD HH:mm:ss') : ' ' : ''
            this.state.prefixKey=this.props.typeKey
            return {formType: this.state.from, currentState: this.state,typeKey:this.props.typeKey}
        }
    }

    render() {
        let { customPrintTime } = this.state
        if(customPrintTime&&typeof(customPrintTime)=='string'){
            customPrintTime=moment(customPrintTime,'YYYY-MM-DD HH:mm:ss')
        }
        return (
            <div className="printOption" style={{ padding: '12px 0px',height:'100%', }}>
                <form style={{ height:'100%',paddingBottom: '45px'}}>
                    <div className="ant-form-item ant-form-item-compact" style={{ padding: '0px 12px',height: '100%',overflow: 'auto' }}>
                        <div className="col-18">
                            <div>
                                <RadioGroup value={this.state.landscape} onChange={(e) => { this.changeState(e.target.value, 'landscape') }} style={{}} >
                                    <label style={{ fontSize: '13px', width: '75px', lineHeight: '32px', display: 'inline-block' }}>打印方向</label>
                                    <Radio value={false} style={{ marginRight: '15px', lineHeight: '32px' }}>纵向</Radio>
                                    <Radio value={true} style={{ lineHeight: '32px' }} >横向</Radio>
                                </RadioGroup>
                                <RadioGroup value={this.state.type} style={{ marginBottom: 5 }} onChange={(e) => { this.changeState(e.target.value, 'type') }} >
                                    <label style={{ fontSize: '13px', width: '75px', lineHeight: '32px', height: '32px', verticalAlign: 'top', display: 'inline-block' }}>纸张模板</label>
                                    <Radio value={3} style={{ marginRight: '10px', height: '32px' }}><span style={{ lineHeight: '32px' }}>A4</span><span style={{ marginBottom: 0, fontSize: '10px' }}>（{this.state.landscape ? '297*210毫米' : '210*297毫米'}）</span></Radio>
                                    <Radio value={4} style={{ marginRight: '10px', height: '32px' }}><span style={{ lineHeight: '32px' }}>A5</span><span style={{ marginBottom: 0, fontSize: '10px' }}>（{this.state.landscape ? '210*148毫米' : '148*210毫米'}）</span></Radio>
                                    <Radio value={5} style={{ marginRight: '10px', height: '32px' }}><span style={{ lineHeight: '32px' }}>标准凭证纸</span><span style={{ marginBottom: 0, fontSize: '10px' }}>（{this.state.landscape ? '240*140毫米' : '140*240毫米'}）</span></Radio>
                                    <Radio value={2} style={{ marginRight: '0px' }}>自定义大小</Radio>
                                    <div style={{ marginBottom: '7px', display: (this.state.type == 2 ? 'block' : 'none') }}>
                                        <div className="item-select" style={{ marginLeft: '75px', marginRight: '20px', display: 'inline-block' }}>
                                            <label style={{ fontSize: '13px' }}>宽：</label>
                                            {/* <Select value={this.state.width} style={{ width: 80, marginRight: '5px' }} disabled={this.state.type == 2 ? false : true} onChange={(e) => { this.changeState(e, 'width') }}>
                                                {width.map(o => {
                                                    return <Option value={o}>{o}</Option>
                                                })}
                                            </Select> */}
                                            <InputNumber value={this.state.width} disabled={this.state.type == 2 ? false : true} style={{ width: 80, marginRight: '5px', textAlign: 'right', height: '26px', verticalAlign: 'middle' }} onChange={(e) => { this.changeState(e, 'width') }} min={100} max={297} precision={0} />
                                            <label style={{ fontSize: '13px' }}>毫米</label>

                                        </div>
                                        <div className="item-select" style={{ display: 'inline-block' }}>
                                            <label style={{ fontSize: '13px' }}>高：</label>
                                            {/* <Select value={this.state.height} style={{ width: 80, marginRight: '5px' }} disabled={this.state.type == 2 ? false : true} onChange={(e) => { this.changeState(e, 'height') }}>
                                                {height.map(o => {
                                                    return <Option value={o}>{o}</Option>
                                                })}
                                            </Select> */}
                                            <InputNumber value={this.state.height} disabled={this.state.type == 2 ? false : true} style={{ width: 80, marginRight: '5px', textAlign: 'right', height: '26px', verticalAlign: 'middle' }} onChange={(e) => { this.changeState(e, 'height') }} min={80} max={297} precision={0} />
                                            <label style={{ fontSize: '13px' }}>毫米</label>
                                        </div>
                                    </div>
                                </RadioGroup>
                                <div style={{ marginBottom: 10 }}>
                                    <label value={2} style={{ width: '75px', display: 'inline-block' }}>边距调整</label>
                                    <div className="item-select" style={{ marginRight: '20px', display: 'inline-block' }}>
                                        <label style={{ fontSize: '13px' }}>左：</label>
                                        <InputNumber value={this.state.leftPadding} style={{ width: 60, marginRight: '5px', textAlign: 'right', height: '26px', verticalAlign: 'middle' }} onChange={(e) => { this.changeState(e, 'leftPadding') }} min={5} max={30} precision={0} />
                                        <label style={{}}>毫米</label>
                                    </div>
                                    <div className="item-select" style={{ marginRight: '20px', display: 'inline-block' }}>
                                        <label style={{}}>右：</label>
                                        <InputNumber value={this.state.rightPadding} style={{ width: 60, marginRight: '5px', textAlign: 'right', height: '26px', verticalAlign: 'middle' }} onChange={(e) => { this.changeState(e, 'rightPadding') }} min={5} max={30} precision={0} />
                                        <label style={{}}>毫米</label>
                                    </div>
                                    <div className="item-select" style={{ marginRight: '20px', display: 'inline-block' }}>
                                        <label style={{}}>上：</label>
                                        <InputNumber value={this.state.topPadding} style={{ width: 60, marginRight: '5px', textAlign: 'right', height: '26px', verticalAlign: 'middle' }} onChange={(e) => { this.changeState(e, 'topPadding') }} min={5} max={30} precision={0} />
                                        <label style={{}}>毫米</label>
                                    </div>
                                    <div className="item-select" style={{ display: 'inline-block' }}>
                                        <label style={{}}>下：</label>
                                        <InputNumber value={this.state.bottomPadding} style={{ width: 60, marginRight: '5px', textAlign: 'right', height: '26px', verticalAlign: 'middle' }} onChange={(e) => { this.changeState(e, 'bottomPadding') }} min={5} max={30} precision={0} />
                                        <label style={{}}>毫米</label>
                                    </div>
                                </div>
                                <div>
                                    <label value={2} style={{ width: '75px', display: 'inline-block', marginBottom: 5 }}>字号调整</label>
                                    <div className="item-select" style={{ marginRight: '20px', display: 'inline-block' }}>
                                        <InputNumber value={this.state.contentFontSize} style={{ width: 60, marginRight: '5px', textAlign: 'right', height: '26px', verticalAlign: 'middle' }} onChange={(e) => { this.changeState(e, 'contentFontSize') }} min={5} max={12} precision={0} />
                                    </div>
                                </div>
                            </div>
                            {this.state.from == 'sumaccount' || this.state.from == 'detailaccount' || this.state.from == 'auxdetailaccount' ?
                                <div clssName="printOption2-contaienr-item" style={{ marginTop: '12px' }}>
                                    <RadioGroup onChange={(e) => this.changeState(e.target.value, 'samePage')} value={this.state.samePage}>
                                        <Radio value={false} style={{ fontSize: '13px' }}>不同科目分页签打印</Radio>
                                        <Radio value={true} style={{ fontSize: '13px' }}>不同科目同页签连续打印</Radio>
                                    </RadioGroup>
                                </div> :
                                null
                            }
                            {this.state.from == 'detailaccount' ?
                                <div className="item" style={{ paddingBottom: '8px', height: '32px', lineHeight: '32px' }}>
                                    <Checkbox checked={this.state.printAuxData} onChange={(e) => { this.changeState(e.target.checked, 'printAuxData') }} style={{ fontSize: '13px' }}>打印辅助核算</Checkbox>
                                    {/* <Tooltip placement="right" title='连续打印暂不支持打印辅助项' overlayClassName='helpIcon-tooltip'>
                                        <Icon type='bangzhutishi' fontFamily='edficon' style={{ fontSize: '22px', top: '4px', color: '#0066b3', position: 'relative', cursor: 'pointer' }} ></Icon>
                                    </Tooltip> */}
                                </div> :
                                null
                            }
                            {this.props.glFrom ?
                                <div>
                                    <div className="item" style={{ paddingBottom: '8px', height: '50px', lineHeight: '40px' }}>
                                        <Checkbox style={{ width: 130 }} checked={this.state.creatorButton} onChange={(e) => { this.changeState(e.target.checked, 'creatorButton') }}>打印操作人</Checkbox>
                                        {this.state.creatorButton ?
                                            <RadioGroup value={this.state.creatorType} onChange={(e) => { this.changeState(e.target.value, 'creatorType') }} style={{}} >
                                                <Radio value={1} style={{ width: 247, marginRight: '15px', lineHeight: '32px' }}>当前操作人</Radio>
                                                <Radio value={0} style={{ lineHeight: '32px', marginRight: '0px' }} >自定义</Radio>
                                                <div style={{ display: 'inline-block', position: 'relative' }}>
                                                    <Input className='creatorTypeInput' placeholder='操作人' value={this.state.creator} style={{ width: 172, marginRight: '5px', border: this.state.creatorFlag ? '1px solid red' : '' }} disabled={this.state.creatorType == 1 ? true : false} onChange={(e) => { this.changeCustom(e, 'creator') }} />
                                                    <span style={{ width: 170, marginRight: '5px', display: this.state.creatorFlag ? 'block' : 'none', position: 'absolute', top: '25px', color: 'red' }} >不可为空</span>
                                                </div>
                                            </RadioGroup> : null
                                        }
                                    </div>
                                    <div className="item" style={{ paddingBottom: '8px', height: '50px', lineHeight: '40px' }}>
                                        <Checkbox style={{ width: 130 }} checked={this.state.printTime} onChange={(e) => { this.changeState(e.target.checked, 'printTime') }}>显示打印时间</Checkbox>
                                        {this.state.printTime ?
                                            <RadioGroup value={this.state.timeOriginal} onChange={(e) => { this.changeState(e.target.value, 'timeOriginal') }} >
                                                <Radio value={0} style={{ width: 247, marginRight: '15px', lineHeight: '32px' }}>当前操作时间</Radio>
                                                <Radio value={1} style={{ lineHeight: '32px', marginRight: '0px' }} >自定义</Radio>
                                                <DatePicker
                                                    style={{ width: '172px' }}
                                                    className='datePicker'
                                                    disabled={this.state.timeOriginal == 0 ? true : false}
                                                    allowClear={false}
                                                    value={customPrintTime}
                                                    format="YYYY-MM-DD HH:mm:ss"
                                                    disabledDate={(current) => this.disabledDate(current)}
                                                    onChange={(value) => this.dateChange('customPrintTime', value)}
                                                />
                                            </RadioGroup> : null
                                        }
                                    </div></div> : null
                            }
                            {this.state.from == 'balancesheetRpt' || this.state.from == 'profitstatementRpt' || this.state.from == 'cashflowstatementRpt' ?
                                <div>
                                    <div className="item" style={{ paddingBottom: '8px', height: '50px', lineHeight: '40px' }}>
                                        <Checkbox style={{ width: 130 }} checked={this.state.creatorButton} onChange={(e) => { this.changeState(e.target.checked, 'creatorButton') }}>打印制表人</Checkbox>
                                        {this.state.creatorButton ?
                                            <RadioGroup value={this.state.creatorType} onChange={(e) => { this.changeState(e.target.value, 'creatorType') }} style={{}} >
                                                <Radio value={1} style={{ width: 247, marginRight: '15px', lineHeight: '32px' }}>当前操作人</Radio>
                                                <Radio value={0} style={{ lineHeight: '32px', marginRight: '0px' }} >自定义</Radio>
                                                <div style={{ display: 'inline-block', position: 'relative' }}>
                                                    <Input className='creatorTypeInput' placeholder='制表人' value={this.state.creator} style={{ width: 172, marginRight: '5px', border: this.state.creatorFlag ? '1px solid red' : '' }} disabled={this.state.creatorType == 1 ? true : false} onChange={(e) => { this.changeCustom(e, 'creator') }} />
                                                    <span style={{ width: 170, marginRight: '5px', display: this.state.creatorFlag ? 'block' : 'none', position: 'absolute', top: '25px', color: 'red' }} >不可为空</span>
                                                </div>
                                            </RadioGroup> : null
                                        }
                                    </div>
                                    <div className="item" style={{ paddingBottom: '8px', height: '50px', lineHeight: '40px' }}>
                                        <Checkbox style={{ width: 130 }} checked={this.state.supervisorButton} onChange={(e) => { this.changeState(e.target.checked, 'supervisorButton') }}>打印财务负责人</Checkbox>
                                        {this.state.supervisorButton ?
                                            <RadioGroup value={this.state.supervisorType} onChange={(e) => { this.changeState(e.target.value, 'supervisorType') }} style={{}} >
                                                <Radio value={1} style={{ width: 247, marginRight: '15px', lineHeight: '32px' }}>当前操作人</Radio>
                                                <Radio value={0} style={{ lineHeight: '32px', marginRight: '0px' }} >自定义</Radio>
                                                <div style={{ display: 'inline-block', position: 'relative' }}>
                                                    <Input className="editorTypeInput" placeholder='财务负责人' value={this.state.supervisor} style={{ width: 172, marginRight: '5px', border: this.state.editorFlag ? '1px solid red' : '' }} disabled={this.state.supervisorType == 1 ? true : false} onChange={(e) => { this.changeCustom(e, 'supervisor') }} />
                                                    <span style={{ width: 170, marginRight: '5px', display: this.state.editorFlag ? 'block' : 'none', position: 'absolute', top: '25px', color: 'red' }} >不可为空</span>
                                                </div>
                                            </RadioGroup> : null
                                        }
                                    </div>
                                    <div className="item" style={{ paddingBottom: '8px', height: '50px', lineHeight: '40px' }}>
                                        <Checkbox style={{ width: 130 }} checked={this.state.unitButton} onChange={(e) => { this.changeState(e.target.checked, 'unitButton') }}>单位负责人</Checkbox>
                                        {this.state.unitButton ?
                                            <RadioGroup value={this.state.unitPersonType} onChange={(e) => { this.changeState(e.target.value, 'unitPersonType') }} style={{}} >
                                                <Radio value={1} style={{ width: 247, marginRight: '15px', lineHeight: '32px' }}>当前操作人</Radio>
                                                <Radio value={0} style={{ lineHeight: '32px', marginRight: '0px' }} >自定义</Radio>
                                                <div style={{ display: 'inline-block', position: 'relative' }}>
                                                    <Input className="unitPersonTypeInput" placeholder='单位负责人' value={this.state.unitPerson} style={{ width: 172, marginRight: '5px', border: this.state.unitFlag ? '1px solid red' : '' }} disabled={this.state.unitPersonType == 1 ? true : false} onChange={(e) => { this.changeCustom(e, 'unitPerson') }} />
                                                    <span style={{ width: 170, marginRight: '5px', display: this.state.unitFlag ? 'block' : 'none', position: 'absolute', top: '25px', color: 'red' }} >不可为空</span>
                                                </div>
                                            </RadioGroup> : null
                                        }
                                    </div>

                                    <div className="item" style={{ paddingBottom: '8px', height: '50px', lineHeight: '40px' }}>
                                        <Checkbox style={{ width: 130 }} checked={this.state.printTime} onChange={(e) => { this.changeState(e.target.checked, 'printTime') }}>显示打印时间</Checkbox>
                                        {this.state.printTime ?
                                            <RadioGroup value={this.state.timeOriginal} onChange={(e) => { this.changeState(e.target.value, 'timeOriginal') }} >
                                                <Radio value={0} style={{ width: 247, marginRight: '15px', lineHeight: '32px' }}>当前操作时间</Radio>
                                                <Radio value={1} style={{ lineHeight: '32px', marginRight: '0px' }} >自定义</Radio>
                                                <DatePicker
                                                    style={{ width: '172px' }}
                                                    className='datePicker'
                                                    disabled={this.state.timeOriginal == 0 ? true : false}
                                                    allowClear={false}
                                                    value={customPrintTime}
                                                    format="YYYY-MM-DD HH:mm:ss"
                                                    disabledDate={(current) => this.disabledDate(current)}
                                                    onChange={(value) => this.dateChange('customPrintTime', value)}
                                                />
                                            </RadioGroup> : null
                                        }
                                    </div></div> : null
                            }
                            {/* {this.state.from == 'balancesheetRpt' || this.state.from == 'profitstatementRpt' || this.state.from == 'cashflowstatementRpt' ?
                            <div className="item" style={{ paddingBottom: '8px', height: '50px', lineHeight: '40px' }}>
                                <Checkbox checked={this.state.printCover} onChange={(e) => { this.changeState(e.target.checked, 'printCover') }} style={{ fontSize: '13px', float: 'left', width: 132 }}>打印封皮</Checkbox>
                                {this.state.printCover ?
                                    <div style={{ float: 'left' }}>
                                        <span style={{ lineHeight: '32px', marginRight: '12px' }} >单位负责人</span>
                                        <div style={{ display: 'inline-block', position: 'relative', marginRight: '12px' }}>
                                            <Input className="input creatorTypeInput " placeholder='单位负责人' value={this.state.dwfzr} style={{ width: 170, marginRight: '5px', border: 'none', borderBottom: '1px solid #ccc' }} onChange={(e) => { this.changeCustom(e, 'dwfzr') }} />
                                        </div>
                                        <span style={{ lineHeight: '32px', marginRight: '12px' }} >财务负责人</span>
                                        <div style={{ display: 'inline-block', position: 'relative' }}>
                                            <Input className="input creatorTypeInput " placeholder='财务负责人' value={this.state.cwfzr} style={{ width: 170, marginRight: '5px', border: 'none', borderBottom: '1px solid #ccc' }} onChange={(e) => { this.changeCustom(e, 'cwfzr') }} />
                                        </div>
                                    </div>: null}
                            </div>
                            :null
                            } */}
                            {/* {this.props.glFrom ? */}
                                <div className="item" style={{ paddingBottom: '8px', height: this.state.printCover ?'80px':'50px', lineHeight: '40px' }}>
                                <Checkbox checked={this.state.printCover} onChange={(e) => { this.changeState(e.target.checked, 'printCover') }} style={{ fontSize: '13px', float: 'left', width: 132 }}>打印封皮</Checkbox>
                                {this.state.printCover ?
                                <div>
                                    <div style={{ float: 'left' }}>
                                        <span style={{ lineHeight: '32px', marginRight: '12px' }} >单位负责人</span>
                                        <div style={{ display: 'inline-block', position: 'relative', marginRight: '12px' }}>
                                            <Input className="input creatorTypeInput " placeholder='单位负责人' value={this.state.dwfzr} style={{ width: 170, marginRight: '5px', border: 'none', borderBottom: '1px solid #ccc' }} onChange={(e) => { this.changeCustom(e, 'dwfzr') }} />
                                        </div>
                                        <span style={{ lineHeight: '32px', marginRight: '12px' }} >财务负责人</span>
                                        <div style={{ display: 'inline-block', position: 'relative' }}>
                                            <Input className="input creatorTypeInput " placeholder='财务负责人' value={this.state.cwfzr} style={{ width: 170, marginRight: '5px', border: 'none', borderBottom: '1px solid #ccc' }} onChange={(e) => { this.changeCustom(e, 'cwfzr') }} />
                                        </div>
                                    </div>
                                    <div style={{ float: 'left',left: '132px',position: 'relative'}}>
                                        <span style={{ lineHeight: '32px', marginRight: '12px' ,width: '65px',display: 'inline-block'}} >封皮标题</span>
                                        <div style={{ display: 'inline-block', position: 'relative', marginRight: '12px' }}>
                                            <Input className="input creatorTypeInput " placeholder='封皮标题' value={this.state.faceTitle} style={{ width: 170, marginRight: '5px', border: 'none' , borderBottom: this.state.creatorFlag ? '1px solid red' : '1px solid #ccc' }} onChange={(e) => { this.changeCustom(e, 'faceTitle') }} />
                                            <span style={{ width: 170, marginRight: '5px', display: this.state.faceTitleFlag ? 'block' : 'none', position: 'absolute', top: '25px', color: 'red' }} >不可为空</span>
                                        </div>
                                        <span style={{ lineHeight: '32px', marginRight: '12px' ,width: '65px',display: 'inline-block' }} >会计期间</span>
                                        <div style={{ display: 'inline-block', position: 'relative' }}>
                                            <Input className="input creatorTypeInput " placeholder='xxxx年xx月-xxxx年xx月' value={this.state.rptPeriod} style={{ width: 170, marginRight: '5px', border: 'none', borderBottom: this.state.creatorFlag ? '1px solid red' : '1px solid #ccc' }} onChange={(e) => { this.changeCustom(e, 'rptPeriod') }} />
                                            <span style={{ width: 170, marginRight: '5px', display: this.state.rptPeriodFlag ? 'block' : 'none', position: 'absolute', top: '25px', color: 'red' }} >不可为空</span>
                                        </div>
                                    </div> 
                                  </div>  : null}
                            </div>
                            {/* : null */}
                            {/* } */}
                            {this.state.from == 'detailaccount' ?
                                <div className="item" style={{ height: '50px', lineHeight: '40px' }}>
                                    <Checkbox checked={this.state.isDayBook} onChange={(e) => { this.changeState(e.target.checked, 'isDayBook') }} style={{ fontSize: '13px', float: 'left', width: 132 }}>打印日记账</Checkbox>
                                </div> : null}
                            {/* {this.state.from == 'detailaccount' ?
                                <div className="item" style={{ height: '32px', lineHeight: '32px' }}>
                                    <Checkbox checked={this.state.printHeadForEachPage} onChange={(e) => { this.changeState(e.target.checked, 'printHeadForEachPage') }} style={{ fontSize: '13px', float: 'left', width: 132 }}>打印抬头</Checkbox>
                                </div>: null} */}
                            {this.props.glFrom ?
                            <div className="item" style={{ height: '32px', lineHeight: '32px' }}>
                                <Checkbox checked={this.state.printHeadForEachPage} onChange={(e) => { this.changeState(e.target.checked, 'printHeadForEachPage') }} style={{ fontSize: '13px', float: 'left', width: 132 }}>打印抬头</Checkbox>
                            </div>: null} 

                        </div>
                    </div>
                </form>
                <div className='printOption2-bottom' style={{ width: '100%', textAlign: 'right', paddingTop: '12px', paddingRight: '12px', borderTop: '1px solid #e8e8e8',marginTop: '-40px' }}>
                    <Button style={{ marginRight: '8px', fontSize: '13px' }} type='primary' onClick={this.confirm}>保存</Button>
                    <Button style={{ fontSize: '13px' }} onClick={this.cancel}>取消</Button>
                </div>
            </div>
        )
    }
}

export default PrintOptionComponent3
