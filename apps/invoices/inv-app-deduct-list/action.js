import React from 'react'
import { action as MetaAction} from 'edf-meta-engine'
import config from './config'
import{fromJS} from 'immutable'
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        const dkyf = this.calMonth()
        injections.reduce('init',{filter: { dkyf }})
        injections.reduce('initInfo','data.filter.dkyf',dkyf)
        this.load()
    }

     // 计算抵扣月份
     calMonth = () => {
        const getMonth = (new Date()).getMonth()
        const getYear = (new Date()).getFullYear()
        const calMonth = parseInt(getMonth) === 0 ? 12 : (getMonth < 10 ? `0${getMonth}` : getMonth)
        const calYear = parseInt(getMonth) === 0 ? parseInt((getYear - 1)) : getYear
        const date = `${calYear}-${calMonth}`
        let month = date 
        return month 
    }
    
    componentWillReceive = ({nextProps}) => {  // 框架问题，父级app传值后，无法赋值给子app，得在这里处理
        const { data } = nextProps
        let month = !!data.dkyf ? data.dkyf : this.calMonth()
        this.metaAction.sfs({ 'data.filter.dkyf': month })   
    }
    
    // 请求接口，加载页面数据
    load = async (page) => {
        if (!page) {
            const pagination = this.metaAction.gf('data.pagination').toJS()
            page = { currentPage: pagination.current, pageSize: pagination.pageSize }
        }
        
        if(!page.form){
            const form = this.metaAction.gf('data.filter.form').toJS()
            page.form = {...form}
        }
        if(!page.xfmc){
            page.xfmc = !page.xfmc && this.metaAction.gf('data.filter.xfmc')
        }
        if(!page.dkyf){
            page.dkyf = this.metaAction.gf('data.filter.dkyf')
        }
        this.metaAction.sf('data.loading', true)
        this.getData(page).then((res) => {
            this.parseArrayNum(res.list,'hjje',2)
            this.parseArrayNum(res.list,'hjse',2)
            this.metaAction.sf('data.list', fromJS(res.list)) // 抵扣统计列表
            const fpzlcsVoList = res.fpzlcsVoList ? [{ "fpzlDm": "all", "fpzlMc": "全部"}].concat(res.fpzlcsVoList) : []
            this.metaAction.sfs({
                'data.filter.fpzlcsVoList': fromJS(fpzlcsVoList), // 初始化发票类型数据
                'data.statics.totalHjje': this.metaAction.addThousPos(res.totalHjje,true,true,2),
                'data.statics.totalHjse': this.metaAction.addThousPos(res.totalHjse,true,true,2),
                'data.statics.totalCount': res.page.totalCount,
                'data.pagination': fromJS(res.page)
            }) 
            this.injections.reduce('load', res)
            this.metaAction.sf('data.loading', false)
        }).finally(() => {
            this.metaAction.sf('data.loading', false)
            setTimeout(() => {
                this.getTableScroll()
            }, 100)
        })
        
    }

    //请求接口获取列表内容
    getData = async (payload) => {
      const dkyfMon = payload.dkyf ? payload.dkyf : this.metaAction.gf('data.filter.dkyf')
      
      let response,
            pagination = this.metaAction.gf('data.pagination').toJS(),  
            req = {
                "isInit": true,
                "dkyfType": dkyfMon, //--抵扣月份 必传
                "kprqq": '' , //--开票日期启 筛选条件
                "kprqz": '' , //--开票日期止 筛选条件
                "entity": {
                    "qyId": this.metaAction.context.get('currentOrg').id || '',
                    "fpzlDm": "" , ///--发票种类代码 筛选条件
                    "fpdm": "" ,  //--发票代码
                    "fphm": "" ,  //--发票号码 筛选条件
                    "xfmc": "" //--销方名称 筛选条件
                },
                "page": {
                    currentPage: payload.currentPage || 1,
                    pageSize: pagination.pageSize || 20
                }
              }
        if (payload) {
            if(payload['currentPage']) req.page.currentPage = payload.currentPage
            if(payload['pageSize']) req.page.pageSize = payload.pageSize
            if(payload['dkyf'] && !!payload['dkyf']){
                req.dkyfType = parseInt(payload.dkyf.replace(/-/g,'')) // 抵扣月份
            } 
            if(payload['form'] && payload.form['kprqz']) req.kprqz = payload.form.kprqz  // 开票日期起
            if(payload['form'] && payload.form['kprqq']) req.kprqq = payload.form.kprqq  // 开票日期止
            if(payload['xfmc'] && !!payload['xfmc']) req.entity.xfmc = payload.xfmc // 销方名称
            if(payload['form'] && payload.form['fpzlDm']!=='all') req.entity.fpzlDm = payload.form.fpzlDm //发票种类代码
            if(payload['form'] && payload.form['fphm']) req.entity.fphm = payload.form.fphm === null || payload.form.fphm === undefined ? '' : String(payload.form.fphm).trim() // 发票号码
            if(payload['form'] && payload.form['fphm']) req.entity.fpdm = payload.form.fpdm === null || payload.form.fpdm === undefined ? '' : String(payload.form.fpdm).trim() // 发票代码
        }
        response = await this.webapi.invoices.queryDktjList(req)
        return response
    }

    componentDidMount = () => { 
        this.onResize()
        const win = window
        if (win.addEventListener) {
            win.addEventListener('resize', this.onResize, false)
            document.addEventListener('keydown', this.keyDown, false)
        } else if (win.attachEvent) {
            win.attachEvent('onresize', this.onResize)
            document.attachEvent('keydown', this.keyDown)
        } else {
            win.onresize = this.onResize
        }
    }
    componentWillUnmount = () => {
        if (this.props && this.props.isFix === true) return
        const win = window
        if (win.removeEventListener) {
            win.removeEventListener('resize', this.onResize, false)
            document.removeEventListener('keydown', this.keyDown, false)
        } else if (win.detachEvent) {
            win.detachEvent('onresize', this.onResize)
            document.detachEvent('keydown', this.keyDown)
        } else {
            win.onresize = undefined
        }
    }
    onResize = (type) => {
        let keyRandom = Math.floor(Math.random() * 10000)
        this.keyRandom = keyRandom
        setTimeout(() => {
            if (this.keyRandom == keyRandom) {
                let dom = document.getElementsByClassName('ttk-scm-app-expense-list-Body')[0]
                if (!dom) {
                    if (type) {
                        return
                    }
                    setTimeout(() => {
                        this.onResize()
                    }, 20)
                } else {
                    this.getTableScroll()
                }
            }
        }, 100)
    }
  
    // 表格文字超出宽度用省略号显示，鼠标经过提示
    renderTips = (text,width,isMoney) =>{
        const value=isMoney?this.metaAction.addThousPos(text,true,true,2):text
        return {
            children:<div style={{width:width+'px'}} title={value}>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
            </div>
        }
    }
    
    renderAction = (record)=>{
        return {
            children: <a href='javascript:;' onClick={this.viewClick.bind(this,record)}>查看</a>,
            props: {},
        }
    }
    // 查询方法
    handerFilter = (params)=>{  
        if(params){
            this.injections.reduce('updateSfs',{
                ['data.filter.form']: fromJS(params.form),
                ['data.filter.dkyf']: params.dkyf,
                ['data.filter.xfmc']: params.xfmc,
            })  // **赋值销方名称和抵扣月份
        }
        this.load({...params,currentPage:1,pageSize:20});
    }

    // 页面跳转
    pageChanged = (currentPage, pageSize) => {
        if (pageSize == null || pageSize == undefined) {
            pageSize = this.metaAction.gf('data.pagination') ? this.metaAction.gf('data.pagination').toJS()['pageSize'] : 0
        }
        let page = { currentPage, pageSize }
        this.load(page)
    }

    // 分页总页数
    pageShowTotal = (totalNum) => {
        const total = this.metaAction.gf('data.pagination') ? this.metaAction.gf('data.pagination').toJS()['totalCount'] : 0
        return `共有 ${total} 条记录`
    }

    // 数组数据保留的小数位
    parseArrayNum = (arr, key, cal) => {
        return arr.map((item, index, arr)=>{
            item[key] = this.metaAction.addThousPos(item[key],true,true,cal)
            return item
        })
    }

     // 列表高度自适应浏览器大小，出现滚动条
   getTableScroll = (e) => {
    try {
        let tableOption = this.metaAction.gf('data.tableOption').toJS()
        let appDom = document.getElementsByClassName('inv-app-deduct-container')[0]; //以app为检索范围
        let tableWrapperDom = appDom.getElementsByClassName('ant-table-wrapper')[0]; //table wrapper包含整个table,table的高度基于这个dom
        if (!tableWrapperDom) {
            if (e) {
                return
            }
            setTimeout(() => {
                this.getTableScroll()
            }, 100)
            return
        }
        //ant-table有滚动时存在2个table分别包含theadDom和tbodyDom,无滚动时有1个table包含theadDom和tbodyDom
        let theadDom = tableWrapperDom.getElementsByClassName('ant-table-thead')[0];
        let tbodyDom = tableWrapperDom.getElementsByClassName('ant-table-tbody')[0];

        if (tbodyDom && tableWrapperDom && theadDom) {
            let num = tableWrapperDom.offsetHeight - tbodyDom.offsetHeight - theadDom.offsetHeight;
            const width = tableWrapperDom.offsetWidth;
            const height = tableWrapperDom.offsetHeight;
            
        
            if (num < 0) {
                this.injections.reduce('setTableOption', {
                    ...tableOption,
                    x: width - 20 ,
                    y: height - theadDom.offsetHeight - 1,
                })
            } else {
                delete tableOption.y
                this.injections.reduce('setTableOption', {
                    ...tableOption,
                    x: width - 20
                })
            }
        }
    } catch (err) {}
}

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}