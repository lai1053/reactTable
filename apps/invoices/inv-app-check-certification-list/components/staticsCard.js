import React from 'react'
import { Icon } from 'antd'
class StaticsCard extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            statics: props.statics
        }

        this.okCallback = props.okCallback
        this.cancelCallback = props.cancelCallback

        if(props.setOkListener){
            if(this.okCallback){
                props.setOkListener(()=>{
                    this.okCallback.apply(null, [props.statics])
                })
            }
            
        }
        if(props.setCancelLister){
            props.setCancelLister(this.cancelCallback&&this.cancelCallback)
        }
    }

    render (){
        let checkContent = '', cancelContent = ''
        if(this.state.statics && this.state.statics.check && this.state.statics.check.gxfs>0){
            checkContent = <li>本次勾选 
                <span> {this.state.statics.check.gxfs} </span> 份，
                勾选金额合计: <span> {this.state.statics.check.gxHjje} </span> 元，
                勾选税额合计：<span> {this.state.statics.check.gxHjse} </span> 元
            </li>
        }
        if(this.state.statics && this.state.statics.cancel && this.state.statics.cancel.gxfs>0){
            cancelContent = <li>本次取消勾选 
                <span> {this.state.statics.cancel.gxfs} </span> 份，
                取消金额合计: <span> {this.state.statics.cancel.gxHjje} </span> 元，
                取消税额合计：<span> {this.state.statics.cancel.gxHjse} </span> 元
            </li>
        }

        return (
            <div style={{padding: '0 25px 30px'}}>
                <h4> <Icon type="question-circle" className="check-sure-icon"/>请确认</h4>
                <ul class="check-sum-statics">
                    <li>本次勾选发票汇总如下：</li>
                    {checkContent}
                    {cancelContent}
                    {!checkContent && cancelContent? <li>请确认是否取消？</li> : <li>请确认是否提交？</li>}
                </ul>
            </div>
        )
    }
    
}

export default StaticsCard