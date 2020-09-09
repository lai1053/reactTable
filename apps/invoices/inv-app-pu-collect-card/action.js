import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import { Modal } from 'antd'
import { Icon, Tooltip, Table, Button} from 'edf-component'
import moment from 'moment'
import CollectResultList from '../commonComponent/CollectResultList'
/*采集状态*/
const PICKINGSTATUS = {
    0: 'check-circle',  //采集成功
    1: 'exclamation-circle',  //采集失败
    2: 'clock-circle'  // 采集中
}
const INVOICETYPE = {
    "01": '增值税专用发票',
    "03": '机动车销售发票',
    "04": '增值税普通发票',
    "07": '二手车销售发票',
    "12": '代扣代缴专用缴款书',
    "13": '海关专用缴款书',
    "14": '农产品销售（收购）发票',
    "17": '通行费增值税电子普通发票',
    "18": '旅客运输服务抵扣凭证',
    "99": '其他票据',
}
const LIMITS = ['01', '03', '13', '17']
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = async ({ component, injections }) => {
        this.component = component
        this.injections = injections
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.handelSubmit)
        }
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(() => {
                component.props.callback && component.props.callback()
                return true
            })
        }
        injections.reduce('init')
        this.currentOrg = this.metaAction.context.get('currentOrg') || {}
        if (this.component.props.fromModule === 'InvoiceAuthentication') {
            const billDate = this.currentOrg.systemDate || moment().format('YYYY-MM-DD').slice(0, 7)
            injections.reduce('setState', 'data.bill_date', billDate)
            injections.reduce('setState', 'data.bill_date2', billDate)
        } else {
            const billDate = this.component.props.nsqj.slice(0, 4).concat('-').concat(this.component.props.nsqj.slice(4))
            injections.reduce('setState', 'data.bill_date', billDate)
            injections.reduce('setState', 'data.bill_date2', billDate)
        }
        const { nsqxTips, nsqxdm } = await this.batchQueryZzsNsqxdm()
        injections.reduce('setState', 'data.invoice_nsqxTips', nsqxTips)
        this.nsqxdm = nsqxdm
    }

    // 获取纳税期限代码
    batchQueryZzsNsqxdm = async () => {
        const platFormReq = this.webapi.invoices.queryInvoicePlatform({})
        const currentOrg = this.metaAction.context.get('currentOrg') || {}
        const nsrxz = this.currentOrg.swVatTaxpayer == 2000010002 ? 'XGMZZS' : 'YBNSRZZS' // 2000010001一般企业 2000010002 小规模企业
        this.metaAction.sf('data.nsrxz', nsrxz)
        const params = {
            "skssq": `${this.metaAction.gf('data.bill_date')}-01`,
            "qyxxList": [{ "qyId": currentOrg.id }]
        }
        let nsqxUnit = '月',
            nsqxdm = '06',
            nsqxTips = '读取所选月份确认发票和开具发票'
        
        if (nsrxz === 'XGMZZS') {
            const resp = await this.webapi.invoices.batchQueryZzsNsqxdm(params)
            nsqxdm = resp && resp.length !== 0 ? resp[0].nsqxdm : '06'
            nsqxUnit = nsqxdm === '06' ? '月' : '季度'
            nsqxTips = <div>
                <div>读取所选月份开具或票税宝上传的发票。</div>
                {/*<div>“月报”客户将读取本月开具、本月上传的发票。</div>*/}
            </div>

        }else if(nsrxz === 'YBNSRZZS'){
            nsqxTips = <ul>
                <li>读取所选月份确认发票和开具发票</li>
                <li>读取所选月份开具或票税宝上传的发票。</li>
            </ul>
        }

        let platForm = await platFormReq
        let invoicePlatForm = platForm.codeType  // codeType -- 0：非网报区，显示平台采集按钮；1：网报区，不显示平台采集按钮
        // console.log(invoicePlatForm, 'MMKKK')
        if(invoicePlatForm===0){
            nsqxTips = <ul className="ul-tips">
                <li>1、本途径，是获取金财代账云端数据，包含：</li>
                <li>【发票管理工具、票税宝、平台采集】已上传的发票；</li>
                <li>2、读取的是所选月份开具和认证的发票，以及票税宝所选月份上传的发票</li>
            </ul>
        }
        this.metaAction.sf('data.invoicePlatform', invoicePlatForm)
        return { nsqxdm, nsqxTips }
    }
    /*
    * 20200225
    * 关闭连接超时提示 重新修改逻辑
    * */
    resTimeoutFun = (time) => {
        this.timer && clearTimeout(this.timer)
        // 连接超时提示
        this.timer = setTimeout(async () => {
            this.runFun = true
            if (!this.response) {
                let resp = await this.metaAction.modal('info', {
                    className: 'inv-batch-custom-info-modal',
                    okText: '确定',
                    content: <p>后台努力采集中，请稍后查看</p>
                })
                this.runFun = false
                this.stopAwait = !!resp
                resp && this.component.props.closeModal && this.component.props.closeModal({ listNeedLoad: true })
            }
            this.runFun = false
        }, time)
    }
    handelSubmit = async () => {
        this.injections.reduce('setState', 'data.loading', true)
        const currentOrg = this.metaAction.context.get('currentOrg') || {},
            currentUser = this.metaAction.context.get('currentUser') || {},
            nsrxz = this.currentOrg.swVatTaxpayer == 2000010002 ? 'XGMZZS' : 'YBNSRZZS', // 2000010001一般企业 2000010002 小规模企业
            billDate = this.metaAction.gf('data.bill_date').replace(/-/g, ''),
            billDate2 = this.metaAction.gf('data.bill_date2').replace(/-/g, '')
        let dateArr = this.getAll(billDate, billDate2)
        let allArr = []
        dateArr.forEach((i) => {
            let k = {}
            k.yhId = currentUser.id
            k.qyId = currentOrg.id
            k.fplx = "1"
            k.skssq = i + ''
            k.nsrxz = nsrxz
            k.nsrsbh = currentOrg.vatTaxpayerNum || '914401010506412529'
            k.cjfs = "dhcj"
            k.nsqxdm = this.nsqxdm
            allArr.push({ ...k })
        })
        let requestOption = {
            "yhId": currentUser.id,
            "fplx": '1',
            "cjfs": "dhcj",
            "qyId": currentOrg.id,
            "skssq": billDate, //必传
            "nsrxz": nsrxz,
            "nsrsbh": currentOrg.vatTaxpayerNum,
            "nsqxdm": this.nsqxdm, //--纳税期限代码，必传：06月报；08季报；
            "dataList": allArr
        }
        this.response = null
        this.stopAwait = false
        this.runFun = false
        this.resTimeoutFun(30 * 1000)
        this.response = await this.webapi.invoices.fpxxCollection(requestOption)
        this.injections.reduce('setState', 'data.loading', false)
        if (this.runFun || this.stopAwait) {
            return false
        }
        if (this.response) {
            if (this.response.sysNetException) {
                Modal.error({
                    title: '采集进项发票失败：',
                    content: this.response.error && this.response.error.message || '',
                    okText: '确认',
                })
                return false
            }
            const modalOption = {
                okText: '确认',
            }
            // 采集失败
            if (this.response.sfcjcg == false) {
                Modal.error({
                    title: '采集进项发票失败，失败原因：',
                    content: this.response.dataList[0].msg,
                    okText: modalOption.okText
                })
                return false
            }
            // 采集中
            if (this.response.sfcjcg === true && this.response.sfcjz === false) {
                Modal.info({
                    title: '发票采集中',
                    content: '系统正在发票采集中，请稍后刷新列表',
                    okText: modalOption.okText
                })
                return false
            }

            /*
            * 20200225新增条件
            * sfcjcg 是否采集成功
            * sfcjz 是否采集中
            * */
            // 采集成功
            if (
                this.response.orgDataList.length > 0 && 
                this.response.orgDataList[0].orgDataList.length && 
                this.response.sfcjcg === true && 
                this.response.sfcjz === true
            ) {
                modalOption.title = `进项发票一键读取完成，结果如下：`
                let columns = [{
                    title: '发票种类',
                    dataIndex: 'fpzlmc',
                    key: 'fpzlmc',
                    width: 130,
                    align: 'center'
                }]

                let dataList = [], totalItem={'fpzlmc': '合计'}, otherItem = {'fpzlmc': '其他（作废、异常、失控）'}

                columns = columns.concat(this.response.orgDataList.map((e => {
                    // let monthStr = e.skssq + ''
                    let formatMonth = `${e.skssq.substr(0, 4)}-${e.skssq.substr(4)}`

                    let columnObj = {
                        title: !e.sfcjcg || !e.sfcjz ? (<div>{formatMonth}</div>) : <div>{formatMonth}</div>,
                        // dataIndex: e.skssq,
                        key: e.skssq,
                        children: [{
                            title: '已认证',
                            dataIndex: `${e.skssq}fpzs_yrz`,
                            width: 60,
                            align: 'center',
                            render: (text, record)=>{
                                const hasYRZ = LIMITS.includes(record[`${e.skssq}fpzldm`])  // 该票种是否区分已认证和未认证
                                let cell=''
                                if(record['fpzlmc']==='合计'){
                                    const status = this.checkPickingStatus(record[`${e.skssq}sfcjcg`], record[`${e.skssq}sfcjz`])
                                    let cell = ''
                                    if(status===0){  // 采集成功的
                                        cell= hasYRZ ? text : ''
    
                                    }else{  // 采集失败或采集中的
                                        const tipText = status !== 1 ? '发票采集中，请稍后查看结果！' : record[`${e.skssq}msg`]
                                        const content = status !== 1 ? '采集中' : '采集失败'
                                        cell = <div className='colspan-td'>
                                            <Tooltip
                                                arrowPointAtCenter={true}
                                                placement='top'
                                                overlayClassName={status !== 1 ? 'inv-tool-tip-normal' : 'inv-tool-tip-warning'}
                                                title={tipText}>
                                                    <Icon type={PICKINGSTATUS[status]} className={PICKINGSTATUS[status]} />
                                                    <span className={PICKINGSTATUS[status]}>{content}</span>
                                            </Tooltip> 
                                        </div>
                                    }
                                    return cell

                                }else if(record['fpzlmc']==='其他（作废、异常、失控）'){
                                    cell = <div className='colspan-td'>
                                            {Number(record['otherTotal']) ? record['otherTotal'] : '' }
                                        </div>
                                }else{
                                    cell = (nsrxz === 'YBNSRZZS' && hasYRZ ) ? ( Number(text) ? text : '' ) : ''
                                }

                                return cell
                            }
                        },{
                            title: '未认证',
                            dataIndex: `${e.skssq}fpzs_wrz`,
                            width: 60,
                            align: 'center',
                        }]
                    }

                    let otherTotal=0,   // 其他票种合计
                        yrzTotal=0,     // 已认证合计
                        wrzTotal=0      // 未认证合计
                    otherTotal = e.orgDataList.reduce((totalNum, item)=>{
                        totalNum = totalNum + (Number(item['fpzs_fpzs_glzt_yctotal']) || 0) + (Number(item['fpzs_sk']) || 0) +  (Number(item['fpzs_zf']) || 0)
                        yrzTotal= yrzTotal + (Number(item['fpzs_yrz']) || 0),     // 已认证合计
                        wrzTotal= wrzTotal + (Number(item['fpzs_wrz']) || 0)      // 未认证合计
                        return totalNum
                    }, 0)

                    e.orgDataList.forEach((de, index) => {
                        de[`${de.skssq}fpzs_glzt_yc`] = de.fpzs_glzt_yc  // 状态管理异常
                        de[`${de.skssq}fpzs_sk`] = de.fpzs_sk   // 失控
                        de[`${de.skssq}fpzs_total`] = de.fpzs_total   // 统计采集月份总数（）
                        de[`${de.skssq}fpzs_wrz`] = de.fpzs_wrz // 进项未认证
                        de[`${de.skssq}fpzs_xx`] = de.fpzs_xx   //  销项
                        de[`${de.skssq}fpzs_yrz`] = de.fpzs_yrz // 进项已认证
                        de[`${de.skssq}fpzs_zf`] = de.fpzs_zf   // 作废
                        de[`${de.skssq}fpzldm`] = de.fpzldm   // 发票种类代码
                        // 合计行
                        totalItem[`${e.skssq}fpzs_yrz`]= yrzTotal
                        totalItem[`${e.skssq}fpzs_wrz`]= wrzTotal
                        totalItem[`${de.skssq}sfcjcg`]= de.sfcjcg
                        totalItem[`${de.skssq}sfcjz`]= de.sfcjz
                        totalItem[`${de.skssq}msg`]= de.msg
                        // 其他票种合计
                        otherItem[`${de.skssq}fpzs_yrz`] = ''
                        otherItem[`${de.skssq}fpzs_wrz`] = ''
                        otherItem[`${de.skssq}otherTotal`] = otherTotal
                        delete de.fpzs_wrz
                        delete de.fpzs_yrz
                    })

                    dataList = dataList.concat(e.orgDataList)
                    return columnObj
                })))

                dataList = this.formatData(dataList)
                dataList = dataList.concat([totalItem])
                dataList = dataList.length>1 ? dataList.concat([otherItem]) : dataList

                const invoicePlatForm = this.metaAction.gf('data.invoicePlatForm')
                this.metaAction.modal('show',{
                    className: 'inv-batch-custom-info-modal',
                    title: '结果',
                    footer: null,
                    width: 700,
                    closeModal: this.closeBom,
                    wrapClassName: 'salesAndPurchase-success-tips-modal',   // 必传，控制样式
                    closeBack: (back) => { this.closeTip = back },
                    children:<CollectResultList
                        props={this.component.props.store}
                        resultTitle='进项发票一键读取完成，结果如下'
                        unit= '张'
                        columns={columns} 
                        tableData={dataList} 
                        softTips={[
                            '1、采集成功，直接展示数据，请到相应发票属期查看发票；',
                            '2、其余情况，将在对应月份展示出来，请移至文字上方查看具体提示信息。'
                        ]} 
                        hasPlatFormCollect={invoicePlatForm}
                        platFormClick={this.toPlatForm}
                        closePageFn={this.closeBom}
                    ></CollectResultList>
                })
                return { listNeedLoad: true }
            } else {
                return false
            }
            return true;
        }
    }

    closeBom=()=>{
        this.closeTip()
    }

    // 发票采集是否成功
    checkPickingStatus=(sfcjcg, sfcjz)=>{
        // 1、sfcjcg = false 认为采集失败 
        // 2、sfcjcg = true && sfcjz = false 认为采集中 
        // 3、sfcjcg = true && sfcjz = true 认为采集成功
        // PICKINGSTATUS
        let statusCode = (sfcjcg===false) ? 1 : (sfcjz===false) ? 2 : 0
        return statusCode
    }


    formatData(d) {
        let newData = []
        function mergaData(data) {
            if (data.length) {
                for (let i = 0; i < data.length; i++) {
                    let dItem = newData.find(f => f.fpzlmc === data[i].fpzlmc)
                    if (dItem) {
                        dItem = Object.assign(dItem, data[i])
                        data.splice(i, 1)
                        mergaData(data)
                    } else {
                        newData.push(data[i])
                        data.splice(i, 1)
                        mergaData(data)
                    }
                }
            } else {
                dataFilter(newData)
                return
            }
        }
        mergaData(d)

        function dataFilter(data) {
            if (data.length) {
                for (let i = 0; i < data.length; i++) {
                    let keys = []
                    Object.keys(data[i]).forEach(e => {
                        if (e.indexOf('fpzs_yrz') > -1 || e.indexOf('fpzs_wrz') > -1) {
                            keys.push(e)
                        }
                    })
                    if (!keys.some(s => data[i][s])) {
                        data.splice(i, 1)
                        dataFilter(data)
                    }
                }
            } else {
                return
            }
        }
        return newData
    }
    componentWillUnmount = () => {
        clearTimeout(this.timer)
    }
    btnClick = () => { }
    loadInvoiceTimeChange = (e) => {
        let date2 = this.metaAction.gf('data.bill_date2')
        let a = e.format("YYYYMM") * 1
        let b = moment(date2).format('YYYYMM') * 1
        if (b - a > 2 || a > b) {
            this.metaAction.sf('data.bill_date2', e.format("YYYY-MM"))
        }
        this.metaAction.sf('data.bill_date', e.format("YYYY-MM"))
    }
    loadInvoiceTimeChange2 = (e) => {
        this.metaAction.sf('data.bill_date2', e.format("YYYY-MM"))
    }
    getAll = (begin, end) => {
        if (!begin || !end) {
            return false;
        } else {
            const date1 = moment(this.metaAction.gf("data.bill_date"))
            const date2 = moment(this.metaAction.gf("data.bill_date2"))
            let z = moment(date2).subtract(1, "months")
            z = z.format("YYYYMM") * 1
            let arr = [];
            begin = date1.format("YYYYMM") * 1
            end = date2.format("YYYYMM") * 1
            if (begin < end && z !== begin) {
                arr.push(begin, z, end)
            } else if (begin < end && z == begin) {
                arr.push(begin, end)
            } else if (begin = z) {
                arr.push(end)
            }
            return arr
        }
    }
    disabledDate = (time) => {
        const date = moment(this.metaAction.gf("data.bill_date"))
        const minus = date.clone().add(2, "months");
        return time.valueOf() < date.valueOf() || time.valueOf() > moment(minus).endOf('month')

    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}

