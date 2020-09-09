import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Map, List, fromJS } from 'immutable'
import { Radio, Select, Checkbox, Button } from 'antd'

export default class exportCheckOptionComponent extends Component {
    constructor(props) {
        super(props)
        const { printAuxAccCalc, isPrintQuantity, isPrintMulti, type, maxLineNum, width, height } = props

        this.state = {
            printAccountChecked: printAuxAccCalc == 1 ? true : false,
            printQuantityChecked: isPrintQuantity == 1 ? true : false,
            printMultiChecked: isPrintMulti == 1 ? true : false
        }
    }

    handleCancelClick() {
        this.closeModal()
    }

    handleConfirmClick() {
        let { data } = this.state,
            printAccountChecked = this.state.printAccountChecked,
            printQuantityChecked = this.state.printQuantityChecked,
            printMultiChecked = this.state.printMultiChecked,
            exportOption = {
                printAccountChecked,
                printQuantityChecked,
                printMultiChecked
            }

        sessionStorage.setItem('exportOption', JSON.stringify(exportOption))

        let confirmBtn = document.getElementsByClassName('ant-btn ant-btn-primary')

        for (var i = 0; i < confirmBtn.length; i++) {
            if (confirmBtn[i].innerHTML == '<span>确 定</span>') {
                confirmBtn[i].click()
            }
        }
    }

    closeModal(){
        let closeBtn = document.getElementsByClassName('ant-modal-close')

        if (closeBtn && closeBtn.length > 0) {
            closeBtn[0].click()
        }
    }

    changeAccount = (e, checkType) => {
        if (checkType == 'printAccountChecked') {
            this.setState({ printAccountChecked: e.target.checked })
        } else if (checkType == 'printQuantityChecked') {
            this.setState({ printQuantityChecked: e.target.checked })
        } else if (checkType == 'printMultiChecked') {
            this.setState({ printMultiChecked: e.target.checked })
        }
    }

    render() {
        let buttonStyle = {marginTop: '26px', display: 'flex', justifyContent: 'center', borderTop: 'solid 1px #e7e6e6'},
            ds = this.state.data ? this.state.data.get('dataSource') : ''

        let productChildren = [],
            rightButtonStyle = {marginLeft: '10px', marginTop: '12px', fontSize: '12px', height: '30px'}

        let value = this.state.data ? this.state.data.get('value') : '',
            error = this.state.data ? this.state.data.get('error') : ''

        return (
          <div style={{width: '100%', textAlign: 'center', marginTop: '10px'}}>
              <Checkbox checked = {this.state.printAccountChecked} onChange = {(e) => {this.changeAccount(e, 'printAccountChecked')}}>辅助核算</Checkbox>
              <Checkbox checked = {this.state.printQuantityChecked} onChange = {(e) => {this.changeAccount(e, 'printQuantityChecked')}}>数量核算</Checkbox>
              <Checkbox checked = {this.state.printMultiChecked} onChange = {(e) => {this.changeAccount(e, 'printMultiChecked')}}>外币核算</Checkbox>
              <div style={buttonStyle}>
                  <Button type="ghost" onClick={::this.handleCancelClick} style={{'margin-top': '12px', fontSize: '12px', height: '30px'}}>取消</Button>
                  <Button id='btnQuantityConfirm' type="primary" style={rightButtonStyle} onClick={::this.handleConfirmClick}>确定</Button>
              </div>
          </div>
        )
    }
}
