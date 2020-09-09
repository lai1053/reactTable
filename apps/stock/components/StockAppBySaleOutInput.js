import React from 'react'
import utils from 'edf-utils'

class StockAppBySaleOutInput extends React.Component {
    // {format, errorTips, isError, defaultVal, inputEvent, blurEvent, focusEvent}
    constructor (props) {
        super(props)
        this.props = props
    }

    handleInput = (e) => {
        let flag = /^\d+(\.{0,1}\d+){0,2}$/.test(e.target.value) || /^[0-9]\d*$/.test(e.target.value) || /^\d+(\.)$/.test(e.target.value)
        if (!flag) {
            e.target.value = ''
        }
        const val = e.target.value
        // clearTimeout(this.inpTimer)
        // this.inpTimer = setTimeout(() => {
        //     this.props.inputEvent && this.props.inputEvent(val)
        //     console.log( (new Date()).getTime(), '-----')
        // }, 500)
        this.props.inputEvent && this.props.inputEvent(val)
    }

    // handleBlur = (e) => {
    //     const val = e.target.value
    //     clearTimeout(this.blurTimer)
    //     this.blurTimer = setTimeout(()=>{
    //         this.props.blurEvent && this.props.blurEvent(val)
    //         // console.log( (new Date()).getTime(), '+++++++')
    //     }, 200)
    // }

    // handleFocus = (e) => {
    //     let v = e.target.value
    //     let val = v.replace(/,/g, '')
    //     let [a, b] = val.split('.')
    //     let ret = b && Number(b) ? `${a}.${Number(`0.${b}`).toString().slice(2)}` : a
    //     e.target.value = ret
    //     // clearTimeout(this.focusTimer)
    //     // this.focusTimer = setTimeout(()=>{
    //         this.props.focusEvent && this.props.focusEvent(e.target.value)
    //     // }, 500)
    // }

    render () {
        let {isError, errorTips, defaultVal, notNegative, disabled, placeholder} = this.props
        disabled = !!disabled
        let inpFont = '', inpBorder = ''
        if (notNegative) {
            inpFont = 'red'
            inpBorder = '1px solid red'
        }
        return  <div class="input_container" title={defaultVal}>
                    <span class='blanck_tooltip'
                            style={
                                    {
                                        display: (isError && errorTips !== '' ?  'block' : 'none')
                                    }
                                }
                    >
                            {errorTips ? errorTips : '值不能为空!'}
                    </span>
                    <input 
                        class={ 
                            isError ? 
                            "input_container_input errorInput" 
                            : "input_container_input" 
                        }
                        style={{
                            color: inpFont, 
                            border: inpBorder
                        }} 
                        placeholder={placeholder}
                        onInput={this.handleInput} 
                        onBlur={this.handleBlur} 
                        disabled={disabled}
                        onFocus={this.handleFocus} 
                        noChange={this.handleChange}
                        value={defaultVal}
                    />
                </div>  
    }
}

export default StockAppBySaleOutInput