// handelSubmit = async () => {
//     this.injections.reduce('setState', 'data.loading', true)
//     const currentOrg = this.metaAction.context.get('currentOrg') || {},
//         currentUser = this.metaAction.context.get('currentUser') || {},
//         nsrxz = this.currentOrg.swVatTaxpayer == 2000010002 ? 'XGMZZS' : 'YBNSRZZS', // 2000010001一般企业 2000010002 小规模企业
//         billDate = this.metaAction.gf('data.bill_date').replace(/-/g, ''),
//         billDate2 = this.metaAction.gf('data.bill_date2').replace(/-/g, '')
//     let dateArr = this.getAll(billDate, billDate2)
//     let allArr = []
//     dateArr.forEach((i) => {
//         let k = {}
//         k.yhId = currentUser.id
//         k.qyId = currentOrg.id
//         k.fplx = "1"
//         k.skssq = i + ''
//         k.nsrxz = nsrxz
//         k.nsrsbh = currentOrg.vatTaxpayerNum || '914401010506412529'
//         k.cjfs = "dhcj"
//         k.nsqxdm = this.nsqxdm
//         allArr.push({ ...k })
//     })
//     let requestOption = {
//         "yhId": currentUser.id,
//         "fplx": '1',
//         "cjfs": "dhcj",
//         "qyId": currentOrg.id,
//         "skssq": billDate, //必传
//         "nsrxz": nsrxz,
//         "nsrsbh": currentOrg.vatTaxpayerNum,
//         "nsqxdm": this.nsqxdm, //--纳税期限代码，必传：06月报；08季报；
//         "dataList": allArr
//     }
//     this.response = null
//     this.stopAwait = false
//     this.runFun = false
//     this.resTimeoutFun(30 * 1000)
//     this.response = await this.webapi.invoices.fpxxCollection(requestOption)
//     this.injections.reduce('setState', 'data.loading', false)
//     if (this.runFun || this.stopAwait) {
//         return false
//     }
//     if (this.response) {
//         if (this.response.sysNetException) {
//             Modal.error({
//                 title: '采集进项发票失败：',
//                 content: this.response.error && this.response.error.message || '',
//                 okText: '确认',
//             })
//             return false
//         }
//         const modalOption = {
//             okText: '确认',
//         }
//         // 采集失败
//         if (this.response.sfcjcg == false) {
//             Modal.error({
//                 title: '采集进项发票失败，失败原因：',
//                 content: this.response.dataList[0].msg,
//                 okText: modalOption.okText
//             })
//             return false
//         }
//         // 采集中
//         if (this.response.sfcjcg === true && this.response.sfcjz === false) {
//             Modal.info({
//                 title: '发票采集中',
//                 content: '系统正在发票采集中，请稍后刷新列表',
//                 okText: modalOption.okText
//             })
//             return false
//         }

