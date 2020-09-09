import React from 'react'
import { Table, Button } from 'edf-component'

export default class CollectResultList extends React.PureComponent{
    constructor(props){
        super(props)
        // this.props.setOkListener && this.props.setOkListener(this.closeBom)
    }

    toPlatForm = ()=>{
        const { platFormClick } = this.props || {}
        if(platFormClick && Object.prototype.toString.call(platFormClick)==='[object Function]'){
            platFormClick()
        }
    }

    closeBom = ()=>{
        this.props.closeModal && this.props.closeModal(true)
    }

    render(){
        const {
            resultTitle='销项发票一键读取完成，结果如下',
            unit='张',
            columns= [],
            tableData= [],
            softTips= [],
            hasPlatFormCollect= false,
            platFormClick,
            closePageFn, 
        } = this.props || {}

        return (
            <div class="salesAndPurchase-success-tips">
                <div class="salesAndPurchase-success-tips-title">
                    <i class="salesAndPurchase-success-tips-icon"></i>
                    {resultTitle + "："}
                </div>
                { unit!==null && <div style={{textAlign: 'right', marginBottom: '10px'}}>单位： {unit}</div>}
                <Table
                    className="salesAndPurchase-success-tips-content"
                    columns={columns}
                    dataSource={tableData}
                    bordered 
                    pagination={false}
                />
                {softTips && softTips.length>0 && 
                    <ul className="soft-tips">
                        <li><span className='tips-color'>温馨提示：</span>{softTips.length===1 && softTips[0]}</li>
                        { softTips.length>1 && softTips.map(v=>(<li>{v}</li>))}
                    </ul>
                }
                <div class="salesAndPurchase-success-tips-footer">
                    {  // 是否有平台采集功能 
                        hasPlatFormCollect===0 && <span className="toPlatform" onClick={this.toPlatForm}>
                            <Icon type="info-circle" className="info-circle"/>
                            缺少发票？快来试试平台采集~~~
                        </span>
                    }
                    <Button type="primary" onClick={this.closeBom}>确定</Button>
                </div>
            </div>
        )
    } 
    
}