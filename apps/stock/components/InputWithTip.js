import React from "react"

class InputWithTip extends React.Component {
    // {format, errorTips, isError, defaultVal, inputEvent, blurEvent, focusEvent}
    constructor(props) {
        super(props)
        this.state = {
            val: "",
        }
        this.props = props
        this.most = props.defaultVal || 0
    }

    handleInput = e => {
        const { format } = this.props || {}
        let defaultLen = 6
        if (format === "amount") {
            e.target.value = e.target.value
                .replace(/[^\d^\.]+/g, "")
                .replace(".", "$#$")
                .replace(/\./g, "")
                .replace("$#$", ".")
        } else if (format === "cash") {
            e.target.value = e.target.value
                .replace(/[^\d^\.]+/g, "")
                .replace(".", "$#$")
                .replace(/\./g, "")
                .replace("$#$", ".")
            defaultLen = 2
        }
        // 限制小数位最多只能输入6位
        if (e.target.value.indexOf(".") > -1) {
            let decimal = e.target.value.split(".")[1]
            if (decimal.length <= defaultLen) {
                this.most = e.target.value
            } else {
                e.target.value = this.most
            }
        }

        const val = e.target.value
        clearTimeout(this.inputTimer)
        this.inputTimer = setTimeout(() => {
            this.props.inputEvent && this.props.inputEvent(val)
        }, 800)
    }

    handleBlur = e => {
        const val = e.target.value
        this.props.blurEvent && this.props.blurEvent(val)
    }

    handleFocus = e => {
        let v = e.target.value
        let val = v.replace(/,/g, "")
        let [a, b] = val.split(".")
        let ret = b && Number(b) ? `${a}.${Number(`0.${b}`).toString().slice(2)}` : a
        e.target.value = ret
        this.props.focusEvent && this.props.focusEvent(e.target.value)
    }

    render() {
        let {
            isError,
            errorTips,
            defaultVal,
            notNegative,
            disabled,
            placeholder,
            className,
        } = this.props
        disabled = !!disabled
        let inpFont = "",
            inpBorder = ""
        if (notNegative) {
            inpFont = "red"
            inpBorder = "1px solid red"
        }
        const inputNode = (
            <input
                className={
                    (isError ? "input_container_input errorInput " : "input_container_input ") +
                    (className || "")
                }
                style={{
                    color: inpFont,
                    border: inpBorder,
                }}
                ref={node => (this.inputRef = node)}
                placeholder={placeholder}
                onInput={this.handleInput}
                onBlur={this.handleBlur}
                disabled={disabled}
                onFocus={this.handleFocus}
                noChange={this.handleChange}
                // value={defaultVal}
                defaultValue={defaultVal}
            />
        )

        if (this.inputRef && (this.inputRef.defaultValue || this.inputRef.defaultValue == 0)) {
            const midVal = defaultVal || defaultVal == 0 ? defaultVal : ""
            this.inputRef.value = midVal
        }

        return (
            <div class="input_container" title={defaultVal}>
                <span class="blanck_tooltip"
                    style={{ display: isError && errorTips !== "" ? "block" : "none" }}>
                    {errorTips ? errorTips : "值不能为空!"}
                </span>
                {inputNode}
            </div>
        )
    }
}

export default InputWithTip