//         /*
//         * 20200225新增条件
//         * sfcjcg 是否采集成功
//         * sfcjz 是否采集中
//         * */
//         // 采集成功
//         if (this.response.orgDataList.length > 0 && this.response.orgDataList[0].orgDataList.length && this.response.sfcjcg === true && this.response.sfcjz === true) {
//             modalOption.title = `进项发票一键读取完成，结果如下：`
//             let columns = [{
//                 title: '发票种类',
//                 dataIndex: 'fpzlmc',
//                 key: 'fpzlmc',
//                 width: 130,
//                 align: 'center'
//             }]

//             let dataList = []

//             columns = columns.concat(this.response.orgDataList.map((e => {
//                 let monthStr = e.skssq + ''
//                 let formatMonth = `${e.skssq.substr(0, 4)}-${e.skssq.substr(4)}`

//                 let columnObj = {
//                     title: !e.sfcjcg || !e.sfcjz ? (<div>{formatMonth}  <Tooltip title={e.msg}>
//                         <Icon type="exclamation-circle" theme="filled" style={{ color: 'red', fontSize: '16px' }} />
//                     </Tooltip></div>) : <div>{formatMonth}</div>,
//                     dataIndex: e.skssq,
//                     key: e.skssq,
//                     render: (text, record) => {
//                         //在单户中是否要显示采集发票种类统计条件：1、sfcjcg = false 认为采集失败 2、sfcjcg = true && sfcjz = false 认为采集中 3、sfcjcg = true && sfcjz = true 认为采集成功
//                         // if (!e.sfcjcg || !e.sfcjz) {
//                         //     return (<div></div>)
//                         // }
//                         if (record.fpzlmc === '其他') {
//                             return (<div>
//                                 {!!record.fpzs_zf && <div style={{ margin: '6px 0 3px' }} >作废：{record.fpzs_zf}</div>}
//                                 {!!record.fpzs_yc && <div style={{ margin: '3px 0' }}>异常：{record.fpzs_yc}</div>}
//                                 {!!record.fpzs_sk && <div style={{ margin: '3px 0 6px' }}>失控：{record.fpzs_sk}</div>}
//                             </div>)
//                         }
//                         return record.fpzlmc === '增值税普通发票' ? (
//                             <div>
//                                 {record[`${e.skssq}fpzs_wrz`]}
//                             </div>
//                         ) : (<div>
//                             <div style={{ margin: '6px 0 3px' }}>已认证：{record[`${e.skssq}fpzs_yrz`]}</div>
//                             <div style={{ margin: '3px 0 6px' }}>未认证：{record[`${e.skssq}fpzs_wrz`]}</div>
//                         </div>)
//                     }
//                 }

