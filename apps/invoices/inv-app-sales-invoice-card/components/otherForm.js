import React from 'react'
import { Form, Row, Col, Spin, Tooltip } from 'antd';
import moment from 'moment';
import { Input, Icon, DatePicker } from 'edf-component';
import { number } from 'edf-utils'
import { Map, fromJS } from 'immutable'
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import InvTable from '../../component/invTable'
import NumericInput from '../../component/NumericInput'
// import TableDecorator from '../../utils/tableDecorator'
//数量格式化
const numberFormat = (v, decimals, isFocus, clearZero) => {
    if (isFocus === true || isNaN(Number(v))) return v
    let val = number.format(v, decimals);
    //去除小数点后面的0
    if (!isFocus && clearZero === true && typeof val === 'string') {
        let [a, b] = val.split('.');
        return b && Number(b) ? `${a}.${Number(`0.${b}`).toString().slice(2)}` : a
    }
    return val;
}
const quantityFormat = (quantity, decimals, isFocus, clearZero, autoDecimals) => {
    if (quantity !== undefined) {
        if (autoDecimals && quantity) {
            let [a, b] = String(quantity).split('.');
            decimals = Math.max(decimals, b !== undefined && b.length || 0)
        }
        return numberFormat(quantity, decimals, isFocus, clearZero)
    }
}

