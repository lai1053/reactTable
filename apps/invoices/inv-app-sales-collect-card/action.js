import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import { Modal } from 'antd'
import { Icon, Tooltip, Table, Button } from 'edf-component'
import moment from 'moment'
import CollectResultList from '../commonComponent/CollectResultList'

/*采集状态*/
const PICKINGSTATUS = {
    0: 'check-circle',  //采集成功
    1: 'exclamation-circle',  //采集失败
    2: 'clock-circle'  // 采集中
}
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.handelSubmit)
        }
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(() => {
                return true
            })
        }
        // console.log(this.component.props)
        injections.reduce('init')
        this.batchQueryZzsNsqxdm()
    }
    // 获取纳税期限代码
    batchQueryZzsNsqxdm = async () => {
        const platFormReq = this.webapi.invoices.queryInvoicePlatform({})
        let skssqVal = moment(this.component.props.nsqj).format('YYYYMM')
        skssqVal = skssqVal && `${skssqVal.slice(0, 4)}-${skssqVal.slice(4)}-01` || moment().format('YYYY-MM-DD')
        const { id, swVatTaxpayer } = this.metaAction.context.get("currentOrg") || {}
        const params = {
            "skssq": skssqVal,
            "qyxxList": [{ "qyId": id }]
        }
        let nsqxUnit = '月',
            nsqxdm = '06',
            nsqxTips = '读取所选月份开具发票'
        if (swVatTaxpayer == 2000010002) {
            const resp = await this.webapi.invoices.batchQueryZzsNsqxdm(params)
            nsqxdm = resp && resp.length !== 0 ? resp[0].nsqxdm : '06'
            nsqxUnit = nsqxdm === '06' ? '月' : '季度'
            //nsqxTips = `读取本${nsqxUnit}开具发票`
            nsqxTips = `读取所选月份开具发票`
        }
        let platForm = await platFormReq
        let invoicePlatForm = platForm.codeType  // codeType -- 0：非网报区，显示平台采集按钮；1：网报区，不显示平台采集按钮
        const tips = await this.renderTips(invoicePlatForm, nsqxTips)
        this.metaAction.sfs({
            'data.nsqxdm': nsqxdm,
            'data.nsqxUnit': nsqxUnit,
            'data.bill_date': swVatTaxpayer == 2000010002 ? moment(skssqVal).startOf('quarter').format('YYYY-MM') : skssqVal.slice(0, 7),
            'data.bill_date2': swVatTaxpayer == 2000010002 ? moment(skssqVal).endOf('quarter').format('YYYY-MM') : skssqVal.slice(0, 7),
            'data.nsqxTips': tips,//nsqxTips,
            'data.invoicePlatForm': invoicePlatForm
        })
    }

    // 渲染提示
    renderTips=async(invoicePlatForm, nsqxTips)=>{
        let tips = ''
        if(invoicePlatForm===0){
            tips=<ul>
                <li>1、本途径，是获取金财代账云端数据，包含：</li>
                <li>【发票管理工具、票税宝、平台采集】已上传的发票；</li>
                <li>2、读取的是所选月份开具的发票。</li>
            </ul>
        }else{
            tips = nsqxTips
        }
        return tips
    }

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
                resp && this.component.props.closeModal && this.component.props.closeModal({ needReload: true })
            }
            this.runFun = false
        }, time)
    }
    handelSubmit = async () => {
        this.injections.reduce('setState', 'data.loading', true)
        const bill_date = this.metaAction.gf('data.bill_date'),
            bill_date2 = this.metaAction.gf('data.bill_date2'),
            currentOrg = this.metaAction.context.get("currentOrg") || {},
            currentUser = this.metaAction.context.get("currentUser") || {},
            nsqxdm = this.metaAction.gf('data.nsqxdm'),
            option1 = {
                "yhId": currentUser.id,
                "qyId": currentOrg.id || '6678055875340288',
                "fplx": "0", //进项1，销项0
                "skssq": '',
                "nsrxz": currentOrg.swVatTaxpayer == 2000010002 ? "XGMZZS" : "YBNSRZZS",
                "nsrsbh": currentOrg.vatTaxpayerNum || '914401010506412529',
                "cjfs": "dhcj", //采集方式：plcj－批量，dhcj－单户
                nsqxdm, //纳税期限代码，必传：06月报；08季报；
            }
        let dateArr = this.getAll(bill_date, bill_date2)
        let allArr = []
        dateArr.forEach((i) => {
            let k = {}
            k.yhId = currentUser.id
            k.qyId = currentOrg.id
            k.fplx = "0"
            k.skssq = i + ''
            k.nsrxz = currentOrg.swVatTaxpayer == 2000010002 ? "XGMZZS" : "YBNSRZZS"
            k.nsrsbh = currentOrg.vatTaxpayerNum || '914401010506412529'
            k.cjfs = "dhcj"
            k.nsqxdm = nsqxdm
            allArr.push({ ...k })
        })


        let requestOption = {
            ...option1,
            "dataList": allArr
        }

        this.response = null
        this.stopAwait = false
        this.runFun = false
        this.resTimeoutFun(30 * 1000)
        this.response = await this.webapi.invoices.XxfpCollect(requestOption)
        this.injections.reduce('setState', 'data.loading', false)
        if (this.runFun || this.stopAwait) {
            return false
        }
        if (this.response) {
            if (this.response.sysNetException) {
                Modal.error({
                    title: '采集销项发票失败：',
                    content: this.response.error && this.response.error.message || '',
                    okText: '确认',
                })
                return false
            }
            if (this.response.sfcjcg == false) {
                Modal.error({
                    title: '采集销项发票失败：',
                    content: this.response.dataList && this.response.dataList[0].msg || '',
                    okText: '确认',
                })
                return false
            }

            // 采集中
            if (this.response.sfcjcg === true && this.response.sfcjz === false) {
                Modal.info({
                    title: '发票采集中',
                    content: '系统正在发票采集中，请稍后刷新列表',
                    okText: '确认'
                })
                return false
            }
            // const modalOption = {
            //     okText: '确认',
            // }
            /*
           * 20200225新增条件
           * sfcjcg 是否采集成功
           * sfcjz 是否采集中
           * */
            let columns = [{
                title: '发票种类',
                dataIndex: 'fpzlmc',
                key: 'fpzlmc',
                width: 130,
                align: 'center'
            }]
            let dataList = [], lastItem={}
            if (this.response.orgDataList.length > 0 && this.response.orgDataList[0].orgDataList.length && this.response.sfcjcg === true && this.response.sfcjz === true) {
                // modalOption.title = `销项发票一键读取完成，结果如下：`
                columns = columns.concat(this.response.orgDataList.map((e => {
                    // let monthStr = e.skssq + ''  2020-8-30
                    let formatMonth = `${e.skssq.substr(0, 4)}-${e.skssq.substr(4)}`

                    let columnObj = {
                        title: (!e.sfcjcg || !e.sfcjz) ? (<div> {formatMonth}  </div>) : <div>{formatMonth}</div>,
                        dataIndex: e.skssq,
                        key: e.skssq,
                        align: 'center',
                        render: (text, record) => {
                            if ((!e.sfcjcg || !e.sfcjz) && record['fpzlmc']!=='合计') {
                                return (<div></div>)
                            }
                            if(record['fpzlmc']==='合计'){
                                const status = this.checkPickingStatus(record[`${e.skssq}sfcjcg`], record[`${e.skssq}sfcjz`])
                                let cell = ''
                                if(status===0){
                                    cell= <div> <span>{record[`${e.skssq}total`]}</span>
                                        {!!record[`${e.skssq}zfTotal`] && <span style={{marginTop:'8px'}}>（其中作废:{record[`${e.skssq}zfTotal`]}）</span>} 
                                    </div>

                                }else{
                                    const tipText = status !== 1 ? '发票采集中，请稍后查看结果！' : record[`${e.skssq}msg`]
                                    const content = status !== 1 ? '采集中' : '采集失败'
                                    cell = <Tooltip
                                        arrowPointAtCenter={true}
                                        placement='top'
                                        overlayClassName={status !== 1 ? 'inv-tool-tip-normal' : 'inv-tool-tip-warning'}
                                        title={tipText}>
                                            <Icon type={PICKINGSTATUS[status]} className={PICKINGSTATUS[status]} />
                                            <span className={PICKINGSTATUS[status]}>{content}</span>
                                    </Tooltip> 
                                }
                                return cell
                            }

                            return (<div>
                                <div>{record[`${e.skssq}fpzs_xx`]}</div>
                            </div>)

                        }
                    }
                    
                    let zfTotal=0
                    const sum = e.orgDataList.reduce((totalNum, item)=>{
                        totalNum = totalNum + (Number(item['fpzs_total']) || 0)
                        zfTotal = zfTotal + (Number(item['fpzs_zf']) || 0)
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

                        lastItem[`${de.skssq}total`]= sum
                        lastItem[`${de.skssq}zfTotal`]= zfTotal
                        lastItem[`${de.skssq}sfcjcg`]= de.sfcjcg
                        lastItem[`${de.skssq}sfcjz`]= de.sfcjz
                        lastItem[`${de.skssq}msg`]= de.msg

                        delete de.fpzs_xx
                    })
                    
                    dataList = dataList.concat(e.orgDataList)

                    return columnObj
                })))
                dataList = this.formatData(dataList)
                lastItem.fpzlmc = '合计'
                dataList = dataList.concat([lastItem])
            }
            const invoicePlatForm = this.metaAction.gf('data.invoicePlatForm')
            const ret = this.metaAction.modal('show',{
                className: 'inv-batch-custom-info-modal',
                title: '结果',
                footer: null,
                width: 600,
                closeModal: this.closeBom,
                wrapClassName: 'salesAndPurchase-success-tips-modal',  // 必传，控制样式
                closeBack: (back) => { this.closeTip = back },
                children: <CollectResultList
                    props={this.component.props.store}
                    resultTitle='销项发票一键读取完成，结果如下'
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
            return { needReload: true }
        } else {
            return false
        }
    }

    toPlatForm=()=>{
        console.log('打开平台采集页面')
    }

    closeBom=()=>{
        this.closeTip()
    }


    // 根据返回字段判断采集状态
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
        function iterate(data) {
            if (data.length) {
                for (let i = 0; i < data.length; i++) {
                    let dItem = newData.find(f => f.fpzlmc === data[i].fpzlmc)
                    if (dItem) {
                        dItem = Object.assign(dItem, data[i])
                        data.splice(i, 1)
                        iterate(data)
                    } else {
                        newData.push(data[i])
                        data.splice(i, 1)
                        iterate(data)
                    }
                }
            } else {
                dataFilter(newData)
                return
            }
        }
        iterate(d)
        // console.log('newData',newData)
        function dataFilter(data) {
            if (data.length) {
                for (let i = 0; i < data.length; i++) {
                    let keys = []
                    Object.keys(data[i]).forEach(e => {
                        if (e.indexOf('fpzs_xx') > -1) {
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
        this.metaAction.sf('data.bill_date', e.format("YYYY-MM"))
        let date2 = this.metaAction.gf('data.bill_date2')
        let a = e.format("YYYYMM") * 1
        let b = moment(date2).format('YYYYMM') * 1
        b = b - 1
        if (b - a > 2 || a > b) {
            this.metaAction.sf('data.bill_date2', e.format("YYYY-MM"))
        }
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