import React from 'react'
import utils from 'edf-utils'

class SwitchInputText extends React.Component{
    constructor(props){
        super(props)
        this.state ={
            editable: false,
            inputReg:props.inputReg,
            format: props.format,
            callback: props.callback,
            textVal : props.text
        }
        this.props = props
        this.copyValue = props.textVal || 0
    }

    handleInput=(e)=>{
        const type = this.props.numType
        e.target.value = e.target.value.toString().replace(/[^\d^\.]+/g,'').replace('.','$#$').replace(/\./g,'').replace('$#$','.')
        
        if(type==='cash' || type === 'amount'){
            let precision = type=== 'cash' ? 2 : 6 // 数量限制小数位最多只能输入6位,金额只能输入2位 
            if(e.target.value.indexOf('.')>-1){
                let decimal = e.target.value.split('.')[1]
                if(decimal.length<= precision){
                    this.copyValue = e.target.value
                }else{
                    e.target.value = this.copyValue
                }
            }
        }else if(type ==='tenPercent'){
            if (e.target.value.indexOf('.') > -1) {
                let [t, d] = e.target.value.split('.')
                if (parseInt(t)<100 && d.length<=2) {
                    this.copyValue = e.target.value
                } else {
                    e.target.value = this.copyValue
                }

            }else if(e.target.value!='' && e.target.value!=undefined ){
                let v = e.target.value 
                if (parseInt(v)<=100) {
                    this.copyValue = e.target.value
                } else {
                    e.target.value = this.copyValue
                }

            }else{
                e.target.value = ''
            }
        }
        this.setState({textVal: e.target.value})
        this.props.callback && this.props.callback( e.target.value)
    }
    
    handleBlur =(e)=>{
        this.setState({editable: false})
        let val
        if(this.props.format){
            val = parseFloat(e.target.value) ? utils.number.format(e.target.value, this.props.format) : ''
        }else{
            val = e.target.value
        }
        this.props.callback && this.props.callback(val)
    }

    handleClick =()=>{
        const text = this.props.text && this.props.text.toString().slice(0)||''
        this.setState({editable:true, textVal:text },()=>{
            this.node.focus()
        })
    }

    render(){
        const {editable} = this.state
        const {errorFlag} = this.props
        const inputNode =  (<input 
            className="switchInputText-input" 
            ref={node=>this.node = node} 
            onInput={this.handleInput} 
            onBlur={this.handleBlur} 
            defaultValue={this.state.textVal} 
            style={{
                border: errorFlag?'1px solid #ff4600':'1px solid #d9d9d9'}}
        />)
        
        if(this.node && this.state.textVal!==this.node.value) this.node.value = this.state.textVal || ''
        
        return(
            <div className="switchInputText" onClick={this.handleClick}>
            {
                editable ? inputNode : 
                (   <div 
                        class="switchInputText-input-showTxt" 
                        title ={this.props.text}
                        style={{ border: errorFlag?'1px dashed #ff4600':'1px solid #d9d9d9'}}> 
                            {this.props.text} 
                    </div>
                )
            }   
            </div>
        )
    }
}

export default SwitchInputText