export default class OtherForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            cellIsFocus: false,
        };
        this.count = 5;
        // this.tableDecoratorOption = {
        //     keyDownClass: '.inv-card-mx-table',
        // }
    }
    componentDidMount() {
        // 重写方法后，要添加如下2行语句，以便基类上的方法能执行
        // const decorator = new TableDecorator(this);
        // decorator.componentDidMount && decorator.componentDidMount()

        // console.log('reWriter')
    };


    getColumns = () => {
        return [{
            title: '序号',
            dataIndex: 'index',
            width: `${1/24*100}%`,
            render: (text, row, index) => {
                if (this.props.readOnly || this.notAllowEdit())
                    return <div className='inv-table-addDelRow-cell'>{index + 1}</div>
                return (
                    <div className='inv-table-addDelRow-cell'>
                        <Icon title="増行" type="plus-circle-o" className='inv-table-add-row' onClick={() => this.onAddrow ? this.onAddrow(index) : undefined} /> 
                        <span className="text">{index+1}</span>
                        <Icon title="删行" type="minus-circle-o" className='inv-table-del-row' onClick={() => this.onDelrow ? this.onDelrow(index) : undefined} /> 
                    </div>
                )
            }
        }, {
            title: <div className={(this.props.readOnly || this.notAllowEdit()) ?'':'ant-form-item-required'}>货物或应税劳务、服务名称</div>,
            dataIndex: 'hwmc',
            width: `${12/24*100}%`,
            render: (text, row, index) => {
                return <EditableCell
                    key={`EditableCell-hwmc-${index}`}
                    value={text}
                    record={row}
                    dataIndex='hwmc'
                    rowIndex={index}
                    notAllowEdit={this.notAllowEdit()}
                    // handleSave={row => this.onCellChange(row)}
                    metaAction={this.props.metaAction}
                />
            },
        }, {
            title: <div className={(this.props.readOnly || this.notAllowEdit()) ?'':'ant-form-item-required'}>价税合计金额</div>,
            dataIndex: 'je',
            width: `${11/24*100}%`,
            render: (text, row, index) => {
                return <EditableCell
                    key={`EditableCell-je-${index}`}
                    value={text}
                    record={row}
                    dataIndex='je'
                    rowIndex={index}
                    notAllowEdit={this.notAllowEdit()}
                    // handleSave={row => this.onCellChange(row)}
                    metaAction={this.props.metaAction}
                />
            },
        }];
    }
    onAddrow = (index) => {
        if (this.notAllowEdit()) {
            return;
        }
        this.count++;
        index++;
        let mxDetailList = this.props.metaAction.gf('data.form.mxDetailList').toJS(),
            error = this.props.metaAction.gf('data.error.mxDetailList').toJS();
        mxDetailList.splice(index, 0, { mxxh: this.count })
        error.splice(index, 0, { mxxh: this.count })
        this.props.metaAction.sfs({
            'data.form.mxDetailList': fromJS(mxDetailList),
            'data.error.mxDetailList': fromJS(error),
        })
    }
    onDelrow = (index) => {
        if (this.notAllowEdit()) {
            return;
        }
        let mxDetailList = this.props.metaAction.gf('data.form.mxDetailList').toJS(),
            error = this.props.metaAction.gf('data.error.mxDetailList').toJS()
        this.count++;
        if (mxDetailList[index]) {
            mxDetailList.splice(index, 1)
            error.splice(index, 1)
            if (mxDetailList.length < 5) {
                mxDetailList.push({ mxxh: this.count })
                error.push({ mxxh: this.count })
            }
        }
        this.props.metaAction.sfs({
            'data.form.mxDetailList': fromJS(mxDetailList),
            'data.error.mxDetailList': fromJS(error),
        })
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
        return document.querySelector(".ant-modal")
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
    sumCol = (field, setValPath) => {
        let metaAction = this.props.metaAction,
            mxDetailList = metaAction.gf('data.form.mxDetailList') && metaAction.gf('data.form.mxDetailList').toJS() || [],
            list = mxDetailList.filter(f => f[field] !== undefined && f[field] !== null).map(item => Number(item[field])),
            total = list[0] ? list.reduce((a, b) => a + b) : 0,
            result = total && parseFloat(total).toFixed(2) || undefined;
        if (setValPath) {
            metaAction.sf(`data.form.${setValPath}`, result)
        }
        return result
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
            notAllowEdit = this.notAllowEdit(), { cellIsFocus } = this.state,
            mxDetailList = metaAction.gf('data.form.mxDetailList') ? metaAction.gf('data.form.mxDetailList').toJS() : [{}, {}, {}, {}, {}];
        // console.log('Received', this.props.action)
        if (mxDetailList.length > this.count) {
            this.count = mxDetailList.length + 1;
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
                        <Col span="10" >发票代码：</Col>
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
                                        maxLength={50}
                                        value={form.fpdm}
                                        disabled={notAllowEdit}
                                        onChange={e=>{this.handleFieldChangeV('data.form.fpdm',e.target.value,true);}}
                                    />
                                </Tooltip>
                                :form.fpdm || ''
                            }
                        </Col>
                        <Col span="10" >发票号码：</Col>
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
                                        maxLength={50}
                                        value={form.fphm}
                                        disabled={notAllowEdit}
                                        onChange={e=>{this.handleFieldChangeV('data.form.fphm',e.target.value,true)}}
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
                                        style={{width:'100%'}}
                                        value={form.kprq && moment(form.kprq,'YYYY-MM-DD')|| undefined}
                                        disabled={notAllowEdit}
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
                    <tr>
                        <td className="v-rl" colSpan="1" rowSpan="3" width={`${1/24*100}%`}>购买方</td>
                        <td className='label light-bottom-border light-right-border' colSpan="1" width={`${3/24*100}%`}>名称</td>
                        <td className='text light-bottom-border' colSpan="2" width={`${8/24*100}%`} disabled >
                            {
                                form.gfmc || ''
                            }
                        </td>
                        <td className="v-rl" colSpan="1" rowSpan="3" width={`${1/24*100}%`}>销售方</td>
                        <td className='label light-bottom-border light-right-border' colSpan="1" width={`${3/24*100}%`}>名称</td>
                        <td className={readOnly?'text light-bottom-border':'light-bottom-border'} colSpan="2" width={`${8/24*100}%`}>
                            {
                                !readOnly?
                                <Input 
                                    disabled={notAllowEdit}
                                    value={form.xfmc}
                                    onChange={e=>this.handleFieldChangeV('data.form.xfmc',e.target.value,true)}
                                />
                                :form.xfmc || ''
                            }
                        </td>
                    </tr>
                    <tr>
                        <td className='label light-bottom-border light-right-border' colSpan="1" width={`${3/24*100}%`}>纳税人识别号</td>
                        <td className='text light-bottom-border' colSpan="2" width={`${8/24*100}%`} disabled>
                            {
                                form.gfsbh || ''
                            }
                        </td>
                        <td className='label light-bottom-border light-right-border' colSpan="1" width={`${3/24*100}%`}>纳税人识别号</td>
                        <td className={readOnly?'text light-bottom-border':'light-bottom-border'} colSpan="2" width={`${8/24*100}%`}>
                            {
                                !readOnly?
                                <Input 
                                    disabled={notAllowEdit}
                                    value={form.xfsbh}
                                    onChange={e=>this.handleFieldChangeV('data.form.xfsbh',e.target.value,true)}
                                />
                                :form.xfsbh || ''
                            }
                        </td>
                    </tr>
                    <tr>
                        <td className="label light-right-border" colSpan="1" width={`${3/24*100}%`}>地址、电话</td>
                        <td className='text' colSpan="2" width={`${8/24*100}%`} disabled>
                            {
                                form.gfdzdh || ''
                            }
                        </td>
                        <td className="label light-right-border" colSpan="1" width={`${3/24*100}%`}>地址、电话</td>
                        <td className={readOnly?'text':''} colSpan="2" width={`${8/24*100}%`}>
                            {
                                !readOnly?
                                <Input 
                                    disabled={notAllowEdit}
                                    value={form.xfdzdh}
                                    onChange={e=>this.handleFieldChangeV('data.form.xfdzdh',e.target.value,false)}
                                />
                                :form.xfdzdh || ''
                            }
                        </td>
                    </tr>
                </table>
                <InvTable
                    className='inv-card-mx-table'
                    bordered 
                    dataSource={mxDetailList}
                    columns={this.getColumns()} 
                    pagination={false}
                    // allowColResize
                    rowKey='mxxh'
                    // onResizeEnd={}
                />
                <table className="inv-card-table">    
                    <tr className="border-top-none">
                        <td className='label bg' colSpan="2" width={`${4/24*100}%`}>金额合计(大写)</td>
                        <td className='text' colSpan="2" width={`${9/24*100}%`} disabled>
                            {this.smallToBig(form.hjje)}
                        </td>
                        <td className="label bg" colSpan="2" width={`${3/24*100}%`}>金额合计(小写)</td>
                        <td className="text" colSpan="2" width={`${8/24*100}%`} align="right"
                            disabled={notAllowEdit}
                        >
                            {quantityFormat(form.fplyLx==2?this.sumCol('je','hjje'):form.hjje,2,false,false,true)}
                        </td>
                    </tr>
                    <tr>
                        <td className="label bg" colSpan="2" width={`${4/24*100}%`}>备注</td>
                        <td className={readOnly?'text ':""} colSpan="6" width={`${20/24*100}%`}>
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
                    </tr>
                </table>
                <div className='kpr'>
                    <span className='kpr-txt'>开票人：</span>
                    {
                        !readOnly?
                        <Input 
                            className='kpr-input'
                            value={form.kpr}
                            disabled={notAllowEdit}
                            onChange={e=>sf('data.form.kpr',e.target.value)}
                        />
                        :form.kpr || ''
                    }
                    
                </div>
            </Spin>
        );
    }
}
// 单元格首个标签样式必须有editable-cell，否则keydown事件不无效
class EditableCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            editable: false,
            cacheData: props.record || {},
        }
    }
    handleChange = (value) => {
        const { dataIndex } = this.props
        const { cacheData } = this.state;
        if (dataIndex === 'je') {
            cacheData[dataIndex] = Number(value) ? Number(value).toFixed(2) : value;
        } else {
            cacheData[dataIndex] = value
        }
        this.setState({ cacheData });
        // handleSave && handleSave(cacheData);
    }
    handleSave = (row) => {
        const { dataIndex, metaAction, rowIndex } = this.props,
            mxDetailList = metaAction.gf('data.form.mxDetailList').toJS(),
            error = metaAction.gf('data.error.mxDetailList').toJS(),
            rowItem = rowIndex > -1 && mxDetailList[rowIndex] || {};
        // let hjje = metaAction.gf('data.form.hjje');
        mxDetailList.splice(rowIndex, 1, { ...rowItem, ...row, mxxh: row.mxxh > -1 && row.mxxh || rowIndex, key: rowIndex });
        if (error[rowIndex]) error[rowIndex][dataIndex] = '';

        metaAction.sfs({
            'data.form.mxDetailList': fromJS(mxDetailList),
            'data.error.mxDetailList': fromJS(error),
            // 'data.form.hjje': hjje,
        })
    }
    save = () => {
        // const { handleSave } = this.props;
        const { cacheData } = this.state;
        this.toggleEdit();
        this.handleSave(cacheData);
    }
    toggleEdit = () => {
        const editable = !this.state.editable;
        this.setState({ editable }, () => {
            if (editable) {
                if (this.props.dataIndex === 'hwmc' || this.props.dataIndex === 'je') {
                    // console.log('Received', this.myRef)
                    try {
                        this.myRef._reactInternalFiber.firstEffect.stateNode.click && this.myRef._reactInternalFiber.firstEffect.stateNode.click();
                        this.myRef._reactInternalFiber.firstEffect.stateNode.select && this.myRef._reactInternalFiber.firstEffect.stateNode.select();
                    } catch (err) {}
                } else {
                    this.myRef && this.myRef.focus && this.myRef.focus();
                }
            }
        });
    }

    render() {
        const { value, record, rowIndex, dataIndex, metaAction, notAllowEdit } = this.props;
        const { editable } = this.state;
        const error = metaAction.gf('data.error.mxDetailList') && metaAction.gf('data.error.mxDetailList').toJS() || [];

        switch (dataIndex) {
            case 'hwmc':
                if (notAllowEdit) {
                    return <div style={{display:'block'}} disabled className="editable-cell text" title={value} >{value}</div>
                }
                return (
                    <div className = "editable-cell"> 
                    {
                        editable ?
                        <div className="editable-cell-input-wrap">
                            <Input
                                key={`input-c-${rowIndex}-${dataIndex}`}
                                ref={node => (this.myRef = node)}
                                value={value}
                                onBlur={this.save}
                                disabled={notAllowEdit}
                                onChange={e => this.handleChange(e.target.value)}
                            />
                        </div> :
                        <div title={value} className={error[rowIndex] && error[rowIndex].hwmc?"editable-cell-value-wrap -sales-error":"editable-cell-value-wrap "} onClick={this.toggleEdit.bind(this)}>
                            {value}
                        </div>
                    } 
                    </div>
                );
            case 'je':
                if (notAllowEdit) {
                    return <div align="right" style={{display:'block'}} disabled className="editable-cell text" title={value}>{quantityFormat(value,2,false,false,true)}</div>
                }
                return (
                    <div className="editable-cell">
                    {
                        editable ?
                        <div className="editable-cell-input-wrap">
                            <NumericInput
                                key={`input-c-${rowIndex}-${dataIndex}`}
                                ref={node => (this.myRef = node)}
                                value={value}
                                onBlur={this.save}
                                disabled={notAllowEdit}
                                onChange={v => this.handleChange(v)}
                            />
                        </div>
                        :
                        <div align="right" title={value} className={error[rowIndex] && error[rowIndex].je?"editable-cell-value-wrap -sales-error":"editable-cell-value-wrap"} onClick={this.toggleEdit.bind(this)}>
                            {quantityFormat(value,2,false,false,true)}
                        </div>
                    }
                    </div>
                );
        }
    }
}
// export default Form.create({ name: 'inv_other_form' })(OtherForm);