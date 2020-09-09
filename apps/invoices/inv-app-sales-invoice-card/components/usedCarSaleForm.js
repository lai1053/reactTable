import React from 'react'
import { Form, Row, Col, Spin, Tooltip } from 'antd';
import moment from 'moment';
import { Input, Select, Radio, DatePicker } from 'edf-component';
import { number } from 'edf-utils'
import { Map, fromJS } from 'immutable'
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

export default class UsedCarSaleForm extends React.Component {
    componentDidMount() {
        // To disabled submit button at the beginning.
        // this.props.form.validateFields();
    }
    constructor(props) {
        super(props);

        this.state = {
            cellIsFocus: false,
        };
    }
    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // console.log('Received values of form: ', values);
                this.props.handleSubmit && this.props.handleSubmit(values)
            }
        });
    }
    //数量格式化
    numberFormat = (v, decimals, isFocus, clearZero) => {
        if (isFocus === true || isNaN(Number(v))) return v
        let val = number.format(v, decimals);
        //去除小数点后面的0
        if (!isFocus && clearZero === true && typeof val === 'string') {
            let [a, b] = val.split('.');
            return b && Number(b) ? `${a}.${Number(`0.${b}`).toString().slice(2)}` : a
        }
        return val;
    }
    quantityFormat = (quantity, decimals, isFocus, clearZero, autoDecimals) => {
      
        if (quantity !== undefined) {
            if (autoDecimals && quantity) {
                let [a, b] = String(quantity).split('.');
                if(b === undefined){
                    b = "00"
                }
                decimals = Math.max(decimals, b.length)
            }
            return this.numberFormat(quantity, decimals, isFocus, clearZero)
        }
    }
    //直接改变value
    handleFieldChangeV = (path, v, must) => {
        if (must) {
            let errorPath = path.replace('form', 'error')
            let obj = {
                [path]: v,
                [errorPath]: ''
            }
            this.props.metaAction.sfs(obj)
        } else {
            this.props.metaAction.sf(path, v)
        }
    }
    handleGetPopupContainer = () => {
        return document.querySelector(".ant-modal .ant-modal-body")
    }
    notAllowEdit = () => {
        //是否允许修改 编辑时 录入的发票都允许修改 
        //fplyLx 发票来源类型，1：读取，2：录入，3：导入
        let kjxh = this.props.kjxh;
        let fplyLx = this.props.metaAction.gf('data.form.fplyLx');
        if (!kjxh) return false;
        if (fplyLx == 2) {
            return false
        }
        return true;
    }
    // 计税方式修改
    jsfsDmChange = (v) => {
        let slList = this.props.metaAction.gf('data.slListCache').toJS()
        let slListNew = [],
            kjxh = this.props.kjxh,
            zbslv = this.props.metaAction.gf('data.form.zbslv'),
            fplyLx = this.props.metaAction.gf('data.form.fplyLx'); //fplyLx 发票来源类型，1：读取，2：录入，3：导入
        switch (v) {
            case "0":
                //一般计税
                // 17%，16%，13%"
                slListNew = slList.filter(f => f.slv <= 0.17 && f.slv >= 0.13)
                break
            case "1":
                //简易征收
                // “3%，2%”
                slListNew = slList.filter(f => f.slv <= 0.03 && f.slv >= 0.01)
                break
        }
        let jshjxx = this.props.metaAction.gf('data.form.jshj'),
            se = 0,
            bhsj = 0
        if (parseFloat(jshjxx) && parseFloat(zbslv) > -1) {
            bhsj = jshjxx / (1 + zbslv)
            se = jshjxx - bhsj
        }
        this.props.metaAction.sfs({
            'data.slList': fromJS(slListNew),
            'data.form.jsfsDm': v,
            'data.form.zbslv': slListNew.find(f => f.slv == zbslv) ? zbslv : undefined,
            'data.form.hjse': !isNaN(zbslv) && !isNaN(jshjxx) ? se.toFixed(2) : undefined,
            'data.form.hjje': !isNaN(zbslv) && !isNaN(jshjxx) ? bhsj.toFixed(2) : undefined,
            'data.error.zbslv': '',
            'data.error.jsfsDm': '',
            // 'data.other.jzjtbzDisabled': jzjtbzDisabled,
            // 'data.form.jzjtbz': jzjtbz,
        })
    }
    // 税率选择
    zbslvChange = (v) => {
        v = parseFloat(v)
        let jsfs = this.props.metaAction.gf('data.form.jsfsDm')
        // "0":一般计税；"1":简易征收；"2":免抵退；"3":免税
        if (v == 0.17 || v == 0.16 || v == 0.13) {
            // 一般纳税人：当税率选择“17%，16%，13%其中一种时 计税方式自动选中“一般计税”
            jsfs = "0"
        }
        if (v == 0.03 || v == 0.02) {
            // 一般纳税人：当税率选择“3%，2%”其中一种时 计税方式自动选中“简易征收”
            jsfs = "1"
        }

        let jshjxx = this.props.metaAction.gf('data.form.jshj'),
            se = 0,
            bhsj = 0
        if (parseFloat(jshjxx) && parseFloat(v) > -1) {
            bhsj = jshjxx / (1 + v)
            se = jshjxx - bhsj
        }
        this.props.metaAction.sfs({
            'data.form.jsfsDm': jsfs,
            'data.form.zbslv': !isNaN(v) ? v : undefined,
            'data.form.hjse': !isNaN(v) ? se.toFixed(2) : undefined,
            'data.form.hjje': !isNaN(v) ? bhsj.toFixed(2) : undefined,
            'data.error.zbslv': '',
        })
    }
    // 价税合计修改
    jshjChange = (v) => {
        let { kjxh, fpzlDm, fplx, readOnly, metaAction } = this.props,
            se = 0,
            bhsj = 0;
        if (fplx === 'jxfp') {
            metaAction.sfs({
                'data.form.jshj': v,
                'data.error.jshj': '',
            });
            return
        }
        const zbslv = metaAction.gf('data.form.zbslv')
        if (parseFloat(v) && parseFloat(zbslv) > -1) {
            bhsj = v / (1 + zbslv)
            se = v - bhsj
        }
        metaAction.sfs({
            'data.form.jshj': v,
            'data.form.hjse': !isNaN(zbslv) ? se.toFixed(2) : undefined,
            'data.form.hjje': !isNaN(zbslv) ? bhsj.toFixed(2) : undefined,
            'data.error.jshj': '',
        })
    }
    handleFocus = () => {
        this.setState({
            cellIsFocus: true,
        })
    }
    handleBlur = () => {
        this.setState({
            cellIsFocus: false,
        })
    }
    smallToBig = (v) => {
        return v !== undefined && v !== null ? number.moneySmalltoBig(v) : null
    }
    getDefaultPickerValue = () => {
        let nsqj = this.props.metaAction.gf('data.form.kprq') || this.props.nsqj;
        nsqj = nsqj && `${nsqj.slice(0,4)}-${nsqj.slice(4,6)}-01` || moment().format('YYYY-MM-DD')
        return moment(nsqj, 'YYYY-MM-DD')
    }
    disabledDate = (current) => {
        const nsqj = this.props.nsqj || moment().format('YYYYMM')
        return current && current > moment(nsqj + '01').subtract(-1, 'month')
    }
    // 
    render() {
        // const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
        const { kjxh, fpzlDm, nsqj, fplx, readOnly, metaAction } = this.props,
            sf = metaAction.sf, { form, error, title, loading } = metaAction.gf('data').toJS(),
            notAllowEdit = this.notAllowEdit(), { cellIsFocus } = this.state;
        // console.log('Received', this.props.action)
        let slList = [],
            jsfsList = [];
        if (fplx === 'xxfp') {
            slList = metaAction.gf('data.slList').toJS();
            jsfsList = metaAction.gf('data.jsfsList').toJS()
        }
        return (
            <Spin
                tip='加载中...'
                deley={500}
                spinning={loading}
            >
                <div className="inv-card-header">
                    <div className="left"></div>
                    <div className="title" title={title || ''}>{title||''}</div>
                    <Row className="right">
                        <Col span="10" className={readOnly?'':'ant-form-item-required'}>发票代码：</Col>
                        <Col span="14" className={error.fpdm ?'-sales-error':readOnly?'text':''}>
                            {
                                !readOnly?
                                <Tooltip
                                    getPopupContainer={this.handleGetPopupContainer}
                                    overlayClassName='-sales-error-toolTip'
                                    title={error.fpdm}
                                    visible={error.fpdm && error.fpdm.indexOf("不能为空")==-1}
                                    placement='left'
                                >
                                    <Input 
                                        maxLength={12}
                                        disabledDate={this.disabledDate}
                                        disabled={notAllowEdit}
                                        value={form.fpdm}
                                        onChange={e=>{this.handleFieldChangeV('data.form.fpdm',e.target.value,true);sf('data.form.sf03',e.target.value)}}
                                    />
                                </Tooltip>
                                :form.fpdm || ''
                            }
                        </Col>
                        <Col span="10" className={readOnly?'':'ant-form-item-required'}>发票号码：</Col>
                        <Col span="14" className={error.fphm ?'-sales-error':readOnly?'text':''}>
                            {
                                !readOnly?
                                <Tooltip
                                    getPopupContainer={this.handleGetPopupContainer}
                                    overlayClassName='-sales-error-toolTip'
                                    title={error.fphm}
                                    visible={error.fphm && error.fphm.indexOf("不能为空")==-1}
                                    placement='left'
                                >
                                    <Input 
                                        maxLength={8}
                                        disabledDate={this.disabledDate}
                                        disabled={notAllowEdit}
                                        value={form.fphm}
                                        onChange={e=>{this.handleFieldChangeV('data.form.fphm',e.target.value,true);sf('data.form.sf04',e.target.value)}}
                                    />
                                </Tooltip>
                                :form.fphm || ''
                            }
                        </Col>
                        <Col span="10" className={readOnly?'':'ant-form-item-required'}>开票日期：</Col>
                        <Col span="14" className={error.kprq ?'-sales-error':readOnly?'text':''}>
                            {
                                !readOnly?
                                <Tooltip
                                    getPopupContainer={this.handleGetPopupContainer}
                                    overlayClassName='-sales-error-toolTip'
                                    title={error.kprq}
                                    visible={error.kprq && error.kprq.indexOf("不能为空")==-1}
                                    placement='left'
                                >
                                    <DatePicker 
                                        getCalendarContainer={trigger => trigger.parentNode}
                                        defaultPickerValue={this.getDefaultPickerValue()}
                                        disabledDate={this.disabledDate}
                                        disabled={notAllowEdit}
                                        style={{width:'100%'}}
                                        value={form.kprq && moment(form.kprq,'YYYY-MM-DD')|| undefined}
                                        format="YYYY-MM-DD"
                                        onChange={v=>this.handleFieldChangeV('data.form.kprq',moment.isMoment(v)&& v.format('YYYY-MM-DD') || v,true)}
                                    />
                                </Tooltip>
                                :form.kprq || ''
                            }
                        </Col>
                    </Row>
                </div>
                <table className="inv-card-table">
                    <colgroup>
                        <col style={{width:`${1/24*100}%`}}/>
                        <col style={{width:`${3/24*100}%`}}/>
                        <col style={{width:`${5/24*100}%`}}/>
                        <col style={{width:`${3/24*100}%`}}/>
                        <col style={{width:`${1/24*100}%`}}/>
                        <col style={{width:`${3/24*100}%`}}/>
                        <col style={{width:`${3/24*100}%`}}/>
                        <col style={{width:`${5/24*100}%`}}/>
                    </colgroup>
                    <tr>
                        <td className="label bg" colSpan="2" width={`${4/24*100}%`}>机打代码</td>
                        <td className="text" colSpan="6" width={`${20/24*100}%`} disabled>{form.sf03 || ''}</td>
                     {/*   <td className="v-rl" colSpan="1" rowSpan="3" width={`${1/24*100}%`}>税控码</td>
                        <td className={error.sf12 ?'light-bottom-border -sales-error':readOnly?'text light-bottom-border':'light-bottom-border'} colSpan="3" width={`${11/24*100}%`}>
                            {
                                !readOnly?
                                <Tooltip
                                    getPopupContainer={this.handleGetPopupContainer}
                                    overlayClassName='-sales-error-toolTip'
                                    title={error.sf12}
                                    visible={error.sf12 && error.sf12.indexOf("不能为空")==-1}
                                    placement='left'
                                >
                                    <Input 
                                        value={form.sf12}
                                        maxLength={36}
                                        disabled={notAllowEdit}
                                        onKeyUp={ e => e.target.value=e.target.value.replace(/[\u4e00-\u9fa5]/g,'')}
                                        onChange={e=>this.handleFieldChangeV('data.form.sf12',e.target.value,true)}
                                    />
                                </Tooltip>
                                :form.sf12 || ''
                            }
                        </td>*/}
                    </tr>
                    <tr>
                        <td className="label bg" colSpan="2" width={`${4/24*100}%`}>机打号码</td>
                        <td className="text" colSpan="6" width={`${8/24*100}%`} disabled>{form.sf04 || ''}</td>
                        {/*<td className={error.sf13 ?'light-bottom-border -sales-error':readOnly?'text light-bottom-border':'light-bottom-border'} colSpan="3" width={`${11/24*100}%`}>
                            {
                                !readOnly?
                                <Tooltip
                                    getPopupContainer={this.handleGetPopupContainer}
                                    overlayClassName='-sales-error-toolTip'
                                    title={error.sf13}
                                    visible={error.sf13 && error.sf13.indexOf("不能为空")==-1}
                                    placement='left'
                                >
                                    <Input 
                                        disabled={notAllowEdit}
                                        value={form.sf13}
                                        maxLength={36}
                                        onKeyUp={ e => e.target.value=e.target.value.replace(/[\u4e00-\u9fa5]/g,'')}
                                        onChange={e=>this.handleFieldChangeV('data.form.sf13',e.target.value,true)}
                                    />
                                </Tooltip>
                                :form.sf13 || ''
                            }
                        </td>*/}
                    </tr>
                    <tr>
                        <td className="label bg" colSpan="2" width={`${4/24*100}%`}>机器编码</td>
                    {/*    <td className={readOnly?'text':''} colSpan="2" width={`${8/24*100}%`}>
                            {
                                !readOnly?
                                <Input 
                                    disabled={notAllowEdit}
                                    value={form.jqbh}
                                    onChange={e=>sf('data.form.jqbh',e.target.value)}
                                />
                                :form.jqbh || ''
                            }
                        </td>*/}
                        <td className={error.sf14 ?'-sales-error':readOnly?'text':''} colSpan="6" width={`${11/24*100}%`}>
                            {
                                !readOnly?
                                <Tooltip
                                    getPopupContainer={this.handleGetPopupContainer}
                                    overlayClassName='-sales-error-toolTip'
                                    title={error.sf14}
                                    visible={error.sf14 && error.sf14.indexOf("不能为空")==-1}
                                    placement='left'
                                >
                                    <Input 
                                        disabled={notAllowEdit}
                                        value={form.sf14}
                                        maxLength={36}
                                        onKeyUp={ e => e.target.value=e.target.value.replace(/[\u4e00-\u9fa5]/g,'')}
                                        onChange={e=>this.handleFieldChangeV('data.form.sf14',e.target.value,true)}
                                    />
                                </Tooltip>
                                :form.sf14 || ''
                            }
                        </td>
                    </tr>
                    <tr>
                        <td className="v-rl" colSpan="1" rowSpan="3" width={`${1/24*100}%`}>购买方</td>
                        <td className={fplx==='xxfp' && !readOnly?'label light-bottom-border light-right-border ant-form-item-required':'label light-bottom-border light-right-border'} colSpan="1" width={`${3/24*100}%`}>名称</td>
                        <td className={fplx==='xxfp'&&error.gfmc?'light-bottom-border -sales-error':(readOnly || fplx==='jxfp')?'text light-bottom-border':'light-bottom-border'} colSpan="2" width={`${8/24*100}%`}
                            disabled={notAllowEdit||fplx==='jxfp'}
                        >
                            {
                                fplx==='xxfp' && !readOnly?
                                <Tooltip
                                    getPopupContainer={this.handleGetPopupContainer}
                                    overlayClassName='-sales-error-toolTip'
                                    title={error.gfmc}
                                    visible={error.gfmc && error.gfmc.indexOf("不能为空")==-1}
                                    placement='left'
                                >
                                    <Input 
                                        disabled={notAllowEdit}
                                        value={form.gfmc}
                                        onChange={e=>this.handleFieldChangeV('data.form.gfmc',e.target.value,true)}
                                    />
                                </Tooltip>
                                :form.gfmc || ''
                            }
                        </td>
                        <td className="v-rl" colSpan="1" rowSpan="3" width={`${1/24*100}%`}>销售方</td>
                        <td className={fplx==='jxfp' && !readOnly?'label light-bottom-border light-right-border ant-form-item-required':'label light-bottom-border light-right-border'} colSpan="1" width={`${3/24*100}%`}>名称</td>
                        <td className={fplx==='jxfp'&& error.xfmc?'light-bottom-border -sales-error':(readOnly || fplx==='xxfp')?'text light-bottom-border':'light-bottom-border'} colSpan="2" width={`${8/24*100}%`}
                            disabled={notAllowEdit||fplx==='xxfp'}
                        >
                            {
                                fplx==='jxfp' && !readOnly?
                                <Tooltip
                                    getPopupContainer={this.handleGetPopupContainer}
                                    overlayClassName='-sales-error-toolTip'
                                    title={error.xfmc}
                                    visible={error.xfmc && error.xfmc.indexOf("不能为空")==-1}
                                    placement='left'
                                >
                                    <Input 
                                        disabled={notAllowEdit}
                                        value={form.xfmc}
                                        onChange={e=>this.handleFieldChangeV('data.form.xfmc',e.target.value,true)}
                                    />
                                </Tooltip>
                                :form.xfmc || ''
                            }
                        </td>
                    </tr>
                    <tr>
                        <td className={fplx==='xxfp' && !readOnly?'label light-bottom-border light-right-border ant-form-item-required':'label light-bottom-border light-right-border'} colSpan="1" width={`${3/24*100}%`}>单位代码/身份证</td>
                        <td className={fplx==='xxfp'&&error.gfsbh?'light-bottom-border -sales-error':(readOnly || fplx==='jxfp')?'text light-bottom-border':'light-bottom-border'} colSpan="2" width={`${8/24*100}%`}
                            disabled={notAllowEdit||fplx==='jxfp'}
                        >
                            {
                                fplx==='xxfp' && !readOnly?
                                <Tooltip
                                    getPopupContainer={this.handleGetPopupContainer}
                                    overlayClassName='-sales-error-toolTip'
                                    title={error.gfsbh}
                                    visible={error.gfsbh && error.gfsbh.indexOf("不能为空")==-1}
                                    placement='left'
                                >
                                    <Input 
                                        disabled={notAllowEdit}
                                        value={form.gfsbh}
                                        maxLength={30}
                                        onChange={e=>this.handleFieldChangeV('data.form.gfsbh',e.target.value,true)}
                                    />
                                </Tooltip>
                                :form.gfsbh || ''
                            }
                        </td>
                        <td className={fplx==='jxfp' && !readOnly?'label light-bottom-border light-right-border ant-form-item-required':'label light-bottom-border light-right-border'} colSpan="1" width={`${3/24*100}%`}>单位代码/身份证</td>
                        <td className={fplx==='jxfp'&& error.xfsbh?'light-bottom-border -sales-error':(readOnly || fplx==='xxfp')?'text light-bottom-border':'light-bottom-border'} colSpan="2" width={`${8/24*100}%`}
                            disabled={notAllowEdit||fplx==='xxfp'}
                        >
                            {
                                fplx==='jxfp' && !readOnly?
                                <Tooltip
                                    getPopupContainer={this.handleGetPopupContainer}
                                    overlayClassName='-sales-error-toolTip'
                                    title={error.xfsbh}
                                    visible={error.xfsbh && error.xfsbh.indexOf("不能为空")==-1}
                                    placement='left'
                                >
                                    <Input 
                                        disabled={notAllowEdit}
                                        value={form.xfsbh}
                                        maxLength={30}
                                        onChange={e=>this.handleFieldChangeV('data.form.xfsbh',e.target.value,true)}
                                    />
                                </Tooltip>
                                :form.xfsbh || ''
                            }
                        </td>
                    </tr>
                    <tr>
                        <td className="label light-right-border" colSpan="1" width={`${3/24*100}%`}>地址、电话</td>
                        <td className={(readOnly || fplx==='jxfp')?'text':''} colSpan="2" width={`${8/24*100}%`}
                            disabled={notAllowEdit||fplx==='jxfp'}
                        >
                            {
                                fplx==='xxfp' && !readOnly?
                                <Input 
                                    disabled={notAllowEdit}
                                    value={form.gfdzdh}
                                    onChange={e=>this.handleFieldChangeV('data.form.gfdzdh',e.target.value,false)}
                                />
                                :form.gfdzdh || ''
                            }
                        </td>
                        <td className="label light-right-border" colSpan="1" width={`${3/24*100}%`}>地址、电话</td>
                        <td className={(readOnly || fplx==='xxfp')?'text':''} colSpan="2" width={`${8/24*100}%`}
                            disabled={notAllowEdit||fplx==='xxfp'}
                        >
                            {
                                fplx==='jxfp' && !readOnly?
                                <Input 
                                    disabled={notAllowEdit}
                                    value={form.xfdzdh}
                                    onChange={e=>this.handleFieldChangeV('data.form.xfdzdh',e.target.value,false)}
                                />
                                :form.xfdzdh || ''
                            }
                        </td>
                    </tr>
                    <tr>
                        <td className="label bg" colSpan="2" width={`${4/24*100}%`}>车牌照号</td>
                        <td className={readOnly?'text':''} colSpan="1" width={`${5/24*100}%`}>
                            {
                                !readOnly?
                                <Input 
                                    disabled={notAllowEdit}
                                    value={form.wspzhm}
                                    onChange={e=>this.handleFieldChangeV('data.form.wspzhm',e.target.value,false)}
                                />
                                : form.wspzhm || ''
                            }
                        </td>
                        <td className="label bg" colSpan="1" width={`${3/24*100}%`}>登记证号</td>
                        <td className={readOnly?'text':''} colSpan="2" width={`${4/24*100}%`}>
                            {
                                !readOnly?
                                <Input 
                                    disabled={notAllowEdit}
                                    value={form.hgzs}
                                    onChange={e=>this.handleFieldChangeV('data.form.hgzs',e.target.value,false)}
                                />
                                :form.hgzs || ''
                            }
                        </td>
                        <td className={!readOnly?"label bg ant-form-item-required":'label bg'} colSpan="1" width={`${3/24*100}%`}>车辆类型</td>
                        <td className={error.cllx?'-sales-error':readOnly?'text':''} colSpan="1" width={`${5/24*100}%`}>
                            {
                                !readOnly?
                                <Tooltip
                                    getPopupContainer={this.handleGetPopupContainer}
                                    overlayClassName='-sales-error-toolTip'
                                    title={error.cllx}
                                    visible={error.cllx && error.cllx.indexOf("不能为空")==-1}
                                    placement='left'
                                >
                                    <Input 
                                        disabled={notAllowEdit}
                                        value={form.cllx}
                                        onChange={e=>this.handleFieldChangeV('data.form.cllx',e.target.value,true)}
                                    />
                                </Tooltip>
                                :form.cllx || ''
                            }
                        </td>
                    </tr>
                    <tr>
                        <td className="label bg" colSpan="2" width={`${4/24*100}%`}>车架号/车辆识别代码</td>
                        <td className={readOnly?'text':''} colSpan="1" width={`${5/24*100}%`}>
                            {
                                !readOnly?
                                <Input 
                                    disabled={notAllowEdit}
                                    value={form.cjhm}
                                    onChange={e=>this.handleFieldChangeV('data.form.cjhm',e.target.value,true)}
                                />
                                :form.cjhm || ''
                            }
                        </td>
                        <td className="label bg" colSpan="1" width={`${3/24*100}%`}>厂牌型号</td>
                        <td className={readOnly?'text':''} colSpan="2" width={`${4/24*100}%`}>
                            {
                                !readOnly?
                                <Input 
                                    disabled={notAllowEdit}
                                    value={form.cpxh}
                                    onChange={e=>this.handleFieldChangeV('data.form.cpxh',e.target.value,true)}
                                />
                                :form.cpxh || ''
                            }
                        </td>
                        <td className="label bg" colSpan="1" width={`${3/24*100}%`}>移入地车管所名称</td>
                        <td className={readOnly?'text':''} colSpan="1" width={`${5/24*100}%`}>
                            {
                                !readOnly?
                                <Input 
                                    disabled={notAllowEdit}
                                    value={form.sjdh}
                                    onChange={e=>this.handleFieldChangeV('data.form.sjdh',e.target.value,true)}
                                />
                                :form.sjdh || ''
                            }
                        </td>
                    </tr>
                    {
                        fplx==='xxfp'?
                        <tr>
                            <td className="label bg" colSpan="2" width={`${4/24*100}%`}>车架不含税额</td>
                            <td className="text" colSpan="1" width={`${5/24*100}%`} align="right" disabled>
                                {this.quantityFormat(form.hjje,2,false,false,true)}
                            </td>
                            <td className={!readOnly?"label bg ant-form-item-required":'label bg'} colSpan="1" width={`${3/24*100}%`}>税率</td>
                            <td className={error.zbslv?'-sales-error':readOnly?'text':''} colSpan="2" width={`${4/24*100}%`} align="right">
                                {
                                    !readOnly?
                                    <Tooltip
                                        getPopupContainer={this.handleGetPopupContainer}
                                        overlayClassName='-sales-error-toolTip'
                                        title={error.zbslv}
                                        visible={error.zbslv && error.zbslv.indexOf("不能为空")==-1}
                                        placement='left'
                                    >
                                        <Select
                                            getPopupContainer={trigger => trigger.parentNode}
                                            style={{ width: '100%' }}
                                            onChange={v=>this.zbslvChange(v)}
                                            value={form.zbslv}
                                            align="right"
                                        >
                                            {
                                                slList.map(item => (
                                                    <Select.Option key={item.slv} value={item.slv}>{item.slvMc}</Select.Option>
                                                ))
                                            }
                                        </Select>
                                    </Tooltip>
                                    :(slList.find(f=>f.slv===form.zbslv) || {}).slvMc || ''
                                }
                            </td>
                            <td className='label bg' colSpan="1" width={`${3/24*100}%`}>税额</td>
                            <td className='text' colSpan="1" width={`${5/24*100}%`} align="right" disabled>
                                {this.quantityFormat(form.hjse,2,false,false,true)}
                            </td>
                        </tr>
                        :null
                    }
                    <tr>
                        <td className={!readOnly?"label bg ant-form-item-required":'label bg'} colSpan="2" width={`${4/24*100}%`}>车价合计(小写)</td>
                        <td className={error.jshj?'-sales-error':readOnly?'text':''} colSpan="2" width={`${8/24*100}%`} align="right">
                            {
                                !readOnly?
                                <Tooltip
                                    getPopupContainer={this.handleGetPopupContainer}
                                    overlayClassName='-sales-error-toolTip'
                                    title={error.jshj}
                                    visible={error.jshj && error.jshj.indexOf("不能为空")==-1}
                                    placement='left'
                                    >
                                    <Input.Number 
                                        disabled={notAllowEdit}
                                        align="right"
                                        executeBlur
                                        precision={2}
                                        onFocus={this.handleFocus}
                                        onBlur={this.handleBlur}
                                        value={(cellIsFocus || form.fplyLx==1)?form.jshj:this.quantityFormat(form.jshj,2,false,false)}
                                        onChange={v=>this.jshjChange(v)}
                                    />
                                </Tooltip>
                                :this.quantityFormat(form.jshj,2,false,false,true)
                            }
                        </td>
                        <td className="label bg" colSpan="2" width={`${4/24*100}%`}>车价合计(大写)</td>
                        <td className="text" colSpan="2" width={`${8/24*100}%`} disabled>
                            {this.smallToBig(form.jshj)}
                        </td>
                    </tr>
                    <tr>
                        <td className="v-rl" colSpan="1" rowSpan="4" width={`${1/24*100}%`}>经营拍卖单位</td>
                        <td className="label light-bottom-border light-right-border" colSpan="1" width={`${3/24*100}%`}>名称</td>
                        <td className={readOnly?'text light-bottom-border':"light-bottom-border"} colSpan="2" width={`${8/24*100}%`}>
                            {
                                !readOnly?
                                <Input 
                                    disabled={notAllowEdit}
                                    value={form.sf01}
                                    onChange={e=>this.handleFieldChangeV('data.form.sf01',e.target.value,false)}
                                />
                                :form.sf01 || ''
                            }
                        </td>
                        <td className="v-rl" colSpan="1" rowSpan="4" width={`${1/24*100}%`}>二手车市场</td>
                        <td className="label light-bottom-border light-right-border" colSpan="1" width={`${3/24*100}%`}>名称</td>
                        <td className={readOnly?'text light-bottom-border':"light-bottom-border"} colSpan="2" width={`${8/24*100}%`}>
                            {
                                !readOnly?
                                <Input 
                                    disabled={notAllowEdit}
                                    value={form.sf07}
                                    onChange={e=>this.handleFieldChangeV('data.form.sf07',e.target.value,false)}
                                />
                                :form.sf07 || ''
                            }
                        </td>
                    </tr>
                    <tr>
                        <td className="label light-bottom-border light-right-border" colSpan="1" width={`${3/24*100}%`}>纳税人识别号</td>
                        <td className={readOnly?'text light-bottom-border':"light-bottom-border"} colSpan="2" width={`${8/24*100}%`}>
                            {
                                !readOnly?
                                <Input 
                                    disabled={notAllowEdit}
                                    value={form.sf02}
                                    onChange={e=>this.handleFieldChangeV('data.form.sf02',e.target.value,false)}
                                />
                                :form.sf02 || ''
                            }
                        </td>
                        <td className="label light-bottom-border light-right-border" colSpan="1" width={`${3/24*100}%`}>纳税人识别号</td>
                        <td className={readOnly?'text light-bottom-border':"light-bottom-border"} colSpan="2" width={`${8/24*100}%`}>
                            {
                                !readOnly?
                                <Input 
                                    disabled={notAllowEdit}
                                    value={form.sf08}
                                    onChange={e=>this.handleFieldChangeV('data.form.sf08',e.target.value,false)}
                                />
                                :form.sf08 || ''
                            }
                        </td>
                    </tr>
                    <tr>
                        <td className="label light-bottom-border light-right-border" colSpan="1" width={`${3/24*100}%`}>地址、电话</td>
                        <td className={readOnly?'text light-bottom-border':"light-bottom-border"} colSpan="2" width={`${8/24*100}%`}>
                            {
                                !readOnly?
                                <Input 
                                    disabled={notAllowEdit}
                                    value={form.sf05}
                                    onChange={e=>this.handleFieldChangeV('data.form.sf05',e.target.value,false)}
                                />
                                :form.sf05 || ''
                            }
                        </td>
                        <td className="label light-bottom-border light-right-border" colSpan="1" width={`${3/24*100}%`}>地址、电话</td>
                        <td className={readOnly?'text light-bottom-border':"light-bottom-border"} colSpan="2" width={`${8/24*100}%`}>
                            {
                                !readOnly?
                                <Input 
                                    disabled={notAllowEdit}
                                    value={form.sf09}
                                    onChange={e=>this.handleFieldChangeV('data.form.sf09',e.target.value,false)}
                                />
                                :form.sf09 || ''
                            }
                        </td>
                    </tr>
                    <tr>
                        <td className="label light-right-border" colSpan="1" width={`${3/24*100}%`}>银行账号</td>
                        <td className={readOnly?'text ':""} colSpan="2" width={`${8/24*100}%`}>
                            {
                                !readOnly?
                                <Input 
                                    disabled={notAllowEdit}
                                    value={form.sf06}
                                    onChange={e=>this.handleFieldChangeV('data.form.sf06',e.target.value,false)}
                                />
                                :form.sf06 || ''
                            }
                        </td>
                        <td className="label light-right-border" colSpan="1" width={`${3/24*100}%`}>银行账号</td>
                        <td className={readOnly?'text ':""} colSpan="2" width={`${8/24*100}%`}>
                            {
                                !readOnly?
                                <Input 
                                    disabled={notAllowEdit}
                                    value={form.sf10}
                                    onChange={e=>this.handleFieldChangeV('data.form.sf10',e.target.value,false)}
                                />
                                :form.sf10
                            }
                        </td>
                    </tr>
                    <tr>
                        <td className="label bg" colSpan="2" width={`${4/24*100}%`}>备注</td>
                        <td className={readOnly?'text ':""} colSpan={ fplx==='xxfp'? "6" :"4"} width={`${14/24*100}%`}>
                            {
                                !readOnly?
                                <Input
                                    disabled={notAllowEdit}
                                    value={form.bz}
                                    onChange={e=>this.handleFieldChangeV('data.form.bz',e.target.value,false)}
                                />
                                :form.bz || ''
                            }
                        </td>
                        {
                            fplx !=='xxfp'? <td className="label bg" colSpan="1" width={`${3/24*100}%`}>即征即退标识</td>:null
                        }
                        {
                            fplx !=='xxfp'?  <td className={readOnly?'text':''} colSpan="1" width={`${5/24*100}%`} align="center" disabled>
                                {
                                    !readOnly?
                                        <Radio.Group
                                            value={form.jzjtbz}
                                            disabled
                                            onChange={e=>this.handleFieldChangeV('data.form.jzjtbz',e.target.value,false)}
                                        >
                                            <Radio value="N">否</Radio>
                                            <Radio value="Y">是</Radio>
                                        </Radio.Group>
                                        :form.jzjtbz=='N'?'否':form.jzjtbz=='Y'?'是':''
                                }
                            </td>:null
                        }
                    </tr>
                    {
                        fplx==='xxfp'?
                        <tr>
                            <td className={!readOnly?"label bg ant-form-item-required":'label bg'} colSpan="2" width={`${4/24*100}%`}>计税方式</td>
                            <td className={error.jsfsDm?'-sales-error':readOnly?'text':''} colSpan="1" width={`${5/24*100}%`}>
                                {
                                    !readOnly?
                                    <Tooltip
                                        getPopupContainer={this.handleGetPopupContainer}
                                        overlayClassName='-sales-error-toolTip'
                                        title={error.jsfsDm}
                                        visible={error.jsfsDm && error.jsfsDm.indexOf("不能为空")==-1}
                                        placement='left'
                                    >
                                        <Select
                                            getPopupContainer={trigger => trigger.parentNode}
                                            style={{ width: '100%' }}
                                            onChange={v=>this.jsfsDmChange(v)}
                                            value={jsfsList.find(f=>f.jsfsDm===form.jsfsDm)?form.jsfsDm:undefined}
                                            align="right"
                                        >
                                            {
                                                jsfsList.map(item => (
                                                    <Select.Option key={item.jsfsDm} value={item.jsfsDm}>{item.jsfsMc}</Select.Option>
                                                ))
                                            }
                                        </Select>
                                    </Tooltip>
                                    :form.jsfsDm
                                }
                            </td>
                            <td className="label bg" colSpan="1" width={`${3/24*100}%`}>作废标识</td>
                            <td className={readOnly?'text':''} colSpan="2" width={`${4/24*100}%`} align="center">
                                {
                                    !readOnly?
                                    <Radio.Group
                                        value={form.fpztDm}
                                        onChange={e=>this.handleFieldChangeV('data.form.fpztDm',e.target.value,false)}
                                    >
                                        <Radio value="1">否</Radio>
                                        <Radio value="2">是</Radio>
                                    </Radio.Group>
                                    :form.fpztDm=='1'?'否':form.fpztDm=='2'?'是':''
                                }
                            </td>
                            <td className="label bg" colSpan="1" width={`${3/24*100}%`}>即征即退标识</td>
                            <td className={readOnly?'text':''} colSpan="1" width={`${5/24*100}%`} align="center" disabled>
                                {
                                    !readOnly?
                                    <Radio.Group
                                        value={form.jzjtbz}
                                        disabled
                                        onChange={e=>this.handleFieldChangeV('data.form.jzjtbz',e.target.value,false)}
                                    >
                                        <Radio value="N">否</Radio>
                                        <Radio value="Y">是</Radio>
                                    </Radio.Group>
                                    :form.jzjtbz=='N'?'否':form.jzjtbz=='Y'?'是':''
                                }
                            </td>
                        </tr>
                        :null
                    }
                </table>
                <div className='kpr'>
                    <span className='kpr-txt'>开票人：</span>
                    {
                        !readOnly?
                        <Input 
                            className='kpr-input'
                            value={form.kpr}
                            onChange={e=>sf('data.form.kpr',e.target.value)}
                        />
                        :form.kpr || ''
                    }
                    
                </div>
            </Spin>
        );
    }
}
// export default Form.create({ name: 'inv_used_car_sale_form' })(UsedCarSaleForm);