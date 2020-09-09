import React, { PureComponent } from 'react'
import moment from 'moment'
import { Radio, Select, Checkbox, Button, InputNumber, Input, DatePicker } from 'antd'
const Option = Select.Option;
const RadioGroup = Radio.Group;
const maxLineNum = [5, 6, 7, 8, 9, 10]
const maxLineNumA4 = [18, 19, 20, 21, 22, 23, 24]
const maxLineNumA5 = [5, 6, 7, 8, 9, 10]
const maxLineNumCus = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
class PrintOptionComponent extends PureComponent {
    constructor(props) {
        super(props)
        const { printAuxAccCalc, printQuantity, printMulti, type, maxLineNum, maxLineNumA4, contentFontSize, width, height, leftPadding, rightPadding, topPadding, bottomPadding, from, customPrintTime, printTime, maxLineNumA5, maxLineNumCus } = props

        this.state = {
            printAuxAccCalc: printAuxAccCalc,
            printQuantity: printQuantity,
            printTime: props.printTime ? props.printTime : '',
            printMulti: printMulti,
            value: type ? type.toString() : '0',
            pageSize: maxLineNum ? parseInt(maxLineNum) : 6,
            pageSizeA4: maxLineNumA4 ? parseInt(maxLineNumA4) : 6,
            maxLineNumA5: maxLineNumA5 ? parseInt(maxLineNumA5) : 6,
            maxLineNumCus: maxLineNumCus ? parseInt(maxLineNumCus) : 6,
            width: width ? parseFloat(width) : 21.5,
            height: height ? parseFloat(height) : 12.5,
            leftPadding: leftPadding,
            rightPadding: rightPadding,
            topPadding: topPadding,
            bottomPadding: bottomPadding,
            contentFontSize: contentFontSize,
            heightConst: [10, 10.5, 11, 11.5, 12, 12.5, 13],
            widthConst: from == 'proofList' ? [19, 19.5, 20, 20.5, 21, 21.5, 22, 24] : [19, 19.5, 20, 20.5, 21, 21.5, 22],
            creator: props.creator ? props.creator : '',//自定义制表人
            auditor: props.auditor ? props.auditor : '',//自定义财务负责人
            supervisor: props.supervisor ? props.supervisor : '', //自定义主管
            creatorButton: props.creatorType == -1 ? false : true,
            auditorButton: props.auditorType == -1 ? false : true,
            supervisorButton: props.supervisorType == -1 ? false : true,
            supervisorType: props.supervisorType || props.supervisorType == 0 ? props.supervisorType : '', //自定义主管（-1：不勾选，-2：原主管，-3：隐藏主管这一行，0：自定义，1：当前操作人）
            creatorType: props.creatorType || props.creatorType == 0 ? props.creatorType : '', //制表人勾选项枚举类型(-1:没有勾选，0:自定义，1:制表人)
            auditorType: props.auditorType || props.auditorType == 0 ? props.auditorType : '', //财务负责人勾选项枚举类型(-1:没有勾选，0:自定义，1:制表人)
            enableddate: props.enableddate ? props.enableddate : '',
            customPrintTime: props.customPrintTime && props.customPrintTime != ' ' ? moment(props.customPrintTime, 'YYYY-MM-DD HH:mm:ss') : '',//自定义时间
            timeOriginal: props.customPrintTime ? 1 : 0,
            creatorFlag: false,
            editorFlag: false,
        }
    }
    componentWillReceiveProps(nextProps) {
        const { isAllPrint, printAuxAccCalc, printQuantity, printMulti, type, contentFontSize, maxLineNum, maxLineNumA4, width, height, leftPadding, rightPadding, topPadding, bottomPadding, maxLineNumA5, maxLineNumCus } = nextProps

        if(!isAllPrint){
            this.setState({
                printAuxAccCalc: printAuxAccCalc,
                printQuantity: printQuantity,
                printMulti: printMulti,
                value: type ? type : '0',
                contentFontSize: contentFontSize,
                pageSize: maxLineNum ? parseInt(maxLineNum) : 6,
                pageSizeA4: maxLineNumA4 ? parseInt(maxLineNumA4) : 6,
                maxLineNumA5: maxLineNumA5 ? parseInt(maxLineNumA5) : 6,
                maxLineNumCus: maxLineNumCus ? parseInt(maxLineNumCus) : 6,
                width: width ? parseFloat(width) : 215,
                height: height ? parseFloat(height) : 125,
                leftPadding: leftPadding,
                rightPadding: rightPadding,
                topPadding: topPadding,
                bottomPadding: bottomPadding,
            })
        }
    }
    changeRadioState = (e) => {
        this.setState({
            value: e.target.value,
        })
    }
    changeAccount = (e, nameStr) => {
        if (nameStr == 'creatorButton' && e.target.checked == true) {
            this.setState({
                creatorType: this.state.creatorType !== -1 ? this.state.creatorType : -2,
            })
        }
        if (nameStr == 'auditorButton' && e.target.checked == true) {
            this.setState({
                auditorType: this.state.auditorType !== -1 ? this.state.auditorType : -2,
            })
        }
        if (nameStr == 'supervisorButton' && e.target.checked == true) {
            this.setState({
                supervisorType: this.state.supervisorType !== -1 ? this.state.supervisorType : -2,
            })
        }
        this.setState({
            [nameStr]: e.target.checked,
        })
    }
    changeState = (e, nameStr) => {
        this.setState({
            [nameStr]: e
        })
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
        if (nameStr == 'auditorType') {
            if (e != 0) {
                this.setState({
                    auditor: '',
                    editorFlag: false
                })
            } else {
                setTimeout(() => {
                    let editorDOM = document.getElementsByClassName('editorTypeInput')[0]
                    editorDOM.focus();
                }, 10);
            }
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
                        editorDOM.click();
                        let _input = editorDOM.querySelector('input');
                        _input && _input.click()
                    }, 10);
                }

            }
        }
    }
    changeCustom = (e, nameStr) => {
        if (nameStr == 'creator' && !!e) {
            this.setState({
                creatorFlag: false
            })
        }
        if (nameStr == 'auditor' && !!e) {
            this.setState({
                editorFlag: false
            })
        }
        this.setState({
            [nameStr]: e.target.value,
        })
    }
    changeQuantity = (e) => {
        this.setState({
            printQuantity: e.target.checked,
        })
    }
    changeMultiCurrency = (e) => {
        this.setState({
            printMulti: e.target.checked,
        })
    }

    changePageSize = (e) => {
        this.setState({
            pageSize: e
        })
    }
    changePageSizeA4 = (e) => {
        this.setState({
            pageSizeA4: e
        })
    }
    changePageSizeA5 = (e) => {
        this.setState({
            maxLineNumA5: e
        })
    }
    changeMaxLineNumCus = (e) => {
        this.setState({
            maxLineNumCus: e
        })
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

    confirm = () => {
        var creatorFlag, editorFlag, supervisorFlag
        if (this.state.creatorType == '0' && !this.state.creator) {
            creatorFlag = true
            this.setState({
                creatorFlag: true
            })
        }
        if (this.state.auditorType == '0' && !this.state.auditor) {
            editorFlag = true
            this.setState({
                editorFlag: true
            })
        }
        if (this.state.supervisorType == '0' && !this.state.supervisor) {
            supervisorFlag = true
            this.setState({
                supervisorFlag: true
            })
        }
        if (!editorFlag && !creatorFlag && !supervisorFlag) {
            if(!this.props.source){
                this.props.closeModal()
            }
            if (this.state.creatorButton == false) {
                this.state.creatorType = -1
            }
            if (this.state.auditorButton == false) {
                this.state.auditorType = -1
            }
            if (this.state.supervisorButton == false) {
                this.state.supervisorType = -1
            }
            this.state.type = this.state.value
            this.state.maxLineNum = this.state.pageSize
            this.state.maxLineNumA4 = this.state.pageSizeA4
            this.state.contentFontSize = this.state.contentFontSize
            this.state.customPrintTime = this.state.timeOriginal == 1 ? this.state.customPrintTime ? moment(this.state.customPrintTime).format('YYYY-MM-DD HH:mm:ss') : ' ' : ''
            this.props.callBack(this.state)
        }

    }
    cancel = () => {
        this.props.closeModal()
    }
    dateChange = (key, value) => {
        this.setState({
            [key]: value
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

    batchPrint1 = () => {
        return this.state
    }
    confirmBatch = () => {
        var creatorFlag, editorFlag, supervisorFlag
        if (this.state.creatorType == '0' && !this.state.creator) {
            creatorFlag = true
            this.setState({
                creatorFlag: true
            })
        }
        if (this.state.auditorType == '0' && !this.state.auditor) {
            editorFlag = true
            this.setState({
                editorFlag: true
            })
        }
        if (this.state.supervisorType == '0' && !this.state.supervisor) {
            supervisorFlag = true
            this.setState({
                supervisorFlag: true
            })
        }
        if (!editorFlag && !creatorFlag && !supervisorFlag) {
            if (this.state.creatorButton == false) {
                this.state.creatorType = -1
            }
            if (this.state.auditorButton == false) {
                this.state.auditorType = -1
            }
            if (this.state.supervisorButton == false) {
                this.state.supervisorType = -1
            }
            this.state.type = this.state.value
            this.state.maxLineNum = this.state.pageSize
            this.state.maxLineNumA4 = this.state.pageSizeA4
            this.state.contentFontSize = this.state.contentFontSize
            this.state.customPrintTime = this.state.timeOriginal == 1 ? this.state.customPrintTime ? moment(this.state.customPrintTime).format('YYYY-MM-DD HH:mm:ss') : ' ' : ''
            return true
        }else{
            return false
        }
    }
    batchPrint1 = () => {
        if(this.confirmBatch()){
            if (this.state.creatorButton == false) {
                this.state.creatorType = -1
            }
            if (this.state.auditorButton == false) {
                this.state.auditorType = -1
            }
            if (this.state.supervisorButton == false) {
                this.state.supervisorType = -1
            }
            this.state.type = this.state.value
            this.state.maxLineNum = this.state.pageSize
            this.state.maxLineNumA4 = this.state.pageSizeA4
            this.state.contentFontSize = this.state.contentFontSize
            this.state.customPrintTime = this.state.timeOriginal == 1 ? this.state.customPrintTime ? moment(this.state.customPrintTime).format('YYYY-MM-DD HH:mm:ss') : ' ' : ''
            return this.state
        }
    }
    render() {
        let  { customPrintTime } = this.state
        if(customPrintTime&&typeof(customPrintTime)=='string'){
            customPrintTime=moment(customPrintTime,'YYYY-MM-DD HH:mm:ss')
        }
        return (
            <div className="printOption" style={{ padding: '20px' }}>

                <form>
                    <div className="ant-form-item ant-form-item-compact">
                        <div className="col-18">
                            <RadioGroup value={this.state.value} onChange={(e) => { this.changeRadioState(e) }} style={{ width: '100%' }}>
                                <div className="item" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '10px' }}>
                                    <Radio value="3">A4一版</Radio>
                                    <div className="item-select" style={{ display: 'inline', width: '65%', textAlign: 'right' }}>
                                        <label style={{ fontSize: '13px' }}>每页分录数：</label>
                                        <Select value={this.state.pageSizeA4} style={{ width: 125 }} disabled={this.state.value == "3" ? false : true} onChange={(e) => { this.changePageSizeA4(e) }}>

                                            {maxLineNumA4.map(o => {
                                                return <Option value={o}>{o}</Option>
                                            })}

                                        </Select>
                                    </div>

                                </div>
                                <div className="item" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '10px' }}>
                                    <Radio value="0">A4两版</Radio>
                                    <div className="item-select" style={{ display: 'inline', width: '65%', textAlign: 'right' }}>
                                        <label style={{ fontSize: '13px' }}>每页分录数：</label>
                                        <Select value={this.state.pageSize} style={{ width: 125 }} disabled={this.state.value == "0" ? false : true} onChange={(e) => { this.changePageSize(e) }}>

                                            {maxLineNum.map(o => {
                                                return <Option value={o}>{o}</Option>
                                            })}

                                        </Select>
                                    </div>

                                </div>

                                <div className="item" style={{ marginBottom: '10px' }}>
                                    <Radio value="1">A4三版</Radio>
                                </div>
                                <div className="item" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '10px' }}>
                                    <Radio value="4" style={{ width: '70px' }}>A5</Radio>
                                    <div className="item-select" style={{ display: 'inline', width: '65%', textAlign: 'right' }}>
                                        <label style={{ fontSize: '13px' }}>每页分录数：</label>
                                        <Select value={this.state.maxLineNumA5} style={{ width: 125 }} disabled={this.state.value == "4" ? false : true} onChange={(e) => { this.changePageSizeA5(e) }}>

                                            {maxLineNumA5.map(o => {
                                                return <Option value={o}>{o}</Option>
                                            })}

                                        </Select>
                                    </div>
                                </div>
                                <div className="item" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '10px' }}>
                                    <Radio value="2">自定义大小</Radio>
                                    <div className="item-select" style={{ marginRight: '5px' }}>
                                        <label style={{ fontSize: '13px' }}>宽：</label>
                                        <InputNumber value={this.state.width} disabled={this.state.value == "2" ? false : true} style={{ width: 80, marginRight: '5px', textAlign: 'right' }} onChange={(e) => { this.changeWidth(e) }} min={100} max={297} precision={0} />
                                        <label style={{ fontSize: '13px' }}>毫米</label>
                                        {/* {this.state.widthConst.map(o => {
                                    return <Option value={o}>{o}</Option>
                                })} */}

                                    </div>
                                    <div className="item-select" style={{}}>
                                        <label style={{ fontSize: '13px' }}>高：</label>
                                        <InputNumber value={this.state.height} disabled={this.state.value == "2" ? false : true} style={{ width: 80, marginRight: '5px', textAlign: 'right' }} onChange={(e) => { this.changeHeight(e) }} min={80} max={297} precision={0} />
                                        <label style={{ fontSize: '13px' }}>毫米</label>
                                        {/* <Select value={this.state.height} style={{width:80}} disabled = {this.state.value == "2"?false:true} onChange = {(e) => {this.changeHeight(e)}}> */}
                                        {/* {this.state.heightConst.map(o => {
                                    return <Option value={o}>{o}</Option>
                                })} */}

                                    </div>
                                    <div className="item-select" style={{ display: 'inline', width: '40%', textAlign: 'right' }}>
                                        <label style={{ fontSize: '13px' }}>每页分录数：</label>
                                        <Select value={this.state.maxLineNumCus} style={{ width: 125 }} disabled={this.state.value == "2" ? false : true} onChange={(e) => { this.changeMaxLineNumCus(e) }}>

                                            {maxLineNumCus.map(o => {
                                                return <Option value={o}>{o}</Option>
                                            })}

                                        </Select>
                                    </div>
                                </div>
                                <div style={{ marginBottom: 10 }}>
                                    <label value={2} style={{ width: '59px', display: 'inline-block' }}>边距调整</label>
                                    <div className="item-select" style={{ marginRight: '15px', display: 'inline-block' }}>
                                        <label style={{ fontSize: '13px' }}>左：</label>
                                        <InputNumber value={this.state.leftPadding} style={{ width: 60, marginRight: '5px', textAlign: 'right' }} onChange={(e) => { this.changeState(e, 'leftPadding') }} min={5} max={30} precision={0} />
                                        <label style={{}}>毫米</label>
                                    </div>
                                    <div className="item-select" style={{ marginRight: '15px', display: 'inline-block' }}>
                                        <label style={{}}>右：</label>
                                        <InputNumber value={this.state.rightPadding} style={{ width: 60, marginRight: '5px', textAlign: 'right' }} onChange={(e) => { this.changeState(e, 'rightPadding') }} min={5} max={30} precision={0} />
                                        <label style={{}}>毫米</label>
                                    </div>
                                    <div className="item-select" style={{ marginRight: '15px', display: 'inline-block' }}>
                                        <label style={{}}>上：</label>
                                        <InputNumber value={this.state.topPadding} style={{ width: 60, marginRight: '5px', textAlign: 'right' }} onChange={(e) => { this.changeState(e, 'topPadding') }} min={0} max={30} precision={0} />
                                        <label style={{}}>毫米</label>
                                    </div>
                                    <div className="item-select" style={{ display: 'inline-block' }}>
                                        <label style={{}}>下：</label>
                                        <InputNumber value={this.state.bottomPadding} style={{ width: 60, marginRight: '5px', textAlign: 'right' }} onChange={(e) => { this.changeState(e, 'bottomPadding') }} min={0} max={30} precision={0} />
                                        <label style={{}}>毫米</label>
                                    </div>
                                </div>
                                <div>
                                    <label value={2} style={{ width: '59px', display: 'inline-block', marginBottom: 5 }}>字号调整</label>
                                    <div className="item-select" style={{ marginRight: '20px', display: 'inline-block' }}>
                                        <InputNumber value={this.state.contentFontSize} style={{ width: 60, marginRight: '5px', textAlign: 'right', height: '30px', verticalAlign: 'middle' }} onChange={(e) => { this.changeState(e, 'contentFontSize') }} min={5} max={12} precision={0} />
                                    </div>
                                </div>
                                <div className="item" style={{ paddingBottom: '8px', height: '40px', lineHeight: '40px' }}>
                                    <Checkbox checked={this.state.printAuxAccCalc} onChange={(e) => { this.changeAccount(e, 'printAuxAccCalc') }}>打印辅助核算</Checkbox>
                                    <Checkbox checked={this.state.printQuantity} onChange={(e) => { this.changeQuantity(e) }}>打印数量核算</Checkbox>
                                    <Checkbox checked={this.state.printMulti} onChange={(e) => { this.changeMultiCurrency(e) }}>打印外币核算</Checkbox>
                                </div>
                                {this.props.from == 'proofList' ?

                                    <div>
                                        <div className="item" style={{ paddingBottom: '8px', height: '50px', lineHeight: '40px' }}>
                                            <Checkbox style={{ width: 115, display: 'inline-block' }} checked={this.state.creatorButton} onChange={(e) => { this.changeAccount(e, 'creatorButton') }}>打印制单人</Checkbox>
                                            {this.state.creatorButton ?
                                                <RadioGroup value={this.state.creatorType} onChange={(e) => { this.changeState(e.target.value, 'creatorType') }} style={{}} >
                                                    <Radio value={-2} style={{ width: 100, display: 'inline-block', marginRight: '15px', lineHeight: '32px' }}>原制单人</Radio>
                                                    <Radio value={1} style={{ width: 100, display: 'inline-block', lineHeight: '32px' }} >当前操作人</Radio>
                                                    <Radio value={0} style={{ lineHeight: '32px', marginRight: '0px' }} >自定义</Radio>
                                                    <div style={{ display: 'inline-block', position: 'relative' }}>
                                                        <Input className='creatorTypeInput' placeholder='制单人' value={this.state.creator} disabled={this.state.creatorType == 0 ? false : true} style={{ width: 145, marginRight: '5px', border: this.state.creatorFlag ? '1px solid red' : '' }} onChange={(e) => { this.changeCustom(e, 'creator') }} />
                                                        <span style={{ width: 120, marginRight: '5px', display: this.state.creatorFlag ? 'block' : 'none', position: 'absolute', top: '25px', color: 'red' }} >不可为空</span>
                                                    </div>
                                                </RadioGroup> : null
                                            }
                                        </div>
                                        <div className="item" style={{ paddingBottom: '8px', height: '50px', lineHeight: '40px' }}>
                                            <Checkbox style={{ width: 115, display: 'inline-block' }} checked={this.state.auditorButton} onChange={(e) => { this.changeAccount(e, 'auditorButton') }}>打印审核人</Checkbox>
                                            {this.state.auditorButton ?
                                                <RadioGroup value={this.state.auditorType} onChange={(e) => { this.changeState(e.target.value, 'auditorType') }} style={{}} >
                                                    <Radio value={-2} style={{ width: 100, display: 'inline-block', marginRight: '15px', lineHeight: '32px' }}>原审核人</Radio>
                                                    <Radio value={1} style={{ width: 100, display: 'inline-block', lineHeight: '32px' }} >当前操作人</Radio>
                                                    <Radio value={0} style={{ lineHeight: '32px', marginRight: '0px' }} >自定义</Radio>
                                                    <div style={{ display: 'inline-block', position: 'relative' }}>
                                                        <Input className="editorTypeInput" placeholder='审核人' value={this.state.auditor} disabled={this.state.auditorType == 0 ? false : true} style={{ width: 145, marginRight: '5px', border: this.state.editorFlag ? '1px solid red' : '' }} onChange={(e) => { this.changeCustom(e, 'auditor') }} />
                                                        <span style={{ width: 120, marginRight: '5px', display: this.state.editorFlag ? 'block' : 'none', position: 'absolute', top: '25px', color: 'red' }} >不可为空</span>
                                                    </div>
                                                </RadioGroup> : null
                                            }
                                        </div>
                                        {
                                            this.props.supervisorType !== -3 ?
                                                <div className="item" style={{ paddingBottom: '8px', height: '50px', lineHeight: '40px' }}>
                                                    <Checkbox style={{ width: 115, display: 'inline-block' }} checked={this.state.supervisorButton} onChange={(e) => { this.changeAccount(e, 'supervisorButton') }}>打印主管</Checkbox>
                                                    {this.state.supervisorButton ?
                                                        <RadioGroup value={this.state.supervisorType} onChange={(e) => { this.changeState(e.target.value, 'supervisorType') }} style={{}} >
                                                            <Radio value={-2} style={{ width: 100, display: 'inline-block', marginRight: '15px', lineHeight: '32px' }}>原主管</Radio>
                                                            <Radio value={1} style={{ width: 100, display: 'inline-block', lineHeight: '32px' }} >当前操作人</Radio>
                                                            <Radio value={0} style={{ lineHeight: '32px', marginRight: '0px' }} >自定义</Radio>
                                                            <div style={{ display: 'inline-block', position: 'relative' }}>
                                                                <Input className="supervisorTypeInput" placeholder='主管人' value={this.state.supervisor} disabled={this.state.supervisorType == 0 ? false : true} style={{ width: 145, marginRight: '5px', border: this.state.supervisorFlag ? '1px solid red' : '' }} onChange={(e) => { this.changeCustom(e, 'supervisor') }} />
                                                                <span style={{ width: 120, marginRight: '5px', display: this.state.supervisorFlag ? 'block' : 'none', position: 'absolute', top: '25px', color: 'red' }} >不可为空</span>
                                                            </div>
                                                        </RadioGroup> : null
                                                    }
                                                </div> : null
                                        }

                                        <div className="item" style={{ paddingBottom: '8px', height: '40px', lineHeight: '40px' }}>
                                            <Checkbox style={{ width: 115, display: 'inline-block' }} checked={this.state.printTime} onChange={(e) => { this.changeAccount(e, 'printTime') }}>显示打印时间</Checkbox>
                                            {this.state.printTime ?
                                                <RadioGroup value={this.state.timeOriginal} onChange={(e) => { this.changeState(e.target.value, 'timeOriginal') }} >
                                                    <Radio value={0} style={{ width: 100, display: 'inline-block', marginRight: '15px', lineHeight: '32px' }}>当前操作时间</Radio>
                                                    <Radio value={1} style={{ lineHeight: '32px', marginRight: '0px' }} >自定义</Radio>
                                                    <DatePicker
                                                        style={{ width: '160px' }}
                                                        disabled={this.state.timeOriginal == 1 ? false : true}
                                                        allowClear={false}
                                                        className='datePicker'
                                                        value={customPrintTime}
                                                        format="YYYY-MM-DD HH:mm:ss"
                                                        disabledDate={(current) => this.disabledDate(current)}
                                                        onChange={(value) => this.dateChange('customPrintTime', value)}
                                                    />
                                                </RadioGroup> : null
                                            }
                                        </div></div> : null
                                }

                            </RadioGroup>
                        </div>
                    </div>
                </form>
                <div style={{ width: '100%', textAlign: 'right', paddingTop: '12px', paddingRight: '12px', borderTop: '1px solid #e8e8e8' }}>
                    <Button type='primary' onClick={this.confirm}>确定</Button>
                    <Button style={{ marginLeft: '8px' }} onClick={this.cancel}>取消</Button>
                </div>
            </div>
        )
    }
}

export default PrintOptionComponent
