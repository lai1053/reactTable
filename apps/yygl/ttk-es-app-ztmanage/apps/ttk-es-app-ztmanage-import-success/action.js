import React from 'react'
import { List, fromJS, Map} from 'immutable'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { LoadingMask,InfiniteListScroller,FormDecorator} from 'edf-component'
import config from './config'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.config = config.current
		this.webapi = this.config.webapi
	}

	onInit = ({ component, injections }) => {
		this.component = component
		this.injections = injections
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk)
		}
		injections.reduce('init', component.props.orgId);
		this.load()
	}

	onOk = async () => {
		return await this.save()
	}

	save = async () => {
		let orgId = this.metaAction.gf('data.orgId');
		let isEnable = this.metaAction.gf('data.isEnable');
		let xs = '';
		if(isEnable == true){
			xs = '0'
		}else {
			xs = '1'
		}
		let params = {};
		params.orgId = orgId;
		params.xs = xs;
		let ret = await this.webapi.importapi.sfxcts(params)
		if(ret){
			this.component.props.closeModal()
			const res = await this.metaAction.modal('show', {
				title: '导账信息',
				width: 1150,
				height: 500,
				okText:'确定',
				bodyStyle:{paddingTop:'0px'},
				footer: null,
				children: this.metaAction.loadApp('ttk-gl-app-importdata-view', {
					store: this.component.props.store,
					orgId: orgId
				})
			});
			if(res){

			}else {
				this.component.props.fuc();
			}
		}
	}
	load = async () => {
		//设置当前执行步骤
		// await this.webapi.importapi.setImpAccountStep({ "step": 3 })
		const successAndFailedCount = await this.webapi.importapi.getSuccessAndFailedCount()
		if(successAndFailedCount){
			LoadingMask.show({background: 'rgba(230,247,255,0.5)'})
		}
		const queryUnMatch = await this.webapi.importapi.queryUnMatch()
		const queryVoucherFailedList = await this.webapi.importapi.queryVoucherFailedList({ "type": "SDVoucher" })
		const queryAssetFailedList = await this.webapi.importapi.queryAssetFailedList()
		// const accountsSnapshot = await this.webapi.importapi.saveAccountsSnapshot()
		this.injections.reduce('load', successAndFailedCount, { queryUnMatch, queryVoucherFailedList, queryAssetFailedList })

		LoadingMask.hide();
	}
    getErrorDetails = async (type) => {
        let errorDetailsObj = this.metaAction.gf('data.other.errorDetails'),
            newList,
            errorDetails

        if (errorDetailsObj && (errorDetailsObj.queryUnMatch.length > 0
                || errorDetailsObj.queryVoucherFailedList.length > 0
                || errorDetailsObj.queryAssetFailedList.length > 0)) {
            if (type == 'SDAccount') {//科目失败列表
                errorDetails = errorDetailsObj.queryUnMatch
                newList = errorDetails.map((item, index) => {
                    return { id: item.glAccountId, content: `● ${item.sourceCode} ${item.sourceName} 未匹配新科目`, popverContent: `${item.fullMsg}` }
                })
            } else if (type == 'SDVoucher') {//凭证失败列表
                errorDetails = errorDetailsObj.queryVoucherFailedList
                newList = errorDetails.map((item, index) => {
                    return { id: `${item.voucherDate}-${item.code}`, content: `● ${item.msg} `, popverContent: `${item.fullMsg}` }
                })
            } else if (type == 'SDAssetCard') {//资产草稿列表
                errorDetails = errorDetailsObj.queryAssetFailedList
                newList = errorDetails.map((item, index) => {
                    return { content: `● ${item} ` }
                })
            }

            await this.metaAction.modal('show', {
                title: type == 'SDAssetCard' ? '草稿明细' : '失败明细',
                okText: '关闭',
                style: { top: 40 }, //兼容代账端嵌入导账后弹出页面不显示内容
                width: 420,
                wrapClassName: 'errordetails-modal',
                children: <InfiniteListScroller
                    count={newList.length}
                    care=''
                    dataSource={newList}
                />
            })
        }
    }
	// 渲染成功导入信息
	renderTips = () => {
		let converseInfo = this.metaAction.gf('data.other.converseInfo'),
			infos = this.metaAction.gf('data.other.sucessinfos') && this.metaAction.gf('data.other.sucessinfos').toJS()
		if (!infos) {
			return
		} else {
			sessionStorage['currentOrgStatus'] = null
            let res
            if (infos.length > 0) {
                res = infos.filter((element) => element.type == 'SDAccount')[0]
            }
			return (
				<div>
                    {
                        res && res.tipMessage ?
                            <span className='ttk-es-app-ztmanage-import-success-noteaccount'>{res.tipMessage}</span>
                            : ''
                    }
					{infos.length > 0 &&
					infos.map(element => {
							let successCount = element.successCount || 0
							let failedCount = element.failedCount || 0
							return (
								<div className='ttk-es-app-ztmanage-import-success-row'>
									<div className='ttk-es-app-ztmanage-import-success-row-left'>
                                        <span className='ttk-es-app-ztmanage-import-success-row-label'
											  title={element ? `${element.typeName} : ` : ''}>
                                            {element ? `${element.typeName} : ` : ''}
                                        </span>
									</div>
									<div className='ttk-es-app-ztmanage-import-success-row-right'>
                                        <span className='ttk-es-app-ztmanage-import-success-row-label'
											  title={` 成功导入${successCount}条,${element.type == 'SDAssetCard' ? '草稿 ' : '失败 '}${failedCount}条`}>
                                            {`成功导入${successCount}条,${element.type == 'SDAssetCard' ? '草稿 ' : '失败 '} `}
											{
												element.type == 'SDAccount' || element.type == 'SDVoucher' || element.type == 'SDAssetCard' ?
													failedCount ?
														<a href="javascript:;"
														   style={{ color: '#E74040', 'text-decoration': 'underline' }}
														   onClick={() => this.getErrorDetails(element.type)}
														>
															{failedCount}
														</a> : 0
													:
													`${failedCount}`
											}
											{` 条`}

                                        </span>
									</div>
								</div>
							)
						}
					)
					}
				</div>
			)
		}
	}
	//
	// renderStatement = (data) => {
	// 	return data&&data.map( item => {
	// 		return <div className='ttk-es-app-ztmanage-import-success-data'>
	// 				<span className='ttk-es-app-ztmanage-import-success-data-span'>{item.name}：</span>
	// 				<span>成功导入 <span>{item.success}</span> 条，失败 <span>{item.failed}</span> 条</span>
	// 			</div>
	// 	})
	// }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