//                 e.orgDataList.forEach(de => {
//                     de[`${de.skssq}fpzs_glzt_yc`] = de.fpzs_glzt_yc
//                     de[`${de.skssq}fpzs_sk`] = de.fpzs_sk
//                     de[`${de.skssq}fpzs_total`] = de.fpzs_total
//                     de[`${de.skssq}fpzs_wrz`] = de.fpzs_wrz
//                     de[`${de.skssq}fpzs_xx`] = de.fpzs_xx
//                     de[`${de.skssq}fpzs_yrz`] = de.fpzs_yrz
//                     de[`${de.skssq}fpzs_zf`] = de.fpzs_zf
//                     delete de.fpzs_wrz
//                     delete de.fpzs_yrz
//                 })
//                 dataList = dataList.concat(e.orgDataList)
//                 return columnObj
//             })))

//             dataList = this.formatData(dataList)

//             if (this.response.orgDataList.fpzs_yc || this.response.orgDataList.fpzs_sk || this.response.orgDataList.fpzs_zf) {
//                 dataList.push({
//                     fpzlmc: '其他',
//                     fpzs_yc: this.response.orgDataList.fpzs_yc,
//                     fpzs_sk: this.response.orgDataList.fpzs_sk,
//                     fpzs_zf: this.response.orgDataList.fpzs_zf,
//                 })
//             }

