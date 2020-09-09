import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { Card, Button, Icon } from 'edf-component'
import {consts} from 'edf-consts'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }
        this.load()
    }

    load = async () => {
        // this.injections.reduce('load')
        this.metaAction.sf('data.loading', true)
        const {weixin, zhifubao, yinhang, xianjin} = await this.webapi.query()
        let data = {wechat: weixin, cash: xianjin, bank: yinhang, alipay: zhifubao, loading: false}
        if(weixin.length != 0 && zhifubao.length != 0 && yinhang.length != 0 && xianjin.length != 0) {
            data.addAccount = false
        }
        
        this.injections.reduce('load', data )
    }

    //当前app的 "tab被点击" (从其他app切换到当前app)
    onTabFocus = async() => {
        this.load()
    }

	//新增账户
	addAccount = (cashType) => {
		this.changeAccount(undefined, consts[cashType])
	}

    changeAccount = async (id, cashTypeId) => {
        const ret = await this.metaAction.modal('show', {
			title: '账户',
			width: 400,
			children: this.metaAction.loadApp('app-card-bankaccount', {
				store: this.component.props.store,
                personId: id,
                bankAccountTypeId: cashTypeId
			}),
		})

		if (ret) {
            this.load()
		}
    }

    //修改账户
	editAccount = (id) => {
		this.changeAccount(id)
	}

    //删除账户
    delete = async (data) => {
        const ret = await this.metaAction.modal('confirm', {
			title: '删除',
			content: '确认删除?'
		})

		if(ret){
            let option = [{id: data.id, ts: data.ts}]
			let response = await this.webapi.delete(option)

			if (response.length && response.length > 0) {
                response.forEach((data) => {
                    this.metaAction.toast('warn', data.message)
                })
            }else {
                this.metaAction.toast('success', '删除成功')
                this.load()
            }
		}
    }

    loopAccount = (data)=>{
        if (!data) return null
        return data.map((item,index) => {
            return <Card
                key={index}
                name={name+index}
                className='ttk-scm-app-funds-account-list-card'
                title={item.name}
                extra={
                    <span>
                        <Icon  type="bianji" fontFamily='edficon' title='编辑' style={{fontSize: '23px', position: 'relative', top: '-1px'}} onClick={this.editAccount.bind(this, item.id)}/>
                        { item.bankAccountTypeId == 3000050001 ? null : <Icon  type="guanbi" fontFamily='edficon' title='删除' style={{fontSize: '25px'}} onClick={this.delete.bind(this, item)}/>}
                    </span>
                }
            >
                <div className={`accountItem-detial`}>
					<div className={`detial-items detial-left`}>
						<div className={`detial-item balance`}>
							<span>最新余额：</span>
							<span title={item.latestAmount}>{item.latestAmount}</span>
						</div>
						{
							item.bankAccountTypeId != consts.BANKACCOUNTTYPE_cash ?
							<div className={`detial-item account`}>
								{
                                    item.bankAccountTypeId == consts.BANKACCOUNTTYPE_wechat || item.bankAccountTypeId == consts.BANKACCOUNTTYPE_alipay ?
                                    <span>账户名称：</span> : <span>开户银行：</span>
                                }
								<span title={item.name}>{item.name}</span>
							</div>:
							null
						}
						{
							item.bankAccountTypeId != consts.BANKACCOUNTTYPE_cash ?
							<div className={`detial-item account`}>
								{
                                    item.bankAccountTypeId == consts.BANKACCOUNTTYPE_wechat || item.bankAccountTypeId == consts.BANKACCOUNTTYPE_alipay ?
                                    <span>账户编码：</span> : <span>账号：</span>
                                }
								<span title={item.code}>{item.code}</span>
							</div>:
							null
						}
					</div>
					<div className={`detial-items`} style={{width: '102px'}}>
						<div className={`detial-item`}>
							<a onClick={()=>{this.onItemEvent('receipt',item)}}	>收款</a>
						</div>
						<div className={`detial-item`}>
							<a onClick={()=>{this.onItemEvent('pay',item)}}>付款</a>
						</div>
						<div className={`detial-item`}>
							<a onClick={ ()=>{this.onItemEvent('toDetial',item)} }>查该账户收支</a>
						</div>
					</div>
                    {
                        item.bankAccountTypeId == consts.BANKACCOUNTTYPE_bank?
                        <div className={`detial-items detial-right`}  style={{width: '125px'}}>
                            <div className={`detial-item`}>
                                <a onClick={()=>{this.importAccount(item)}}	>导入银行对账单</a>
                            </div>
                            <div className={`detial-item`}>
                                <a onClick={ ()=>{this.onItemEvent('bankStatement',item)} }>查看银行对账单</a>
                            </div>
                        </div> : null
                    }

				</div>
            </Card>
        })
    }

    exporttemplate = () => {
        console.log('下载模板')
        // let res = await this.webapi.assetImport.exporttemplate()
		// if(res){
		// 	this.metaAction.toast('success', '下载模版成功')
		// }
    }

    imports = (file) => {
        let {accessUrl, originalName, id} = file.toJS()
        let importId = this.metaAction.gf('data.importId')
        let option = {
            accessUrl,
            oldName: originalName,
            fileId: id,
            isRepeatImport: false,
            bankAccountId: importId,
            isReturnValue: true
        }
        // let res = await this.webapi.import(option)

        // return res

    }

    importAccount = async(item) => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('银行对账单', 'ttk-scm-add-bank-statement-list',{
                accessType: 1,      //区别进入app方式
                bankAccountId: item.id,
                importId: item.id 
            })
    }

    onItemEvent = (type, item) => {
        if(type == 'toDetial') {
            this.component.props.setPortalContent &&
            this.component.props.setPortalContent('收支明细', 'ttk-scm-app-incomeexpenses-rpt',{
                accessType: 1,
                bankAccountId: item.id
            })
        }else if(type == 'bankStatement') {
            this.component.props.setPortalContent &&
            this.component.props.setPortalContent('银行对账单', 'ttk-scm-add-bank-statement-list',{
                accessType: 1,
                bankAccountId: item.id,
                importId: undefined
            })
        }else if(type == 'receipt') {
            this.component.props.setPortalContent &&
            this.component.props.setPortalContent('收款单列表', 'ttk-scm-app-proceeds-list',{
            })
        }else if(type == 'pay') {
            this.component.props.setPortalContent &&
            this.component.props.setPortalContent('付款单列表', 'ttk-scm-app-payment-list',{
            })
        }else {
            this.metaAction.toast('warning', '功能未实现')
        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}