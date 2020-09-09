import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import {Icon, DatePicker, Button} from 'edf-component'
import config from './config'
import {Tree} from 'edf-component'
import { FormDecorator } from 'edf-component'
import extend from './extend'
import moment from 'moment'
import utils from 'edf-utils'
import CostIncomeRatio from './components/costIncomeRatio'

const blankDetail = {
    inventoryCode: undefined,
    inventoryName: undefined,
    specification: null,
    unit: null,
    quantity: null,
    price: null,
    amount: null
}
class action {
    constructor(option) {
        this.metaAction = option.metaAction
		this.extendAction = option.extendAction
		this.voucherAction = option.voucherAction
		this.config = config.current
		this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections

        injections.reduce('init')

        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }

        this.load()
    }

    load = async () => {
        let res = await this.webapi.dateCard.queryParam() 
        this.injections.reduce('load', res)
    }

    onTabFocus = async (params) => { 
        this.load()
    }

    //打开设置界面
    openSetting = async() => {
        const periodBeginDate = this.metaAction.gf('data.periodBeginDate'),
        paramValue = this.metaAction.gf('data.paramValue')
        const ret =  await this.metaAction.modal('show', {
            title: '设置',
            wrapClassName: 'inventory-card',
            width: 490,
            okText: '确定',
            bodyStyle: { padding: '0 25px 5px 15px' },
            children: this.metaAction.loadApp('ttk-scm-app-inventory-setting', {
                store: this.component.props.store,
                onPortalReload: this.component.props.onPortalReload,
                initData: {
                    // type: 'ccpcbhs',
                    paramValue: paramValue,
                    periodBeginDate: periodBeginDate.slice(0,7),
                    tabEdit: this.component.props.tabEdit
                }
            }),
        })

        if(ret){
            this.load()
        }
    }


    //以销定产自动领料
    automaticPicking = async() => {
        const ret =  await this.metaAction.modal('show', {
            title: '日期',
            wrapClassName: 'automaticPicking-card',
            width: 400,
            closable: false,
			closeBack: (back) => { this.closeTip = back },
            footer: '',
            children: this.getContent(),
        })
    }

    onCancel = () => {
        this.closeTip()
        this.injections.reduce('update', {path: 'data.date', value: ''})
    }

    onOk = async(ret) => {
        let date =this.metaAction.gf('data.date'), option = {flag: 'yxdc'},
            dateStr = this.metaAction.momentToString(date, 'YYYY-MM-DD'),
            isReturn = this.metaAction.gf('data.isReturn'),
            lastDay = this.metaAction.gf('data.lastDay')
        
        if(!date && !lastDay) {
            this.metaAction.toast('warning', '请选择日期')
            return false
        }

        if(!isReturn) return false
        this.metaAction.sf('data.isReturn', false)

        option.businessDate = dateStr || lastDay
        let res = await this.webapi.dateCard.produceAccordToSalesAndCreateRecord(option)
        this.metaAction.sf('data.isReturn', true)
        //let res = {setFlag: "deleteRecord", setInventoryDtos: 'inventoryDto'}
        //已存在材料出库单提示, 是否删除之前的单据, 重新生成
        if(res && res.flag == "deleteRecord"){ 
            const ret = await this.metaAction.modal('confirm', {
                title: '确认',
                content: '已存在材料出库单，重新生成将删除之前的单据，是否继续？'
            })
            if(ret){
                res = await this.webapi.dateCard.deleteAndCreateRecord(option)
            }else {
                return false
            }
        }

        //本月存在已出库数量，但是没有配置原料
        if(res && res.inventoryDtos) {
            // const ret = await this.metaAction.modal('confirm', {
            //     title: '确认',
            //     width: 600,
            //     okText: '配置原料',
            //     content: this.getInventoryDtos(res.inventoryDtos),
            // })
            // if(ret) {
            //     this.onCancel()
            //     this.openMaterial()
            // }

            const ret = await this.metaAction.modal('show',{
                title: '以销定产流程',
                wrapClassName: 'inventory-cardlc',
                width: 490,
                footer:'',
                bodyStyle: {padding: '10px 50px'},
                closeBack: (back) => { this.closeTip2 = back },
                children: this.getInventoryDtos(res.inventoryDtos),
            })

        //材料出库单生成成功提示
        }else if(res) {
            this.metaAction.toast('success', `材料出库单${res.code}生成成功`)
            this.onCancel()
        }
    }

    handlePZYL= () => {
        this.closeTip2()
        this.onCancel()
        this.openMaterial()
    }
    handleSGLL= () => {
        this.closeTip2()
        this.onCancel()
        this.openMaterialRelease()
    }
    
    getInventoryDtos = (inventoryDtos) => {
        return <div>
            <div className='content'>
                <Icon fontFamily='edficon' className='jinggaoIcon' type='jinggao'/>
                <div className='pdiv'>
                    {
                        inventoryDtos.map(item => {
                            return <p>{item.fullname+' 的存货尚未配置原料，无法以销定产生成对应的单据，请先配置原料'}</p>
                        })
                    }
                </div>
            </div>
            <div className='footer'>
                <Button onClick={this.handleSGLL}>手工领料</Button>
                <Button type='primary' onClick={this.handlePZYL}>配置原料</Button>
            </div>
        </div>
    }

    handeDateDefaultValue = (v, lastDay) => {
        let dateValue = v ? v : lastDay
        if (!dateValue)
            return dateValue
        //兼容IE
        dateValue = dateValue.replace(/\-\d{1}$/, function (m) {
            return '-0' + m.charAt(1)
        })

        // console.log(dateValue, 'dateValue')
        const date  = new Date(dateValue)
        // console.log(date, 'date')
        if (date.toString().indexOf('Invalid') == -1) {
            return this.metaAction.stringToMoment(dateValue)
        } else {
            const newDateValue = dateValue.replace(/-/g, '/')
            const newDate = new Date(newDateValue)
            if(newDate.toString().indexOf('Invalid') == -1) return this.metaAction.stringToMoment(newDateValue)
            return this.metaAction.stringToMoment(dateValue)
        }
    }

    //以销定产自动领料界面
    getContent = () => {
        const date = this.metaAction.gf('data.date'), lastDay = this.metaAction.gf('data.lastDay')
        return <div>
            <div className='guanbi'><Icon onClick={this.onCancel} fontFamily={'edficon'} type="guanbi" /></div>
            <p className='title'>注：请选择自动生成材料出库单的日期</p>
            <DatePicker
                placeholder='请选择日期' 
                disabledDate={ this.disabledDate }
                defaultValue={this.handeDateDefaultValue(date, lastDay)}
                // defaultValue={date ? this.metaAction.stringToMoment(date) : lastDay? this.metaAction.stringToMoment(lastDay): ''}
                onChange={(e) => {
                    // this.metaAction.sf('data.date', this.metaAction.momentToString(e, "YYYY-MM-DD"))
                    this.metaAction.sfs({
                        'data.date': this.metaAction.momentToString(e, "YYYY-MM-DD"),
                        'data.date1':this.metaAction.momentToString(e, "YYYY-MM-DD")
                    })
                }}/>
            <div className='footer'>
                <Button onClick={this.onCancel}>取消</Button>
                <Button type='primary' onClick={this.onOk}>确定</Button>
            </div>
        </div>
    }

    //控制可选择的日期
    disabledDate = (current) => {
        if(current){
            /*let currentOrg = this.metaAction.context.get("currentOrg"), 
                enableDate = this.metaAction.gf('data.periodBeginDate'),
                currentDate = this.getDate(currentOrg)
            //console.log("enableDate" + enableDate)
            //console.log("currentDate" + currentDate)
            if(moment(currentDate) > moment(enableDate)){
                enableDate = currentDate
            }*/
            let enableDate = this.metaAction.gf('data.lastDay').slice(0,7)
            
            let enableDateNum = parseInt(moment(enableDate).format('YYYYMMDD'))
            let currentNum = parseInt(current.format('YYYYMMDD'))
            return currentNum < enableDateNum ? true : false
        }
    }

    //格式化启用时间
	getDate = (currentOrg) => {
		let enabledYear = Number(currentOrg.enabledYear),
			enabledMonth = Number(currentOrg.enabledMonth)
		enabledMonth = enabledMonth > 9 ? enabledMonth : `0${enabledMonth}`
		return `${enabledYear}-${enabledMonth}`
    }

    //新增产品入库单或出库单
    addInventory = async (key) => {
        let res, productionAccounting = this.metaAction.gf('data.productionAccounting'),
        typeSetting = this.metaAction.gf('data.other.type'),
        lastDay =this.metaAction.gf('data.lastDay')

        //入库单 （判断是否需要成本计算）
        if(key == 'addInventoryIn') {
            let option = { flag: 'yxdc' }
            res = await this.webapi.dateCard.isNeedReCalcCost(option)
            //res = "yes"
            if(res != "no"){
                let dateArr = res.split('-')
                const retCalc = await this.metaAction.modal('confirm', {
                    content: `${dateArr[0]}年${dateArr[1]}月存在未参与成本计算的库存单据，请先成本计算，才可进行产品入库核算`,
                    okText: '成本计算',
                })
                if(retCalc) {
                    let filter1 = {
                        year: res.slice(0,4),
                        month: res.substring(5),
                    }
                    const reCalcCost = await this.webapi.dateCard.reCalcCost(filter1)
                    if(reCalcCost) {
                        this.metaAction.toast('success', '计算成功')
                    }else{
                        return false
                    }
                }else{
                    return false
                }
            }
        }
        
        // this.component.props.setPortalContent &&
        // this.component.props.setPortalContent('库存单据', 
        //     'ttk-scm-app-inventory-documents', {accessType: 1, inventoryId: 'NewInventory',inventoryType: key, 
        //     accountingmethod: 'accountingmethod', proMethod: productionAccounting, lastDay: lastDay,type: typeSetting })
            let appName = key == 'addInventoryIn' ? 'ttk-scm-app-inventory-documents?key=in' : 'ttk-scm-app-inventory-documents?key=out'
            let name = key == 'addInventoryIn' ? '入库单' : '出库单'

            this.component.props.setPortalContent &&
            this.component.props.setPortalContent(name, 
            appName, {accessType: 1, inventoryId: 'NewInventory',inventoryType: key, 
                accountingmethod: 'accountingmethod', proMethod: productionAccounting, lastDay: lastDay,type: typeSetting })
    }

    //跳转到配置原料界面
    openMaterial = async () => {
        this.component.props.setPortalContent &&
        this.component.props.setPortalContent('配置原料', 
            'app-scm-raw-material-list', { accessType: 1 })
    }

    //跳转到材料出库单界面
    openMaterialRelease = () => {
        const lastDay = this.metaAction.gf('data.lastDay'),
        productionAccounting = this.metaAction.gf('data.productionAccounting'),
        date1 =this.metaAction.gf('data.date1')

        this.component.props.setPortalContent &&
        this.component.props.setPortalContent('出库单', 
            'ttk-scm-app-inventory-documents?key=out', { 
                accessType: 1, 
                inventoryId: 'NewInventory',
                inventoryType: 'addInventoryOut',
                accountingmethod: 'accountingmethod',
                lastDay: date1 ? date1 : lastDay,
                proMethod: productionAccounting,
            })
    }

    //跳转到存货台账页面
    openInventoryDoc = () => {
        this.component.props.setPortalContent &&
        this.component.props.setPortalContent('存货台账', 
        'ttk-scm-app-inventory', { accessType: 1 })
    }

    // 成本计算流程
    costCalculation = async() => {
        const lastDay = this.metaAction.gf('data.lastDay')
        const year = lastDay.split('-')[0], month = lastDay.split('-')[1]
        const obj = {
            year: year,
            month: month,
            isReturnValue: true
        }
        const res = await this.webapi.dateCard.reCalcCost(obj)
        // console.log(res,'res')
        if (res && res.length == 0) {
            this.metaAction.toast('success', `${year}年${month}月成本计算成功`)
        } else if(res && res.length){
            res.map((item,index) => {
                res[index] = `存货编码${item}`
            })
            const resConirm = await this.metaAction.modal('warning', {
                content: `${res.join('、')}的出库成本为0或负数，请进行暂估入库或产品入库`,
                okText: '确定',
                className: 'ttk-scm-app-inventory-accountingmethod-confirm',
                bodyStyle: { padding: 24, fontSize: 12 },
            })
            if(resConirm) {
                this.metaAction.toast('success', `${year}年${month}月成本计算成功`)
            }
        } else if(res.error){
            const ret = await this.metaAction.modal('confirm', {
                title: '确认',
                width: 400,
                okText: '存货台账',
                content: res.error.message.indexOf('没有可成本计算的数据') > -1 ? `${year}年${month}月没有数据`: res.error.message,
            })
            if(ret) {
                this.openInventoryDoc()
            }
        }
    }

    // 按成本占收入比例 **********************************

    // 根据产成品直接材料的金额，录入材料出库单
    handleAmountGen = async () => {

        const lastDay =this.metaAction.gf('data.lastDay')
        const result = await this.webapi.dateCard.isNeedMaterCost({operateTriggerSource: 2})     
        // console.log(result, 'result')
        let firstDay = lastDay.slice(0,7)
        firstDay = `${firstDay}-01`

        const productionAccounting = this.metaAction.gf('data.productionAccounting')
        if (result == 'no') {
            const result = await this.webapi.dateCard.totalAndAmount({businessDate: firstDay})
            if (result && result.amount <= 0) {
                this.metaAction.toast('error', '本月产成品入库直接材料合计余额≤0，无法以销定产')
                return 
            }
            const res = await this.metaAction.modal('show', {
                title: '以销定产生成材料出库单',
                width: '80%',
                wrapClassName: 'amountGenerteCss',
                children: this.metaAction.loadApp('ttk-scm-app-inventory-amountMaterialList', {
                    store: this.component.props.store,
                    setPortalContent:this.component.props.setPortalContent,
                    // initData: {lastDay: lastDay}
                    initData: {lastDay: firstDay, totalAndAmount: result, productionAccounting: productionAccounting}
                }),
            })
        } else if(result){
            let year = result.split('-')[0]
            let month = result.split('-')[1]

            const ret = await this.metaAction.modal('confirm', {
                width: 450,
                content: `${year}年${month}月存在销项发票生成的销售出库单，未按成本率计算销售成本，请先计算销售成本，才可进行产品入库核算`,
                okText: '按比例自动计算销售成本'
            })

            if (ret) {
                const result = await this.metaAction.modal('show', {
                    title: '按比例自动计算销售成本',
                    wrapClassName: 'inventory-automaticcalculation',
                    width: 900,
                    okText: '确定',
                    bodyStyle: { padding: '0' },
                    closeModal: this.close,
			        closeBack: (back) => { this.closeTip = back },
                    children: this.metaAction.loadApp('ttk-scm-app-inventory-automaticcalculation', {
                        store: this.component.props.store,
                        // initData: { date: lastDay }
                        initData: { date: firstDay }
                    }),
                })
            }
            // this.metaAction.toast('error', `${year}年${month}月不存在产成品入库单，无法以销定产`)
        }
    }

    close = (ret) => {
		this.closeTip()
	}

    //按比例自动计算销售成本
    handleSalesCost = async(type) => {
        let lastDayOfUnEndingClosingCalendar = this.metaAction.gf('data.lastDay')
        let date = this.metaAction.gf('data.paramValue'), title = '按比例自动计算销售成本'
        if(type=="costSaleRatio") title = '按比例结转销售成本'

        const ret = await this.metaAction.modal('show', {
            title: title,
            wrapClassName: 'inventory-automaticcalculation',
            width: 900,
            okText: '确定',
            bodyStyle: { padding: '0' },
            closeModal: this.close,
			closeBack: (back) => { this.closeTip = back },
            children: this.metaAction.loadApp('ttk-scm-app-inventory-automaticcalculation', {
                store: this.component.props.store,
                initData: { date, lastDayOfUnEndingClosingCalendar, type }
            }),
        })
        if (ret) {}
    }

    handleConfirmTip = async() => {
        const resConirm = await this.metaAction.modal('warning', {
            content: '产成品入库成本数量≤0或单价<0的存货，无法自动生成产品入库单，请修改存货销售成本或期初结存后再以销定产',
            okText: '确定',
            className: 'ttk-scm-app-inventory-accountingmethod-confirm',
            bodyStyle: { padding: 24, fontSize: 12 },
        })
        return resConirm
    }

    // 确认产成品入库单成本
    handleWaEntryCost = async(type) => {
        const result = await this.webapi.dateCard.isNeedReCalcCost({operateTriggerSource: 2})
        const lastDay =this.metaAction.gf('data.lastDay')
        const productionAccounting = this.metaAction.gf('data.productionAccounting')
        const typeSetting = this.metaAction.gf('data.other.type')

        let firstDay = lastDay.slice(0,7)
        firstDay = `${firstDay}-01`
        if (result == 'no') {
            // const response = await this.webapi.dateCard.produceToSales({flag:"yxdc",businessDate: lastDay})
            const response = await this.webapi.dateCard.produceToSales({flag:"yxdc",businessDate: firstDay})
            

            if (response && response.flag=='deleteRecord') {
                    let year = lastDay.split('-')[0]
                    let month = lastDay.split('-')[1]

                    const sureRes = await this.metaAction.modal('confirm', {
                        width: 450,
                        content: `${year}年${month}月已存在以销定产按比例生成的产品入库单，重新生成将删除之前录入的产品入库单，是否继续`,
                    })

                    if (sureRes) {
                        // const ret = await this.webapi.dateCard.delProduceToSales({flag:"yxdc", businessDate: lastDay})
                        const ret = await this.webapi.dateCard.delProduceToSales({flag:"yxdc", businessDate: firstDay})

                        if (ret && ret.details) {
                            let businessDate = this.metaAction.momentToString(lastDay, 'YYYY-MM')
                            businessDate = moment(businessDate)

                            const res = await this.metaAction.modal('show', {
                                title: '以销定产生成产品入库单',
                                width: '80%',
                                wrapClassName: 'costIncomeRatioCss',
                                children: <CostIncomeRatio 
                                            businessDate={moment(firstDay)} type={type}
                                            detail={ret.details} handleConfirmTip={this.handleConfirmTip}/>
                            })
                            if(res){

                                let detalisList = ret.details.filter(item => item.price >= 0)

                                this.component.props.setPortalContent('入库单', 
                                    'ttk-scm-app-inventory-documents?key=in',
                                    {
                                        accessType: 1, 
                                        inventoryId: 'NewInventory',
                                        inventoryType: 'addInventoryIn',
                                        accountingmethod: 'accountingmethod',
                                        lastDay: lastDay,
                                        proMethod: productionAccounting,
                                        detail: detalisList || [],
                                        type: typeSetting
                                    })
                            }
                        }
                    }
            } else {
                let businessDate = this.metaAction.momentToString(lastDay, 'YYYY-MM')
                businessDate = moment(businessDate)

                const res = await this.metaAction.modal('show', {
                    title: '以销定产生成产品入库单',
                    width: '80%',
                    wrapClassName: 'costIncomeRatioCss',
                    children: <CostIncomeRatio 
                                businessDate={moment(firstDay)}
                                type={type}
                                detail={response.details} 
                                handleConfirmTip={this.handleConfirmTip}/>
                })
                if(res){
                    // console.log(response.details, 'res 11111')

                    // let detalisList = response.details
                    // let isNeedTip = false
                    // detalisList.forEach(element => {
                    //     if (element.productQuantity <= 0 || element.price < 0 || element.productQuantity == undefined) {
                    //         isNeedTip = true
                    //     }
                    // });

                    // if (isNeedTip) {
                    //     const resConirm = await this.metaAction.modal('warning', {
                    //         content: '产成品入库成本数量≤0或单价<0的存货，无法自动生成产品入库单，请修改存货销售成本或期初结存后再以销定产',
                    //         okText: '确定',
                    //         className: 'ttk-scm-app-inventory-accountingmethod-confirm',
                    //         bodyStyle: { padding: 24, fontSize: 12 },
                    //     })

                    //     return 
                    // }

                    let detalisList = response.details.filter(item => item.price >= 0)

                    this.component.props.setPortalContent('入库单', 
                        'ttk-scm-app-inventory-documents?key=in',
                        {
                            accessType: 1, 
                            inventoryId: 'NewInventory',
                            inventoryType: 'addInventoryIn',
                            accountingmethod: 'accountingmethod',
                            lastDay: lastDay,
                            proMethod: productionAccounting,
                            detail: detalisList || [],
                            type: typeSetting
                        })
                }
            }
            
        } else if(result){
            let year = result.split('-')[0]
            let month = result.split('-')[1]

            const ret = await this.metaAction.modal('confirm', {
                width: 450,
                content: `${year}年${month}月存在销项发票生成的销售出库单，未按成本率计算销售成本，请先计算销售成本，才可进行产品入库核算`,
                okText: '按比例自动计算销售成本'
            })

            if (ret) {
                const result = await this.metaAction.modal('show', {
                    title: '按比例自动计算销售成本',
                    wrapClassName: 'inventory-automaticcalculation',
                    width: 900,
                    okText: '确定',
                    bodyStyle: { padding: '0' },
                    closeModal: this.close,
			        closeBack: (back) => { this.closeTip = back },
                    children: this.metaAction.loadApp('ttk-scm-app-inventory-automaticcalculation', {
                        store: this.component.props.store,
                        initData: { date: firstDay, type }
                    }),
                })
            }
        }
    }

    // *****************************
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction,voucherAction }),
		ret = { ...metaAction, ...extendAction.gridAction,...voucherAction, ...o }
	
	metaAction.config({ metaHandlers: ret })
	
	return ret

}