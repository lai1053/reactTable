import React from 'react'
import { Form, DatePicker, Radio, Button ,Icon,Tooltip,Modal, Tree} from 'edf-component'
import moment from 'moment'
const FormItem = Form.Item
const RadioGroup = Radio.Group;
const MonthPicker = DatePicker.MonthPicker
import { consts } from 'edf-consts'
const { confirm } = Modal
const { TreeNode } = Tree

class AccountSet extends React.Component{
    state = {
        accountNoSelectList: [],
        accountSelectList: [],
        leftSelected: [],
        rightSelected: []
    }

    constructor(props){
        super(props)
        this.state = {
            accountNoSelectList: props.accountNoSelectList,
            accountSelectList: props.accountSelectList
        }
    }

    confirm = async () => {
        await this.props.closeModal()
        await this.props.callBack({ accountSelectList: this.state.accountSelectList})
    }

    //展示树
    renderTreeNodes = (data) => {
        if (!data) return <div></div>

        return data.map((item) => {
            return <Tree.TreeNode title={item.codeAndName} key={item.code}/>;
        });
    }

    moveAccountForward = (directon) => {
        let rightSelected = this.state.rightSelected

        if (!rightSelected || rightSelected.length == 0) {
            this.props.toast('warning', '请先在右侧列表中选择科目')
        } else {
            let accountNoSelectList = this.state.accountNoSelectList,
                accountSelectList = this.state.accountSelectList,
                deletedList = []

            for (var i = 0; i < rightSelected.length; i++) {
                let index = accountSelectList.findIndex(item=>item.code == rightSelected[i])
                    deletedList = accountSelectList.splice(index, 1)

                accountNoSelectList.push(deletedList[0])
                accountNoSelectList.sort(this.sortAccount)
            }
            this.setState({
                accountSelectList: accountSelectList,
                accountNoSelectList: accountNoSelectList,
                rightSelected: []
            })
        }
    }

    sortAccount = (accountOne, accountTwo) => {
        return accountOne.code > accountTwo.code
    }

    moveAccountBack = (directon) => {
        let leftSelected = this.state.leftSelected

        if (!leftSelected || leftSelected.length == 0) {
            this.props.toast('warning', '请先在左侧列表中选择科目')
        } else {
            let accountNoSelectList = this.state.accountNoSelectList,
                accountSelectList = this.state.accountSelectList,
                deletedList = []

            for (var i = 0; i < leftSelected.length; i++) {
                let index = accountNoSelectList.findIndex(item=>item.code == leftSelected[i])
                    deletedList = accountNoSelectList.splice(index, 1)

                accountSelectList.push(deletedList[0])
                accountSelectList.sort(this.sortAccount)
                debugger
            }
            this.setState({
                accountSelectList: accountSelectList,
                accountNoSelectList: accountNoSelectList,
                leftSelected: []
            })
        }
    }

    treeCheck = (e, directon) => {
        if (directon == 'forward') {
            this.setState({
                leftSelected: e
            })
        } else {
            this.setState({
                rightSelected: e
            })
        }
    }

    cancel = () => {
        this.props.closeModal()
    }

    render(){
        // let accountList = this.props.accountList

        let accountNoSelectList = this.state.accountNoSelectList,
            accountSelectList = this.state.accountSelectList

        return(
          <div className='accountset-content'>
            <div className='accountset-content-left'>
              <span>科目表</span>
              <Tree checkable onCheck={(e)=>this.treeCheck(e, 'forward')}>
                  {this.renderTreeNodes(accountNoSelectList)}
              </Tree>
            </div>
            <div className='accountset-content-center'>
              <Icon type='xiangqian' fontFamily='edficon' onClick={this.moveAccountForward}></Icon>
              <Icon type='xianghou' fontFamily='edficon' onClick={this.moveAccountBack}></Icon>
            </div>
            <div className='accountset-content-right'>
              <span>多栏账</span>
              <Tree checkable onCheck={(e)=>this.treeCheck(e, 'back')}>
                  {this.renderTreeNodes(accountSelectList)}
              </Tree>
            </div>
            <div style={{ width: '100%', textAlign: 'right',borderTop: '1px solid #e8e8e8',paddingTop:'12px', paddingRight:'12px', marginTop: '10px' }}>
                 <Button style={{marginRight: '8px',fontSize: '13px',padding:'0px 15px'}} type='primary' onClick={this.confirm}>确定</Button>
                 <Button onClick={this.cancel} style={{fontSize: '13px',padding:'0px 15px'}}>取消</Button>
             </div>

          </div>
        )
    }
}

export default AccountSet