//             //     this.response.dataList[0].dataList.forEach(item => {
//             //         if (!map[item.fpzldm]) {
//             //             dest.push(item)
//             //             map[item.fpzldm] = item
//             //         } else {
//             //             let index = dest.findIndex(f => f.fpzldm == item.fpzldm)
//             //             dest[index] = {
//             //                 "fpzldm": dest[index].fpzldm,
//             //                 "fpzlmc": dest[index].fpzlmc,
//             //                 "fpzs_yrz": dest[index].fpzs_yrz + item.fpzs_yrz,
//             //                 "fpzs_wrz": dest[index].fpzs_wrz + item.fpzs_wrz,
//             //                 "fpzs_total": dest[index].fpzs_total + item.fpzs_total,
//             //             }
//             //         }
//             //     })

//             //     let innerContent, otherContent
//             //     if (nsrxz === 'YBNSRZZS') {
//             //         innerContent = dest.map(item => {
//             //             if (item.fpzs_total > 0) {
//             //                 if (item.fpzldm === '01' || item.fpzldm === '03' || item.fpzldm === '17' || item.fpzldm === '18'|| item.fpzldm === '13') {
//             //                     return <div>{`${item.fpzlmc} ${item.fpzs_total} 张  （已认证 ${item.fpzs_yrz} 张，未认证 ${item.fpzs_wrz} 张）`}</div>
//             //                 } else {
//             //                     return <div>{`${item.fpzlmc} ${item.fpzs_total} 张`}</div>
//             //                 }
//             //             }
//             //         })
//             //     } else {
//             //         innerContent = dest.map(item => { if (item.fpzs_total > 0) { return <div>{`${item.fpzlmc} ${item.fpzs_total} 张`}</div> } })
//             //     }
//             //     if (this.response.dataList[0].fpzs_yc || this.response.dataList[0].fpzs_sk || this.response.dataList[0].fpzs_zf || this.response.dataList[0].fpzs_glzt_yc) {
//             //         otherContent = <div>
//             //             <div>另外：</div>
//             //             <div>
//             //               {this.response.dataList[0].fpzs_yc ? <div>发票状态-异常发票 {this.response.dataList[0].fpzs_yc} 张</div> : ''}
//             //               {this.response.dataList[0].fpzs_sk ? <div>发票状态-失控发票 {this.response.dataList[0].fpzs_sk} 张</div> : ''}
//             //               {this.response.dataList[0].fpzs_zf ? <div>发票状态-作废发票 {this.response.dataList[0].fpzs_zf} 张</div> : ''}
//             //               {this.response.dataList[0].fpzs_glzt_yc ? <div>管理状态-异常发票 {this.response.dataList[0].fpzs_glzt_yc}张</div> : ''}
//             //             </div>
//             //         </div>
//             //     }

//             // console.log('dataList', dataList);

//             modalOption.content = <div>
//                 <div style={{ marginBottom: '10px' }}>
//                     <div style={{ textAlign: 'right' }}>单位：张</div>
//                     <Table className="inv-app-custom-list-month-detail-table"
//                         columns={columns}
//                         dataSource={dataList}
//                         bordered
//                         pagination={false}
//                         style={{  maxHeight: '700px' }}>

//                     </Table>
//                 </div>
//                 <div style={{ fontSize: '12px', marginTop: '8px' }}>
//                     <span style={{ color: "#FAAD14" }}>温馨提示：</span>请到相应发票属期查看发票
//                 </div>
//             </div>

//             modalOption.width = 600
//             Modal.success({
//                 ...modalOption,
//                 // onOk: () => {
//                 //     if(this.component.props.callback&& Object.prototype.toString.call(this.component.props.callback)==='[object Function]'){
//                 //         setTimeout(() => {
//                 //             console.log(222)
//                 //             this.component.props.callback()
//                 //         },200)
//                 //     } 
//                 // }
//             })
//             return { listNeedLoad: true }
//         } else {
//             return false
//         }
//         return true;
//     }
// }