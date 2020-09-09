import React from 'react'
import { Map, fromJS } from 'immutable'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import {Icon} from 'edf-component'
import config from './config'
import {Tree} from 'edf-component'
import { FormDecorator,Checkbox } from 'edf-component'
import extend from './extend'

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
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        injections.reduce('init')

        this.load()
    }

    load = async () => {
        let type = this.component.props.type
        this.metaAction.sf('data.other.loading',true)
        let res 
        if(Array.isArray(type)){
            res = await this.webapi.voucherHabit.queryByCode2({codes: type})
        }else{
            res = await this.webapi.voucherHabit.queryByCode({code: type})
        }
        if(type == 'gzxc') {
            this.metaAction.sf('data.flag',false)
        }
        if(res){
            this.metaAction.sf('data.other.loading',false)
            this.injections.reduce('load',res)
        }
    }
    
    changeRadio = (v) => {
        let activeKey = this.metaAction.gf('data.form.activeKey')
        let dateHabitArr = this.metaAction.gf('data.other.dateHabitArr').toJS()
        this.injections.reduce('upDate',{path: 'data.form.habitId',value: v})
        
        if(activeKey == 'expense') {
            if(v == '4000120001') this.injections.reduce('upDates',[dateHabitArr[0], dateHabitArr[0][0].id])
            if(v == '4000120009') this.injections.reduce('upDates',[dateHabitArr[1], dateHabitArr[1][0].id])
            if(v == '4000120005') this.injections.reduce('upDates',[dateHabitArr[2], dateHabitArr[2][0].id])
            if(v == '4000120006') this.injections.reduce('upDates',[dateHabitArr[3], dateHabitArr[3][0].id])
        }else {
            if(v == '4000120001') this.injections.reduce('upDates',[dateHabitArr[0], dateHabitArr[0][0].id])
            if(v == '4000120004' || v == '4000120002' || v == '4000120003') this.injections.reduce('upDates',[dateHabitArr[1], dateHabitArr[1][0].id])
            if(v == '4000120005') this.injections.reduce('upDates',[dateHabitArr[4], dateHabitArr[4][0].id])
            if(v == '4000120006') this.injections.reduce('upDates',[dateHabitArr[3], dateHabitArr[3][0].id])
            if(v == '4000120007') this.injections.reduce('upDates',[dateHabitArr[4], dateHabitArr[4][0].id])
            if(v == '4000120008') this.injections.reduce('upDates',[dateHabitArr[4], dateHabitArr[4][0].id])
            if(v == '4000120009') this.injections.reduce('upDates',[dateHabitArr[3], dateHabitArr[3][0].id])
            if(v == '4000120010') this.injections.reduce('upDates',[dateHabitArr[3], dateHabitArr[3][0].id])
            if(v == '4000120011') this.injections.reduce('upDates',[dateHabitArr[1], dateHabitArr[1][0].id])
            if(v == '4000120012') this.injections.reduce('upDates',[dateHabitArr[2], dateHabitArr[2][0].id])
            if(v == '4000120013') this.injections.reduce('upDates',[dateHabitArr[3], dateHabitArr[3][0].id])
        }

        // xc
        let oldjtHabitId = this.metaAction.gf('data.form.oldjtHabitId'),
            oldffHabitId = this.metaAction.gf('data.form.oldffHabitId'),
            oldisHeBing = this.metaAction.gf('data.form.oldisHeBing')

        if(v == '4000120017'){
            this.metaAction.sfs({
                'data.form.jtHabitId': oldjtHabitId ? oldjtHabitId : false,
                'data.form.ffHabitId': oldffHabitId ? oldffHabitId : false,
                'data.form.oldisHeBing': oldisHeBing,
                'data.form.dateHabitId': 4000130003
            })
        }
        if(v == '4000120021'){
            this.metaAction.sfs({
                'data.form.jtHabitId': oldisHeBing ?  undefined : oldjtHabitId,
                'data.form.ffHabitId': oldisHeBing ?  undefined : oldffHabitId,
                'data.form.oldisHeBing': oldisHeBing,
                'data.form.dateHabitId': 4000130002
            })
        }

        let habit = this.metaAction.gf('data.other.habit').toJS()
        habit.map(item=>{
            if(item.id == v) {
                item.summarys.map(items=>{
                    items.label = items.name
                    items.value = items.name
                })
                this.metaAction.sf('data.other.summarys',item.summarys)
            }
        })

    }
    
    fieldChange = (path, value)=>{
        this.injections.reduce('upDate',{path, value:value.id})
    } 



    changeRadioArr = (v) => {
        let dateHabitArr = this.metaAction.gf('data.other.dateHabitArr').toJS()
        let activeKey = this.metaAction.gf('data.form.activeKey')
        // radio
        this.injections.reduce('upDateArr',{path: `data.form.habitId${activeKey}`,value: v})

        // 下拉数组
        if(v == '4000120001') this.injections.reduce('upDatesArr',[dateHabitArr[0], dateHabitArr[0][0].id],
                                `data.other.dateHabit${activeKey}`, `data.form.dateHabitId${activeKey}`)
        if(v == '4000120004' || v == '4000120002' || v == '4000120003') this.injections.reduce('upDatesArr',[dateHabitArr[1], dateHabitArr[1][0].id],
                                `data.other.dateHabit${activeKey}`, `data.form.dateHabitId${activeKey}`)
        if(v == '4000120005') this.injections.reduce('upDatesArr',[dateHabitArr[4], dateHabitArr[4][0].id],
                                `data.other.dateHabit${activeKey}`, `data.form.dateHabitId${activeKey}`)
        if(v == '4000120006' || v == '4000120009' || v == '4000120010') this.injections.reduce('upDatesArr',[dateHabitArr[3], dateHabitArr[3][0].id],
                                `data.other.dateHabit${activeKey}`, `data.form.dateHabitId${activeKey}`)
        if(v == '4000120007') this.injections.reduce('upDatesArr',[dateHabitArr[4], dateHabitArr[4][0].id],
                                `data.other.dateHabit${activeKey}`, `data.form.dateHabitId${activeKey}`)
        if(v == '4000120008') this.injections.reduce('upDatesArr',[dateHabitArr[6], dateHabitArr[6][0].id],
        `data.other.dateHabit${activeKey}`, `data.form.dateHabitId${activeKey}`)

        let habit = this.metaAction.gf('data.other.habit').toJS()
        habit.map(item=>{
            if(item.id == v) {
                item.summarys.map(items=>{
                    items.label = items.name
                    items.value = items.name
                })
                this.metaAction.sf('data.other.summarys',item.summarys)
                this.metaAction.sf(`data.other.summarys${activeKey}`,fromJS(item.summarys))
            }
        })
    }    
    fieldChangeArr = (path, value)=>{
        // 下拉框选中的
        let activeKey = this.metaAction.gf('data.form.activeKey')
        this.injections.reduce('upDatesArrSelect',{path, value:value.id, pathActive: `data.form.dateHabitId${activeKey}`})
    } 
    
    onOk = async() => {
        let isTab = this.metaAction.gf('data.other.isTab')
        if(!isTab){
            let mergeRule = this.metaAction.gf('data.form.habitId'),
            dateRule = this.metaAction.gf('data.form.dateHabitId'),
            settleMerge = this.metaAction.gf(`data.form.settleMerge`),
            summarys = this.metaAction.gf(`data.other.summarys`),
            ts = this.metaAction.gf('data.other.ts'),
            id = this.metaAction.gf('data.other.id'),   
            jthb = this.metaAction.gf('data.form.jtHabitId'),  
            ffhb = this.metaAction.gf('data.form.ffHabitId'),  
            jtffhb = this.metaAction.gf('data.form.isHeBing') 

            if(mergeRule == '4000120017') jtffhb = false
            let filter = {
                "code": this.component.props.type,
                mergeRule,
                dateRule,
                ts,
                id,
                settleMerge,
                summarys,
                jthb: jthb,
                ffhb: ffhb,
                jtffhb: jtffhb
            }
            this.metaAction.sf('data.other.loading',true)
            let res = await this.webapi.voucherHabit.save(filter)
            if (res) this.metaAction.toast('success', '设置成功')
            this.metaAction.sf('data.other.loading',false)
        }else{
            // 只有付款和收款有tab
            let allOption = this.metaAction.gf('data.other.allOption').toJS()
            // let  settleMerge = this.metaAction.gf(`data.form.settleMerge`)
            let dtos = [], ts, id, mergeRule, dateRule,settleMerge,summarys
            this.metaAction.sf('data.other.loading',true)
            allOption.map((item, index)=>{
                ts = this.metaAction.gf(`data.other.ts${index}`)
                id = this.metaAction.gf(`data.other.id${index}`)
                mergeRule = this.metaAction.gf(`data.form.habitId${item.code}`)
                dateRule = this.metaAction.gf(`data.form.dateHabitId${item.code}`)
                settleMerge = this.metaAction.gf(`data.form.settleMerge${item.code}`)
                summarys = this.metaAction.gf(`data.other.summarys${item.code}`)
                dtos.push({
                    id,  
                    code: item.code, 
                    mergeRule: mergeRule ? mergeRule : '4000120001',  
                    dateRule: dateRule ? dateRule : '4000130001',  
                    ts,
                    settleMerge,
                    summarys
                })
            })
            let filter = {dtos}
            let res = await this.webapi.voucherHabit.saveTdo(filter)
            if (res) this.metaAction.toast('success', '设置成功')
            this.metaAction.sf('data.other.loading',false)
        }
    }

    renderCheckGroup = () => {
        let checkArr = []
        let summarys = this.metaAction.gf('data.other.summarys')
        if(summarys){
            summarys = summarys.size ? summarys.toJS() : summarys
            summarys.map(item=>{
                checkArr.push(
                    <Checkbox checked={item.isEnable} disabled={item.isMustSelect} onChange={(v)=>this.changeBox(v.target.checked, item.id)}>
                        {item.name}
                    </Checkbox>
                ) 
            })
            return checkArr
        }  
    }

    changeBox=(v, id) =>{
        let summarys = this.metaAction.gf('data.other.summarys')
        summarys = summarys.size ? summarys.toJS() : summarys
        summarys.map(item=>{
            if(item.id == id){
                item.isEnable = v
            } 
        })
        this.metaAction.sf('data.other.summarys', fromJS(summarys))
    }

    renderCheckGroups = () => {
        let checkArr = []
        let summarys = this.metaAction.gf('data.other.summarys')
        if(summarys){
            summarys = summarys.size ? summarys.toJS() : summarys
            summarys.map(item=>{
                checkArr.push(
                    <Checkbox checked={item.isEnable} disabled={item.isMustSelect} onChange={(v)=>this.changeBoxs(v.target.checked, item.id)}>
                        {item.name}
                    </Checkbox>
                ) 
            })
            return checkArr
        }  
    }

    changeBoxs=(v, id) =>{
        let summarys = this.metaAction.gf('data.other.summarys')
        let activeKey = this.metaAction.gf('data.form.activeKey')

        summarys = summarys.size ? summarys.toJS() : summarys
        summarys.map(item=>{
            if(item.id == id){
                item.isEnable = v
            } 
        })
        this.metaAction.sf('data.other.summarys', fromJS(summarys))
        this.metaAction.sf(`data.other.summarys${activeKey}`,fromJS(summarys))
    }


    renderCheck = () => {
        let data = this.metaAction.gf('data').toJS()
        return (
            <Checkbox children='结算分录合并一条'
                    checked={data.form.settleMerge}
                    onChange={this.settleMergeChange}>
            </Checkbox>
        )
    }

    settleMergeChange = () => {
        let settleMerge = this.metaAction.gf('data.form.settleMerge')
        this.metaAction.sf('data.form.settleMerge',!settleMerge)
    }

    renderChecks = () => {
        let data = this.metaAction.gf('data').toJS()
        return (
            <Checkbox children='结算分录合并一条'
                    checked={data.form.settleMerge}
                    onChange={this.settleMergeChanges}>
            </Checkbox>
        )
    }

    settleMergeChanges = () => {
        let activeKey = this.metaAction.gf('data.form.activeKey')
        let settleMerge = this.metaAction.gf('data.form.settleMerge')
        this.metaAction.sf(`data.form.settleMerge`,!settleMerge)
        this.metaAction.sf(`data.form.settleMerge${activeKey}`,!settleMerge)
    }

    renterText = () => {
        let activeKey = this.metaAction.gf('data.form.activeKey')
        if(activeKey == 'delivery') {
            return '举例：6月20日发生日常经营收入¥1000.00（张三有限公司、原材料、小螺丝、【01000001】）（备注:123………）'
        }
        if(activeKey == 'arrival') {
            return '举例：6月20日发生采购业务¥1000.00（张三有限公司、原材料、小螺丝、【01000001】）（备注:123………）'
        }
        if(activeKey == 'receive') {
            return '举例：6月21日收回应收账款¥1000.00（张三有限公司）（备注:123………）'
        }
        if(activeKey == 'pay') {
            return '举例：6月21日收回应收账款¥1000.00（张三有限公司）（备注:123………）'
        }
        if(activeKey == 'gzxc') {
            return '举例：计提2月份工资薪酬发放一月份工资'
        }
    }

    renterTextTab = () => {
        return '举例：6月21日收回应收账款¥1000.00（张三有限公司）（备注:123………）'
    }

    changeTab = (v) => {
        this.injections.reduce('upDate',{path: 'data.form.activeKey', value:v})
        let allOption = this.metaAction.gf('data.other.allOption').toJS()
        let dateRule, mergeRule
        allOption.map(item=>{
            if(item.code == v) {
                this.selectTab = item
                if(item.dateRule) dateRule= item.dateRule
                if(item.mergeRule) mergeRule= item.mergeRule
            }
        })
        let habitId = this.metaAction.gf(`data.form.habitId${v}`),
        dateHabit = this.metaAction.gf(`data.other.dateHabit${v}`),  // 下拉框
        dateHabitId = this.metaAction.gf(`data.form.dateHabitId${v}`),  // 下拉框日期习惯
        settleMerge = this.metaAction.gf(`data.form.settleMerge${v}`),
        summarys = this.metaAction.gf(`data.other.summarys${v}`)

        if(habitId){  // 选择过，未保存
            this.metaAction.sfs({
                'data.form.habitId': habitId,
                'data.other.dateHabit': dateHabit,
                'data.form.dateHabitId': dateHabitId,
                'data.form.settleMerge': settleMerge,
                'data.other.summarys': summarys,
            })
        }else if(mergeRule && dateRule){  // 之前保存过，这次打开未修改
            // 日期习惯的下拉框
            if(mergeRule == '4000120002' || mergeRule == '4000120003' || mergeRule == '4000120004'){
                this.metaAction.sf('data.other.dateHabit', fromJS(this.selectTab.optionalDateRules[1]))
            }else if(mergeRule == '4000120001'){
                this.metaAction.sf( 'data.other.dateHabit', fromJS(this.selectTab.optionalDateRules[0]))
            }else if(mergeRule == '4000120005'){
                this.metaAction.sf('data.other.dateHabit', fromJS(this.selectTab.optionalDateRules[4]))
            }else if(mergeRule == '4000120006'){
                this.metaAction.sf('data.other.dateHabit', fromJS(this.selectTab.optionalDateRules[3]))
            }else if(mergeRule == '4000120007' || mergeRule == '4000120008' || mergeRule == '4000120009' || mergeRule == '4000120010'){
                this.metaAction.sf('data.other.dateHabit', fromJS(this.selectTab.optionalDateRules[4]))
            }
            this.metaAction.sfs({
                'data.form.habitId': mergeRule,
                'data.form.dateHabitId': dateRule,
                'data.form.settleMerge': settleMerge,
                'data.other.summarys': summarys,
            })
        }else{   // 首次打开
            this.load()
        }

        if (summarys == undefined) {
            let habit = this.metaAction.gf(`data.other.habit${v}`).toJS()
            habit.map(item => {
                if (item.id == mergeRule) {
                    item.summarys.map(items => {
                        items.label = items.name
                        items.value = items.name
                    })
                    this.metaAction.sf('data.other.summarys', item.summarys)
                    this.metaAction.sf(`data.other.summarys${v}`, fromJS(item.summarys))
                }
            })
        }
    }

    // XC
    renderXCHe = () => {
        let data = this.metaAction.gf('data').toJS()
        return (
            <Checkbox children='计提发放凭证合并成一张凭证'
                    checked={data.form.isHeBing}
                    onChange={(v)=>this.isHeBing(v)}>
            </Checkbox>
        )
    }
    isHeBing = (v) => {
        this.metaAction.sfs({
            'data.form.isHeBing': v.target.checked,
            'data.form.oldisHeBing': v.target.checked,
        })
        let jtHabitId = this.metaAction.gf('data.form.jtHabitId'), 
            ffHabitId = this.metaAction.gf('data.form.ffHabitId'),
            oldjtHabitId = this.metaAction.gf('data.form.oldjtHabitId'),
            oldffHabitId = this.metaAction.gf('data.form.oldffHabitId')
        if(v.target.checked){
            this.metaAction.sfs({
                'data.form.jtHabitId': undefined,
                'data.form.ffHabitId': undefined,
                'data.form.oldjtHabitId': jtHabitId,
                'data.form.oldffHabitId': ffHabitId,
            })
        }else{
            this.metaAction.sfs({
                'data.form.jtHabitId': oldjtHabitId ? oldjtHabitId : false,
                'data.form.ffHabitId': oldffHabitId ? oldffHabitId : false
            })
        }
    }
    changeXCRadio = (v, path) => {
        this.injections.reduce('upDate',{path, value: v})

        if(path == 'data.form.jtHabitId'){
            this.metaAction.sf('data.form.oldjtHabitId', v)
        }
        if(path == 'data.form.ffHabitId'){
            this.metaAction.sf('data.form.oldffHabitId', v)
        }
    }
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