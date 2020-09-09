import React from 'react'
import { Select, Table, Button } from 'edf-component'
import { Spin } from 'antd'
// import img from '../commonAssets/add.png'
import {
    denyClick, 
    canClickTarget,
    stockLoading, 
    HelpIcon} from '../commonAssets/js/common'

export default class StockBlockSubjectMatch extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            fetching: false,
            loading: false,
            optionList: [],
            baseSetting: [],
            list: [{
                xh: '1',
                type: 'RCost',
                acctName: '直接人工',
                placeholder: '请选择直接人工',
                destAcctId: ''
            },
            {
                xh: 2,
                type: 'LCost',
                acctName: '直接材料',
                placeholder: '请选择直接材料',
                destAcctId:''   
            },
            {
                xh: '3',
                type:'ZFee',
                acctName: '制造费用',
                placeholder: '请选择制造费用',
                destAcctId: ''
            },
            {
                xh: '4',
                type: 'OFee',
                acctName: '其它费用',
                placeholder: '请选择其它费用',
                destAcctId: ''
            }]
        }

        this.webapi = props.webapi
        this.metaAction = props.metaAction
        this.component = props.component
        this.callBack = props.callBack
        this.isUpdate = false
        props.setOkListener && props.setOkListener(()=>{
            return this.handleSure()
        })

        const { accountingStandards } = this.metaAction.context.get('currentOrg') || {}
        this.parentId = (accountingStandards == 2000020001) ? ["5001"] : ["4001"]   //2000010001：企业准则，2000010002：小企业准则
    }

    componentWillMount(a, b){
        this.req(a, b)
    }

    async req(a,b){
        const {webapi, subjectMatches=[]} = this.props
        let { list } = this.state
        this.setState({
            'loading': true,
            'fetching': true
        })
        this.getStockAcctCode = webapi.stock.getStockAcctCode({"module": "cost"})  // 根据条件查询存货模块科目设置范围下的末级科目
        let stockAcctCode = await this.getStockAcctCode

        list = list.map(v=>{
            for(let item of subjectMatches){
                if(item.acctName===v.acctName){
                    const { destAcctId, type, destAcctCode, destAcctName } = item
                    v["destAcctId"] = destAcctId
                    v["type"]= type
                    if(destAcctCode && destAcctName){
                        v["codeAndName"]= `${destAcctCode} ${destAcctName}`

                    }else if(destAcctCode && !destAcctName){
                        v["codeAndName"]= destAcctCode
                        
                    }else if(!destAcctCode && destAcctName){
                        v["codeAndName"]= destAcctName
                    }
                }
            }

            /* 过滤掉设置了辅助核算的科目 因为如果设置了辅助核算，会在后端提供的stockAcctCode列表中过滤掉 */
            const index = stockAcctCode.findIndex(o=>o.id==v.destAcctId)
            if(index<0){
                v["destAcctId"] = ''
                v["codeAndName"]= ''
            }

            return v
        })

        let optionList = []
        // 如果科目设置不为空
        if(stockAcctCode && stockAcctCode.length>0){
            for(let o of stockAcctCode){
                const {codeAndName, id} = o
                o.keyVal = JSON.stringify({codeAndName, id})
    
                // 已经选择的科目置灰不可选
                if(subjectMatches.length>0){   
                    subjectMatches.map(v=>{
                        if(v.destAcctId==id){
                           o.disabled = true 
                        }
                    })
                }
            }   
           optionList = stockAcctCode
        }

        this.setState({
            'fetching': false,
            'loading': false,
            'list': list,
            'optionList': optionList,
            'baseSetting': subjectMatches || []
        })  
    }

    componentWillUnMount(){
        this.state=null
        this.parentId = null
        this.webapi = null
        this.metaAction = null
        this.component = null
        this.callBack = null
        this[`deny-block-subject-matchClickFlag`] = null
    }

    // 确定保存
    handleSure = async()=>{
        const hasClick = canClickTarget.getCanClickTarget('saveOrUpdateAcctCode')  
        if(!hasClick){
            this.setState({loading: true})
            const { list } = this.state
            let flag = false
            const params = list.map(item=>{
                const { type, destAcctId } = item
                if(!destAcctId) {flag = true}
                return { type, destAcctId }
            })
            if(flag) {
                this.metaAction.toast('error', '会计科目不能为空')
                this.setState({loading: false})
                return false
            }            
            canClickTarget.setCanClickTarget('saveOrUpdateAcctCode', true)
            const ret = await this.webapi.stock.saveOrUpdateAcctCode({
                "module": 2,
                "acctCodeDtoList": params
            })
            canClickTarget.setCanClickTarget('saveOrUpdateAcctCode', false)
            this.setState({loading: false})

            if(ret===null){
                this.props.closeModal(ret)
                return true
            }
        }
    }

    handleChange(val, row, index){
        const obj = JSON.parse(val)
        const {codeAndName, id} = obj

        const { optionList, list } = this.state
        const idx = list.findIndex(item=>row.acctName===item.acctName)
        const origId = list[idx]['destAcctId']

        list[idx]['codeAndName'] = codeAndName
        list[idx]['destAcctId'] = id
        let orgIndex = -1, 
            idex = -1
        optionList.map((v, idxNum)=>{
            if(v.id===id){
                idex = idxNum
            }
            if(v.id===origId){
                orgIndex = idxNum 
            }
        })
       
        optionList[idex]['disabled'] = true
        if(orgIndex>-1){
            optionList[orgIndex]['disabled'] = false
        }
        this.setState({
            'optionList': optionList,
            'list': list
        })
    }

    // 新增科目
    async onAdd(row, index, e){
        if(navigator.userAgent.indexOf('Trident') > -1){  //ie浏览器下清楚冒泡
            e.cancelBubble = true
        }
        const { metaAction, store} = this.props
        const sonListByPcodeList= this.parentId  // 一般人5001所有下级科目，小规模4001所有下级科目
        if (metaAction) {
            const ret = await metaAction.modal('show', {
                title: '新增科目',
                width: 450,
                okText: '保存',
                style: { top: 5 },
                bodyStyle: { padding: 24, fontSize: 12 },
                children: metaAction.loadApp('app-proof-of-charge-subjects-add', {
                    store: store,
                    columnCode: "subjects",
                    active: 'archives',
                    initData: {
                        sonListByPcodeList, //父级codeId（数组）
                        isOnlyEndNode: false, //是否是末级科目
                        isEnable: true //过滤停用科目，true为过滤后 
                    }
                })
            })
            if (ret && ret.id) {
                let { optionList, list } = this.state
               
                // 新增回填之前，先恢复之前的额选项为可选项
                let oId = list[index]['destAcctId']  
                for(const v of optionList){
                    if(v.id === oId){
                        v.disabled = false
                    }
                } 
                // 回填 
                if(list[index]){
                    list[index]['destAcctId'] = ret.id
                    list[index]['codeAndName'] = ret.codeAndName
                } 
                //把新增的项加入选项队列
                const {codeAndName, id} = ret
                ret.keyVal = JSON.stringify({codeAndName, id})
                ret.disabled = true
                optionList.push(ret)

                this.setState({
                    'optionList': optionList,
                    'list': list
                })
            }
        }
    }

    onCancel = (ret) => { this.props.closeModal(ret) }

    getColumns(){
        const headKeys = {
            xh: '序号',
            acctName: '成本项目',
            destAcctId: '成本科目'
        }

        const{ fetching, optionList} = this.state
        const cols = Object.keys(headKeys).map(item=>{
            let titEle = <div className="td-header-text"> { headKeys[item] } </div>
            const wid = item==='xh' ? 50 : 150
            const alg = item=='xh' ? 'center' : 'left'
            if(item==='xh' || item==='acctName'){
                return{
                    name: item,
                    key: item,
                    width: wid,
                    title: titEle,
                    align: alg,
                    render: (text, row, index)=>{
                        return (<span> { row[item] } </span>)
                    }
                }
            }else{
                titEle = <div className="td-header-text">
                    <span>
                        <span style={{color: 'red', verticalAlign: 'middle', margin: '0 4px'}}>*</span>
                        会计科目
                    </span>
                    {HelpIcon((<div>科目不支持辅助核算、数量核算！</div>), 'bottom')}
                </div>
                
                return{
                    name: item,
                    key: item,
                    width: 300,
                    title: titEle,
                    align: 'left',
                    render: (text, row, index)=>{
                        return (
                        <div className="stock-block-setting-subject-name">
                            <Select
                                value={row.codeAndName}
                                title={row.codeAndName}
                                placeholder={row['placeholder']}
                                autoFocus={true}
                                notFoundContent={fetching ? <Spin size="small" /> : null}
                                filterOption={true}
                                onChange={(val)=>this.handleChange(val, row, index)}
                                filterOption={(input, option) =>option.props.title.indexOf(input)>-1}
                                style={{ width: '100%' }}
                                dropdownMenuStyle={{ maxHeight: '200px' }}
                                dropdownClassName='stock-block-setting-subject-dropdown'
                                dropdownFooter={
                                    <div className="stock-app-select-add-btn"
                                        onMouseDown={(e)=>{e.preventDefault()}}
                                        onClick={(e)=>{this.onAdd(row, index, e)}}>
                                            <i className="add-img"></i>
                                            <span>新增</span>
                                    </div>
                                }>
                                    { 
                                        optionList.map(v=>{
                                            let {
                                                    id, 
                                                    codeAndName, 
                                                    disabled, 
                                                    keyVal
                                                } = v
                                            disabled = disabled ? true : false
                                            const labelContent = <span> {codeAndName} </span>
                                            return <Option 
                                                className='selectNameOpts'
                                                value={keyVal}
                                                key={id}   
                                                disabled={disabled} 
                                                style={{textAlign:'left'}} 
                                                title={codeAndName}> 
                                                    {labelContent} 
                                            </Option>
                                        }) 
                                    }
                            </Select>
                        </div>      
                        )
                    }
                }
            }
        })

        return cols
    }

    render(){
        const { loading, list } = this.state
        const { matchingItems } = this.props
        let subjectList = list
        if(matchingItems && Object.prototype.toString()=='[object Array]' && matchingItems.length>0){
            subjectList = list.filter(v=>{ 
                for(const item of matchingItems){
                    if(v.type === item.type){
                        return v
                    }
                }    
            })
        }
        
        return (
            <div className="stock-block-setting-subject">
                {
                    loading && <div name= "ttk-stock-app-spin" className= "ttk-stock-app-spin">
                        {
                            stockLoading()
                        }
                    </div>
                }    
                <Table
                    rowKey= "xh"
                    name='report'
                    style={{height:'100%'}}
                    pagination={false}
                    bordered= {true}
                    dataSource={subjectList}
                    columns={this.getColumns()}
                />

                {/* <div className="stock-block-setting-subject-footer">
                    <Button 
                        type="primary"
                        onClick={this.handleSure}
                    >
                        确定
                    </Button>
                    <Button 
                        onClick={()=>{this.onCancel(false)}}
                    >
                        取消
                    </Button>
                </div> */}
            </div>
           
        )

    }
}