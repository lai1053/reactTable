import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Select, Button, Modal, Icon, PrintOption, FormDecorator, Checkbox, Popover, Menu } from 'edf-component'

import utils from 'edf-utils'
import { fromJS } from 'immutable'

import moment from 'moment'
import config from './config'
const Option = Select.Option
import { consts } from 'edf-consts'
import table from '../../../component/components/table/table'

const ARRIVAL_NotApprove = 1000020001,  // 单据状态:  1000020001: 未审核
    ARRIVAL_Approved = 1000020002,  // 单据状态:  1000020002: 已审核
    ARRIVAL_Rejected = 1000020003;    // 单据状态:  1000020003: 已驳回

const checkboxKey = 'id';//table的主键
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.voucherAction = option.voucherAction
    }

    //初始化数据
    onInit = ({ component, injections }) => {

        this.component = component
        this.injections = injections
        let addEventListener = this.component.props.addEventListener
        this.changeSipmleDate = false
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
            addEventListener('enlargeClick', () => this.onResize({}))
        }
        injections.reduce('init');

        //let { id, accessType } = this.component.props;




        // if (this.component.props.initSearchValue) {
        //     this.linkInPage(this.component.props.initSearchValue)
        // } else {
        this.load()
        //}

    }

    //精锐版/对接后/民非性质 隐藏 
    isShowCollateInvoice = () => {
        //精锐版隐藏
        if (this.component.props.appVersion === 104) {
            return false;
        }
        let baseUrl = this.metaAction.gf('data.tplus.baseUrl');
        if (baseUrl) {
            //对接后隐藏
            return false;
        }
        return this.notMinfei();
    }
    load = async () => {

        const { enabledMonth, enabledYear, periodDate } = this.metaAction.context.get('currentOrg') //获取全局的启用日期


        //默认日期
        if (periodDate) {
            const currentDate = moment().format('YYYY-MM');//当前月
            const lastMonth = moment().subtract(1, "months").format('YYYY-MM');//上月
            let dateRangeKey
            if (periodDate == currentDate) {
                dateRangeKey = 'thisMonth';
            } else if (periodDate == lastMonth) {
                dateRangeKey = 'lastMonth';
            } else {
                dateRangeKey = 'custom';
            }
            this.injections.reduce('dateRangeChange',
                {
                    'data.other.dateRangeKey': dateRangeKey,
                    'data.searchValue.beginDate': moment(periodDate).startOf('month'),
                    'data.searchValue.endDate': moment(periodDate).endOf('month'),
                    'data.other.date': moment(periodDate).startOf('month'),
                })
        }

        if (enabledMonth && enabledYear) {
            const enbledMoment = utils.date.transformMomentDate(`${enabledYear}-${enabledMonth}`)
            const enbledDate = enbledMoment.format("YYYY-MM");//启用月
            // if (enbledDate < currentDate) {
            //     this.injections.reduce('dateRangeChange',
            //         {
            //             'data.other.dateRangeKey': 'lastMonth',
            //             'data.searchValue.beginDate': moment().subtract(1, "months").startOf('month'),
            //             'data.searchValue.endDate': moment().subtract(1, "months").endOf('month'),
            //             'data.other.date': moment().subtract(1, "months").startOf('month'),
            //         })
            // } else if (enbledDate == currentDate) {
            //     this.injections.reduce('dateRangeChange',
            //         {
            //             'data.other.dateRangeKey': 'thisMonth',
            //             'data.searchValue.beginDate': moment().startOf('month'),
            //             'data.searchValue.endDate': moment().endOf('month'),
            //             'data.other.date': moment().startOf('month')
            //         })
            // } else {
            //     this.injections.reduce('dateRangeChange',
            //         {
            //             'data.other.dateRangeKey': 'custom',
            //             'data.searchValue.beginDate': moment(enbledDate).startOf('month'),
            //             'data.searchValue.endDate': moment(enbledDate).endOf('month'),
            //             'data.other.date': moment(enbledDate).startOf('month'),
            //         })
            // }
            this.injections.reduce('update', {
                path: 'data.other.enableddate',
                value: enbledMoment
            })
        }
        const linkConfig = this.metaAction.context.get('linkConfig');
        if (linkConfig) {
            this.injections.reduce('tplusConfig', linkConfig)
        }
        let res = await this.webapi.queryCollectParam();
        if (res && res.proper === '0') {
            this.metaAction.sf('data.searchValue.authenticated', 1)
            this.metaAction.sf('data.other.proper', '0')
        }
        //await this.tplusConfig();//tplus
        this.sortParmas(null, null, null, 'init')
        //this.getClass()
    }
    //获取到页签焦点时调用
    onTabFocus = async (params) => {
        // await this.initDate()
        // params = params.toJS();
        // if (params.accessType != 0) {
        //     if (params.optName == 'collect') {
        //         this.oneKeyCollectClick();
        //     } else if (params.optName === 'import') {
        //         this.importInvoice();
        //     }
        // }
        const { enabledMonth, enabledYear, periodDate } = this.metaAction.context.get('currentOrg') //获取全局的启用日期
        //默认日期
        if (periodDate) {
            this.injections.reduce('update', { path: 'data.other.date', value: moment(periodDate).startOf('month') })
        }
        //启用日期
        if (enabledMonth && enabledYear) {
            const enbledMoment = utils.date.transformMomentDate(`${enabledYear}-${enabledMonth}`)
            this.injections.reduce('update', {
                path: 'data.other.enableddate',
                value: enbledMoment
            })
        }
        const linkConfig = this.metaAction.context.get('linkConfig');
        if (linkConfig) {
            this.injections.reduce('tplusConfig', linkConfig)
        }
        let res = await this.webapi.queryCollectParam();
        if (res && res.proper === '0') {
            this.metaAction.sf('data.searchValue.authenticated', 1);
            this.metaAction.sf('data.other.proper', '0')
        }
        this.sortParmas(null, null, null, 'init')

    }

    moreActionOpeate = (e) => {
        this[e.key] && this[e.key]()
    }
    // 生成凭证
    getVoucher = async () => {

        let selectedOption = this.metaAction.gf('data.tableCheckbox.selectedOption').toJS() //选中的
        let dataSource = this.metaAction.gf('data.list').toJS()//列表
        if (selectedOption.length == 0) {
            return this.metaAction.toast('error', '请选择您要生成凭证的数据')
        }
        let flag = false
        let data = [];
        const supplierIdList = [];
        const arrivalIdList = [];

        //需要将选中的数据按照列表的顺序排序
        dataSource.forEach(item => {
            let sc = selectedOption.find(ele => ele.id == item.id);
            if (sc) {
                if (item.status != ARRIVAL_Approved) {
                    flag = true
                    data.push(
                        {
                            id: item.id,
                            ts: item.ts
                        }
                    );
                    if (item.supplierId && supplierIdList.indexOf(item.supplierId) == -1) {
                        supplierIdList.push(item.supplierId);
                    }
                    if (arrivalIdList.indexOf(item.id) == -1) arrivalIdList.push(item.id)
                }
            }
        })
        // selectedOption.forEach(item => {
        //     if (item.status != ARRIVAL_Approved) {
        //         //flag = true
        //         data.push(
        //             {
        //                 id: item.id,
        //                 ts: item.ts
        //             }
        //         )
        //     }
        //     // return {
        //     //     id: item.id,
        //     //     ts: item.ts
        //     // }
        // })

        if (!flag) {
            this.metaAction.toast('warn', '当前没有可生成凭证的数据')
            return
        }
        data = this.delRepeat(data, 'id');
        if (supplierIdList.length == 0) {
            const queryAchivalAccount = await this.webapi.queryAchivalAccount();
            if (queryAchivalAccount) {
                const confirm = await this.metaAction.modal('confirm', {
                    title: '提示',
                    width: 500,
                    okText: '是',
                    cancelText: '否',
                    content: queryAchivalAccount
                })
                const supplierAccountSet = confirm ? 1 : 0;
                await this.webapi.saveAchivalAccount({ supplierAccountSet });
            }
        }

        let param = {}
        let accountEnableDto = {}
        accountEnableDto.entranceFlag = 'arrival'
        param.accountEnableDto = accountEnableDto

        let responseNew = await this.webapi.queryAccountEnable(param)
        let aaa = 'pu'
        if (responseNew.isShow) {
            const resNew = await this.metaAction.modal('show', {
                title: '生成凭证设置',
                width: 405,
                footer: null,
                bodyStyle: { padding: '15px 0px 0px' },
                children: this.metaAction.loadApp('ttk-scm-app-subject-card', {
                    store: this.component.props.store,
                    aaa,
                }),
            })
            if (resNew) {
                let checkAccountIsUsed = await this.webapi.checkAccountIsUsed({ entranceFlag: 'arrival' })
                if (checkAccountIsUsed) {
                    const ret = await this.metaAction.modal('confirm', {
                        // title: '',
                        content: '上级科目已存在发生额，新增下级科目会把发生额自动结转到第一个下级科目上，是否继续生成'
                    })
                    if (!ret) {
                        this.metaAction.toast('warning', '请到会计科目中把余额结转到下级科目中，再批量生成凭证')
                        return
                    }
                }
            }
        } else {
            let checkAccountIsUsed = await this.webapi.checkAccountIsUsed({ entranceFlag: 'arrival' })
            if (checkAccountIsUsed) {
                const ret = await this.metaAction.modal('confirm', {
                    // title: '',
                    content: '上级科目已存在发生额，新增下级科目会把发生额自动结转到第一个下级科目上，是否继续生成'
                })
                if (!ret) {
                    this.metaAction.toast('warning', '请到会计科目中把余额结转到下级科目中，再批量生成凭证')
                    return
                }
            }
        }

        //存在未匹配存货弹出匹配存货弹框
        // const ruleRes = await this.webapi.getMatchingRule({ onlyNotMatch: true, arrivalIdList });
        // if (ruleRes.invoiceInventoryList.length > 0) {
        //     const mappingAccountRes = await this.metaAction.modal('show', {
        //         title: '科目匹配',
        //         width: 920,
        //         children: this.metaAction.loadApp('ttk-scm-mapping-account', {
        //             store: this.component.props.store,
        //             inventoryType: 'arrival',
        //             ruleRes
        //         }),
        //     })
        //     if (mappingAccountRes === 'false') return
        // }

        //存在未匹配存货弹出理票弹框
        const getInvoiceInvMatch = await this.webapi.getInvoiceInvMatch({
            type: 'generateDoc',
            isArrival: true,
            isDelivery: false,
            arrivalIdList,
            deliveryIdList: []
        });

        if (getInvoiceInvMatch.allMatched !== true) {
            return await this.collateInvoice({ data, idList: arrivalIdList });
        }


        // const ret = await this.metaAction.modal('confirm', {
        //     title: '生成凭证',
        //     content: '确定生成凭证？'
        // })
        // if (!ret) {
        //     return
        // }
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.injections.reduce('tableLoading', true)
        }
        const res = await this.webapi.getAudit(data)
        this.injections.reduce('tableLoading', false)
        if (res) {
            if (res.fail.length > 0) {
                this.showError('生成凭证结果', res.success, res.fail);
            } else {
                this.metaAction.toast('success', '生成凭证成功')
            }
        }
        this.injections.reduce('update', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: [],
                selectedOption: []
            }
        })
        // 重新请求列表数据
        this.sortParmas()
    }
    //生成凭证到T+
    getVoucherToTJ = async () => {
        let selectedOption = this.metaAction.gf('data.tableCheckbox.selectedOption').toJS() //选中的
        let dataSource = this.metaAction.gf('data.list').toJS()
        if (selectedOption.length == 0) {
            return this.metaAction.toast('error', '请选择您要生成凭证的数据')
        }
        let flag = false
        let data = [];
        // let inventoryIdList = [];
        //let supplierIdList = [];
        let arrivalIdList = [];
        let hasNoSupplier = false;//有供应商id不存在的数据
        //需要将选中的数据按照列表的顺序排序
        dataSource.forEach(item => {
            let sc = selectedOption.find(ele => ele.id == item.id);
            if (sc) {
                if (item.status != ARRIVAL_Approved) {
                    flag = true
                    data.push(
                        {
                            id: item.id,
                            ts: item.ts
                        }
                    );
                    if (!item.supplierId) hasNoSupplier = true;
                    // if (item.supplierId && supplierIdList.indexOf(item.supplierId) == -1) {
                    //     supplierIdList.push(item.supplierId);
                    // }
                    // if (item.inventoryId && inventoryIdList.indexOf(item.inventoryId) == -1) {
                    //     inventoryIdList.push(item.inventoryId);
                    // }
                    if (arrivalIdList.indexOf(item.id) == -1) arrivalIdList.push(item.id)
                }
            }
        })
        if (!flag) {
            this.metaAction.toast('warn', '当前没有可生成凭证的数据')
            return
        }
        data = this.delRepeat(data, 'id');
        if (hasNoSupplier) {
            const queryAchivalAccount = await this.webapi.queryAchivalAccount();
            if (queryAchivalAccount) {
                const confirm = await this.metaAction.modal('confirm', {
                    title: '提示',
                    width: 500,
                    okText: '是',
                    cancelText: '否',
                    content: queryAchivalAccount
                })
                const supplierAccountSet = confirm ? 1 : 0;
                await this.webapi.saveAchivalAccount({ supplierAccountSet });
            }
        }

        // let loading = this.metaAction.gf('data.loading')
        // if (!loading) {
        //     this.injections.reduce('tableLoading', true)
        // }
        const baseUrl = this.metaAction.gf('data.tplus.baseUrl');
        const softAppName = this.metaAction.gf('data.tplus.softAppName');
        const res = await this.metaAction.modal('show', {
            title: '生成凭证',
            width: 1000,
            okText: '确定',
            footer: null,
            bodyStyle: { padding: '10px 12px' },
            children: this.metaAction.loadApp('ttk-scm-get-voucher-to-tj', {
                store: this.component.props.store,
                vatOrEntry: 1,
                selectedData: data,
                baseUrl,
                softAppName,
                //   supplierIdList,
                //  inventoryIdList,
                arrivalIdList
            }),
        })
        if (res) {
            // if (res.fail.length > 0) {
            //     this.showError('生成凭证结果', res.success, res.fail);
            // } else {
            //     this.metaAction.toast('success', '生成凭证成功')
            // }
        } else {

        }

        this.injections.reduce('update', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: [],
                selectedOption: []
            }
        })
        // 重新请求列表数据
        this.sortParmas()
    }
    // 删除凭证
    delVoucher = async () => {
        const baseUrl = this.metaAction.gf('data.tplus.baseUrl');
        const softAppName = this.metaAction.gf('data.tplus.softAppName');
        let selectedOption = this.metaAction.gf('data.tableCheckbox.selectedOption').toJS() //选中的
        if (selectedOption.length == 0) {
            return this.metaAction.toast('error', '请选择您要删除凭证的数据')
        }
        //  let flag = false
        let data = [];
        let externalCode = [];
        let datatplus = [];


        let uncertDocExternalCode = [];
        selectedOption.forEach(item => {
            if (item.status == ARRIVAL_Approved) {
                //分开删除
                if (baseUrl && item.docSourceTypeName === `${softAppName}凭证`) {
                    datatplus.push(
                        {
                            id: item.id,
                            ts: item.ts
                        }
                    )
                    externalCode.push({
                        externalCode: item.docId
                    })
                } else {
                    data.push(
                        {
                            id: item.id,
                            ts: item.ts
                        }
                    )
                }
                //未认证进项清单中生成的凭证一块删除 分开删除
                if (item.uncertDocId && baseUrl && item.docSourceTypeName === `${softAppName}凭证`) {
                    uncertDocExternalCode.push({
                        externalCode: item.uncertDocId
                    })
                }
            }

            // return {
            //     id: item.id,
            //     ts: item.ts
            // }
        })
        if (data.length == 0 && datatplus.length == 0) {
            this.metaAction.toast('warn', '当前没有可删除凭证的数据')
            return
        }
        // const ret = await this.metaAction.modal('confirm', {
        //     title: '删除凭证',
        //     content: '确定删除凭证？'
        // })
        // if (!ret) {
        //     return
        // }

        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.injections.reduce('tableLoading', true)
        }

        let success = [], fail = [];
        if (data.length > 0) {
            data = this.delRepeat(data, 'id');
            const resdata = await this.webapi.delAudit(data);
            if (resdata) {
                fail = fail.concat(resdata.fail);
                success = success.concat(resdata.success);
            } else {
                return
            }
        }
        if (datatplus.length > 0) {
            datatplus = this.delRepeat(datatplus, 'id');
            externalCode = this.delRepeat(externalCode, 'externalCode');
            const restplus = await this.webapi.tplus.common(`${baseUrl}/common/doc/deleteBatch`,
                externalCode
                , {
                    headers: {
                        token: this.getOrgId()
                    }
                })
            if (restplus && restplus.error) {
                this.injections.reduce('tableLoading', false);
                this.metaAction.toast('error', `${restplus.error.message}`);
                return
            } else if (restplus && restplus.result) {
                if (!restplus.value) return
                let success1 = [];
                if (!restplus.value.successItems) restplus.value.successItems = [];
                if (!restplus.value.failItems) restplus.value.failItems = [];

                if (restplus.value.failItems.length > 0) {
                    restplus.value.failItems.forEach(fa => {
                        if (/不存在/.test(fa.msg)) {
                            restplus.value.successItems.push(fa.key);
                        } else {
                            fail.push({
                                message: `${fa.msg}`
                            })
                        }
                    })
                }
                // success = success.concat(restplus.value.successItems);
                // if (restplus.value.successItems.length == 0) {
                //     this.showError('删除凭证结果', [], fail);
                //     return
                // }

                restplus.value.successItems.forEach(o => {
                    let item = selectedOption.find(p => p.docId == o);
                    success1.push({
                        id: item.id,
                        ts: item.ts
                    });
                })
                const res = await this.webapi.delAudit(success1);
                this.injections.reduce('tableLoading', false);

                if (res) {
                    success = success.concat(res.success);
                    fail = fail.concat(res.fail);
                }
            } else {
                this.injections.reduce('tableLoading', false);
                this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
                return
            }
        }

        if (uncertDocExternalCode.length > 0) {
            const restplus = await this.webapi.tplus.common(`${baseUrl}/common/doc/deleteBatch`,
                uncertDocExternalCode
                , {
                    headers: {
                        token: this.getOrgId()
                    }
                })
        }
        this.injections.reduce('tableLoading', false)
        if (fail.length == 0) {
            this.metaAction.toast('success', '删除凭证成功')
        } else {
            this.showError('删除凭证结果', success, fail);
        }


        this.injections.reduce('update', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: [],
                selectedOption: []
            }
        })
        // 重新请求列表数据
        this.sortParmas()
    }

    showError = (title, successArr, failArr) => {
        const ret = this.metaAction.modal('show', {
            title,
            width: 585,
            // footer: null,
            bodyStyle: { padding: '2px 0 10px 24px' },
            children: this.metaAction.loadApp('ttk-scm-app-error-list', {
                store: this.component.props.store,
                successArr,
                failArr
            }),
        })
    }

    //生成凭证并导出到T+
    auditAndExportBatch = async () => {
        // const selectedOption = this.getNewData()
        let selectedOption = this.metaAction.gf('data.tableCheckbox.selectedOption').toJS() //选中的

        if (selectedOption.length == 0) {
            this.metaAction.toast('error', '请选择您要生成凭证并导出的数据')
            return
        }

        let flag = false
        let data = selectedOption.map(item => {
            if (item.status != ARRIVAL_Approved) {
                flag = true
            }
            return {
                id: item.id,
                ts: item.ts
            }
        })
        if (!flag) {
            this.metaAction.toast('warn', '当前没有可生成凭证并导出的数据')
            return
        }
        const ret = await this.metaAction.modal('confirm', {
            title: '生成凭证并导出',
            content: '确定生成凭证并导出？'
        })
        if (!ret) {
            return
        }
        data = this.delRepeat(data, 'id');
        const res = await this.webapi.auditAndExportBatch({ vouchers: data });

        //清空选中
        this.injections.reduce('update', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: [],
                selectedOption: []
            }
        })
        // 重新请求列表数据
        setTimeout(() => {
            this.sortParmas()
        }, 1000)
    }

    //生成凭证并导出到U8
    auditAndExportBatchU8 = async () => {
        // const selectedOption = this.getNewData()
        let selectedOption = this.metaAction.gf('data.tableCheckbox.selectedOption').toJS() //选中的

        if (selectedOption.length == 0) {
            this.metaAction.toast('error', '请选择您要生成凭证并导出的数据')
            return
        }

        let flag = false
        let data = selectedOption.map(item => {
            if (item.status != ARRIVAL_Approved) {
                flag = true
            }
            return {
                id: item.id,
                ts: item.ts
            }
        })
        if (!flag) {
            this.metaAction.toast('warn', '当前没有可生成凭证并导出的数据')
            return
        }
        const ret = await this.metaAction.modal('confirm', {
            title: '生成凭证并导出',
            content: '确定生成凭证并导出？'
        })
        if (!ret) {
            return
        }
        data = this.delRepeat(data, 'id');
        const res = await this.webapi.auditAndExportBatchU8({ vouchers: data });

        //清空选中
        this.injections.reduce('update', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: [],
                selectedOption: []
            }
        })
        // 重新请求列表数据
        setTimeout(() => {
            this.sortParmas()
        }, 1000)
    }

    // 批量结算
    settlement = async () => {
        const selectedOption = this.metaAction.gf('data.tableCheckbox.selectedOption').toJS() //选中的

        if (selectedOption.length == 0) {
            this.metaAction.toast('error', '请选择您要批量结算的数据')
            return
        }
        let flag = false
        let data = selectedOption.map(item => {
            if (item.notSettleAmount != 0) {
                flag = true
            }
            return {
                id: item.id,
                ts: item.ts
            }
        })
        if (!flag) {
            this.metaAction.toast('warn', '当前没有可批量结算的数据')
            return
        }
        const res = await this.metaAction.modal('show', {
            title: '批量结算账户',
            width: 720,
            okText: '确定',
            bodyStyle: { padding: '10px 12px' },
            children: this.metaAction.loadApp('ttk-scm-currentAccount-card', {
                store: this.component.props.store,
                selectedOption,
                settleOnOk: async (params) => {
                    return await this.webapi.settleBatch(params);
                },
                vatOrEntry: 1
            })
        })

        if (res) {
            if (res.fail.length > 0) {
                this.showError('批量结算结果', res.success, res.fail);
            } else {
                this.injections.reduce('update', {
                    path: 'data.tableCheckbox',
                    value: {
                        checkboxValue: [],
                        selectedOption: []
                    }
                })
                this.metaAction.toast('success', '批量结算成功')
            }
            this.sortParmas()
        }


    }
    // 批量修改
    supplement = async () => {
        //const list = this.metaAction.gf('list').toJS();
        const selectedOption = this.metaAction.gf('data.tableCheckbox.selectedOption').toJS() //选中的
        if (selectedOption.length == 0) {
            this.metaAction.toast('error', '请选择您要批量修改的数据')
            return
        }
        let data = [];
        let flag = false;
        const newData = this.getNewData();
        newData.forEach(item => {

            if (item.status != ARRIVAL_Approved) {
                flag = true;
                data.push({
                    id: item.id,
                    ts: item.ts
                })
            }
        })
        // list.forEach(o => {
        //     let item = selectedOption.find(p => p.id == o.id);
        //     if (item && o.status != ARRIVAL_Approved) {
        //         flag = true;
        //         data.push({
        //             id: item.id,
        //             ts: item.ts
        //         })
        //     }
        // })
        // selectedOption.forEach(item => {
        //     if (item.status != ARRIVAL_Approved) {
        //         flag = true;
        //         data.push({
        //             id: item.id,
        //             ts: item.ts
        //         })
        //     }
        // })
        if (!flag) {
            this.metaAction.toast('warn', '已生成凭证的发票，不能修改，如需修改，请删除凭证')
            return
        }
        data = this.delRepeat(data, 'id');
        const res = await this.metaAction.modal('show', {
            title: '批量修改数据',
            width: 400,
            okText: '确定',
            wrapClassName: 'piliang',
            bodyStyle: { padding: '10px 65px' },
            children: this.metaAction.loadApp('ttk-scm-supplyData-card', {
                store: this.component.props.store,
                selectedOption: data,
                type: 'addSupplier',
                properties: this.metaAction.gf('data.properties').toJS()
            }),
        })
        if (res) {
            if (res.fail.length > 0) {
                this.showError('批量修改结果', res.success, res.fail);
            } else {
                this.injections.reduce('update', {
                    path: 'data.tableCheckbox',
                    value: {
                        checkboxValue: [],
                        selectedOption: []
                    }
                })
                this.metaAction.toast('success', '批量修改成功')
            }
            this.sortParmas()
        }
    }
    // 凭证习惯
    voucherHabit = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '凭证习惯设置',
            width: 500,
            okText: '确定',
            bodyStyle: { padding: '8px 24px' },
            children: this.metaAction.loadApp('ttk-scm-voucherHabit-card', {
                store: this.component.props.store,
                type: 'arrival',
            }),
        })
        // if (ret) this.metaAction.toast('success', '设置成功')
    }
    // 科目设置
    subManage = () => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('科目设置', 'edfx-business-subject-manage?from=pu', { accessType: 'purchase' })
    }
    // 生成档案规则设置
    fileRules = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '生成档案规则设置',
            width: 570,
            okText: '确定',
            bodyStyle: { padding: '12px 24px 12px' },
            children: this.metaAction.loadApp('ttk-scm-fileRules-card', {
                store: this.component.props.store,
                inventoryType: 'arrival',
            }),
        })
        // if (ret) this.metaAction.toast('success', '设置成功')
    }
    bookkeeping = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '设置记账方式',
            width: 368,
            okText: '确定',
            //  footer: false,
            bodyStyle: { padding: '14px 24px 12px' },
            children: this.metaAction.loadApp('ttk-scm-app-set-bookkeeping', {
                store: this.component.props.store,
                vatOrEntry: 1
            }),
        })
        if (ret.id) this.metaAction.toast('success', '设置成功')
    }
    collectset = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '采集发票设置',
            width: 580,
            className: 'ttk-scm-collect-set-modal',
            children: this.metaAction.loadApp('ttk-scm-collect-set', {
                store: this.component.props.store,
                vatOrEntry: 1
            })
        })
    }
    //批量删除
    deleteBatchClick = async () => {
        const selectedOption = this.metaAction.gf('data.tableCheckbox.selectedOption').toJS() //选中的
        if (selectedOption.length == 0) {
            this.metaAction.toast('error', '请选择您要删除的数据')
            return
        }
        let flag = false;
        let data = selectedOption.map(item => {
            if (item.uncertDocId) {
                flag = true
            }
            return {
                id: item.id,
                ts: item.ts
            }
        })
        let title = '删除进项发票', content = '确定删除所选进项发票？'
        if (flag) {
            content = ' 删除凭证会同时删除跨月认证对应的进项税额凭证，是否删除？'
        }
        const ret = await this.metaAction.modal('confirm', { title, content })

        if (!ret) {
            return
        }


        data = this.delRepeat(data, 'id');


        const res = await this.webapi.deleteBatch(data)
        if (res) {
            if (res.fail.length > 0) {
                this.showError('删除发票结果', res.success, res.fail);
            } else {
                this.metaAction.toast('success', '删除成功')
            }
        }
        this.injections.reduce('update', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: [],
                selectedOption: []
            }
        })
        // 重新请求列表数据
        this.sortParmas()
    }

    //跳转到采购单
    insertProofConfirm = (id) => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent(
                '进项发票',
                'ttk-scm-app-pu-invoice-card',
                { accessType: 1, id }
            )
    }
    collateInvoice = async ({ data = null, idList = null }) => {


        if (!data) {
            let selectedOption = this.metaAction.gf('data.tableCheckbox.selectedOption').toJS() //选中的

            if (selectedOption.length == 0) {
                return this.metaAction.toast('error', '请选择您理票数据')
            }
            data = [];
            let flag = false;
            idList = [];
            const newData = this.getNewData();
            newData.forEach(item => {
                if (item.status != ARRIVAL_Approved) {
                    flag = true;
                    data.push({
                        id: item.id,
                        ts: item.ts
                    })
                    if (idList.indexOf(item.id) === -1) {
                        idList.push(item.id)
                    }
                }
            })
            if (!flag) {
                this.metaAction.toast('warn', '已生成凭证的发票，不能理票')
                return
            }
            data = this.delRepeat(data, 'id');
        }

        let param = {}
        let accountEnableDto = {}
        accountEnableDto.entranceFlag = 'arrival'
        param.accountEnableDto = accountEnableDto

        let response = await this.webapi.queryAccountEnable(param)
        if (response.isShow) {
            let aaa = 'pu'
            const resNew = await this.metaAction.modal('show', {
                title: '生成凭证设置',
                width: 405,
                footer: null,
                bodyStyle: { padding: '15px 0px 0px' },
                children: this.metaAction.loadApp('ttk-scm-app-subject-card', {
                    store: this.component.props.store,
                    aaa,
                }),
            })
            if (resNew) {
                const res = await this.metaAction.modal('show', {
                    title: '理票',
                    width: 920,
                    footer: null,
                    bodyStyle: { padding: '10px 12px' },
                    children: this.metaAction.loadApp('ttk-scm-app-collate-invoice', {
                        store: this.component.props.store,
                        vatOrEntry: 1,
                        selectedOption: data,
                        checkboxValue: idList,
                        accountEnableDto: resNew.accountEnableDto
                    }),
                })
                if (res) {
                    if (res == 1) return
                    if (res == 2) {
                        this.metaAction.toast('warning', '请到会计科目中把余额结转到下级科目中，再批量生成凭证')
                        return
                    }
                    if (res.fail.length > 0) {
                        this.showError('生成凭证结果', res.success, res.fail);
                    } else {
                        this.metaAction.toast('success', '生成凭证成功')
                    }
                }
                this.injections.reduce('update', {
                    path: 'data.tableCheckbox',
                    value: {
                        checkboxValue: [],
                        selectedOption: []
                    }
                })
                // 重新请求列表数据
                this.sortParmas()
            }
        } else {
            const res = await this.metaAction.modal('show', {
                title: '理票',
                width: 920,
                footer: null,
                bodyStyle: { padding: '10px 12px' },
                children: this.metaAction.loadApp('ttk-scm-app-collate-invoice', {
                    store: this.component.props.store,
                    vatOrEntry: 1,
                    selectedOption: data,
                    checkboxValue: idList,
                    accountEnableDto: response.accountEnableDto,
                }),
            })

            if (res) {
                if (res == 1) return
                if (res == 2) {
                    this.metaAction.toast('warning', '请到会计科目中把余额结转到下级科目中，再批量生成凭证')
                    return
                }
                if (res.fail.length > 0) {
                    this.showError('生成凭证结果', res.success, res.fail);
                } else {
                    this.metaAction.toast('success', '生成凭证成功')
                }
            }
            this.injections.reduce('update', {
                path: 'data.tableCheckbox',
                value: {
                    checkboxValue: [],
                    selectedOption: []
                }
            })
            // 重新请求列表数据
            this.sortParmas();
        }
    }
    towrzx = (id) => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent(
                '未认证发票清单',
                'ttk-scm-app-unauthorized-list',
                { accessType: 1, id }
            )
    }
    dateChange = async () => {
        // alert(1)
    }

    // getClass = () => {
    //     return
    //     let drop = document.getElementsByClassName("anticon-ellipsis")
    //     if (drop.length) {
    //         drop[0].className = 'anticon anticon-down'
    //         drop[0].className = 'anticon anticon-down'
    //     }
    // }

    //下载模板
    exporttemplate = () => {
        // if(res){
        // 	this.metaAction.toast('success', '下载模版成功')
        // }
    }

    // getinvAuthVis = () => {
    //     if (typeof (_omni) == 'undefined') {
    //         return false
    //     }
    //     return true
    // }

    btnInvoiceAuth = async () => {
        let beginDate = this.metaAction.gf('data.searchValue.beginDate'),
            endDate = this.metaAction.gf('data.searchValue.endDate')
        let __parm = {
            "sssqQ": this.metaAction.momentToString(beginDate, 'YYYY-MM-DD'),
            "sssqZ": this.metaAction.momentToString(endDate, 'YYYY-MM-DD')
        }
        let retFPRZ = await this.webapi.getFprzStartParam(__parm)
        if (retFPRZ) {
            if (_omni) {
                let voucherParam = {
                    "appid": "JCGJWEB",
                    "appName": "CallFPRZ",
                    "appParam": retFPRZ.value
                }
                voucherParam = JSON.stringify(voucherParam)
                _omni.container.sendmessagetocontainer(voucherParam)
            }
        }
    }

    //导入excel
    importInvoice = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '进项发票导入',
            okText: '导入',
            children: this.metaAction.loadApp('ttk-scm-app-import', {
                store: this.component.props.store,
                exporttemplate: this.exporttemplate, //下载模板
                imports: async (file) => {
                    return await this.webapi.import({ ...file.toJS(), orgId: this.getOrgId(), isIncome: false })
                }
            })
        })
        if (ret) {
            this.injections.reduce('changeDate', { beginDate: moment(), endDate: moment() });//初始化日期
            this.sortParmas();
        }
    }
    showTip = async (id, ts) => {
        const ret = await this.metaAction.modal('show', {
            title: '温馨提示',
            width: 500,
            footer: false,
            children: this.metaAction.loadApp('ttk-scm-app-collect-tip', {
                store: this.component.props.store,
                id,
                ts
            })
        })
        if (ret) {
            this.onCollectModal();
        }
    }
    //弹出采集发票
    onCollectModal = async () => {

        const ret = await this.metaAction.modal('show', {
            title: '采集发票',
            width: 450,
            okText: '采集',
            //  footer: false,
            children: this.metaAction.loadApp('ttk-scm-app-collect', {
                store: this.component.props.store,
                collectOnOk: async (params) => {
                    //打点统计
                    if (typeof (gio) == "function") {
                        gio('track', 'collectBills');
                    }
                    const domainName = location.host.split('.')
                    // if (domainName[0].indexOf('localhost') >= 0 || domainName[0] == 'dev' || domainName[0] == 'test') {
                    const seq = await this.webapi.collecteData1({ ...params, vatOrEntry: 1 });
                    if (seq) {
                        let asyncRequestResult
                        return asyncRequestResult = await this.webapi.asyncRequestResult({ seq }, 2000);
                    }
                    // } else {
                    //     return await this.webapi.collecteData({ ...params, vatOrEntry: 1 });
                    // }
                },
                flag: 'pu'
            })
        })

        if (ret) {
            // ret.invoiceInventoryList=[
            //     {}
            // ]
            if (ret.cancel) {
                //点击取消
            }
            else if (ret.invoiceInventoryList && ret.invoiceInventoryList.length > 0) {
                //匹配存货
                const retss = await this.metaAction.modal('show', {
                    title: '发票货物或劳务名称匹配档案存货名称',
                    width: 600,
                    okText: '确定',
                    bodyStyle: { padding: '22px 24px 12px' },
                    children: this.metaAction.loadApp('ttk-scm-matchInventory-card', {
                        store: this.component.props.store,
                        invoiceInventoryList: ret.invoiceInventoryList,
                        invoice: ret.invoice,
                        inventoryType: 'arrival',
                    }),
                })
                if (retss) {
                    this.matchDateRange(ret.collectDate);
                    this.injections.reduce('changeDate', { beginDate: ret.collectDate[0], endDate: ret.collectDate[1] });//初始化日期
                    this.onCollectResultModal2(ret);
                }
            }
            else if (ret.list && ret.list.length > 0) {
                this.metaAction.toast('success', '发票采集成功')
                this.matchDateRange(ret.collectDate);
                this.injections.reduce('changeDate', { beginDate: ret.collectDate[0], endDate: ret.collectDate[1] });//初始化日期
                this.onCollectResultModal2(ret);
            } else if (ret.message) {
                if (ret.message === '本次采集0条发票') {
                    this.metaAction.toast('success', ret.message)
                } else {
                    this.metaAction.toast('error', ret.message)
                }
            }
        }
    }

    //税局信息
    CheckTaxInfoModal = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '税局信息',
            width: 600,
            okText: '确定',
            bodyStyle: { padding: '10px' },
            children: this.metaAction.loadApp('ttk-scm-app-tax-info', {
                store: this.component.props.store,
                taxOnOk: async (params) => {
                    return await this.webapi.checkAccountInfo(params);
                }
            })
        })
        //采集
        if (ret) {
            this.onCollectModal();
        }
    }

    onCollectResultModal2 = async (option) => {
        const ret = await this.metaAction.modal('show', {
            title: '本次采集发票清单',
            width: 820,
            okText: '确认',
            footer: null,
            className: 'collect-result-modal',
            children: this.metaAction.loadApp('ttk-scm-app-collect-result', {
                store: this.component.props.store,
                dateVisible: false,
                resultData: option.list,
                crossCertificationNum: option.crossCertificationNum,
                vatOrEntry: 1,
                enableddate: this.metaAction.gf('data.other.enableddate')
            })
        })
        if (ret) {
            this.sortParmas();
        }else {
            this.sortParmas()
        }
    }

    onCollectResultModal = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '进项发票汇总表',
            width: 820,
            okText: '确定',
            cancelText: '取消',
            footer: null,
            style: { top: 54 },
            className: 'collect-result-modal',
            children: this.metaAction.loadApp('ttk-scm-app-collect-result', {
                store: this.component.props.store,
                dateVisible: true,
                vatOrEntry: 1,
                enableddate: this.metaAction.gf('data.other.enableddate'),
                defaultdate: this.metaAction.gf('data.other.date')//默认查询日期
            }),
        })
    }
    renderRowClassName = (record, index) => {
        if (!record[checkboxKey]) {
            return 'tr_heji'
        } else if (record.discarded == true) {
            return 'tr_zuofei'
        }
        // else if (record.isDraft == true) {
        //     return 'tr_draft'
        // }
        else {
            return 'tr_normal'
        }
    }
    notXgm = () => {
        return this.metaAction.context.get("currentOrg").vatTaxpayer != 2000010002
    }
    componentDidMount = () => {
        this.onResize()
        // this.showPickerDidMount()
        const win = window
        if (win.addEventListener) {
            win.addEventListener('resize', this.onResize, false)
        } else if (win.attachEvent) {
            win.attachEvent('onresize', this.onResize)
        } else {
            win.onresize = this.onResize
        }
    }

    getTableScroll = () => {
        try {
            let tableOption = this.metaAction.gf('data.tableOption').toJS()
            let dom = document.getElementsByClassName('ttk-scm-app-pu-invoice-list-Body')[0]
            let tableDom
            if (!dom) {
                return
            }
            tableDom = dom.getElementsByClassName('ant-table-tbody')[0];
            tableDom.scrollTop = 0;
            tableDom.scrollLeft = 0;
            if (tableDom && dom) {
                let num = dom.offsetHeight - tableDom.offsetHeight
                if (num < 45) {
                    const width = dom.offsetWidth
                    const height = dom.offsetHeight
                    this.injections.reduce('setTableOption', { ...tableOption, y: height - 39, containerWidth: width - 200 })
                } else {
                    delete tableOption.y
                    this.injections.reduce('update', { path: 'data.tableOption', value: tableOption })
                }
            }
        } catch (err) {

        }
    }

    onResize = (type) => {
        let keyRandom = Math.floor(Math.random() * 10000)
        this.keyRandom = keyRandom
        //const tableOption = this.metaAction.gf('data.tableOption').toJS()
        setTimeout(() => {
            if (this.keyRandom == keyRandom) {
                let dom = document.getElementsByClassName('ttk-scm-app-pu-invoice-list-Body')[0]
                if (!dom) {
                    if (type) {
                        return
                    }
                    setTimeout(() => {
                        this.onResize()
                    }, 20)
                } else {
                    let tableDom = dom.getElementsByClassName('ant-table-tbody')[0];
                    tableDom.scrollTop = 0;
                    tableDom.scrollLeft = 0;
                    let num = dom.offsetHeight - tableDom.offsetHeight
                    let tableOption = this.metaAction.gf('data.tableOption').toJS()
                    if (num < 45) {
                        const width = dom.offsetWidth
                        const height = dom.offsetHeight
                        this.injections.reduce('setTableOption', { ...tableOption, y: height - 39, containerWidth: width - 200 })
                    } else {
                        delete tableOption.y
                        this.injections.reduce('update', { path: 'data.tableOption', value: tableOption })
                    }

                }
            }
        }, 100)
    }

    //刷新页面 不改变参数
    refreshBtnClick = () => {
        this.sortParmas()
    }



    /*********--region start--*********** */
    //渲染列
    renderColumns = () => {
        const columns = this.metaAction.gf('data.other.columnDto').toJS() //header
        //  const tableOption = this.metaAction.gf('data.tableOption').toJS() // x y
        let dataOrigin = this.metaAction.gf('data').toJS()
        let code = dataOrigin.other.code
        let dataList = this.metaAction.gf('data.list')
        let dataList2 = dataList.toJS()

        const arr = [];
        columns.forEach(data => {
            let sortColumns = this.getSortColumnsItem(data.fieldName, data.width) //需要排序操作的单独处理

            if (!data.isVisible) {
                return
            }
            if (this.metaAction.context.get('linkConfig') && data.fieldName == 'settleCodes') {
                return
            }
            if (sortColumns) {
                arr.push(sortColumns)
            }
            else if (data.fieldName == 'seq') {
                const dt = dataOrigin.list;
                let hasDraft = false;
                dt.forEach(item => {
                    if (/*item.isDraft || */   item.discarded) {
                        hasDraft = true;
                    }
                })
                if (!hasDraft) {
                    //所有的列都没有草稿状态
                    arr.push({
                        title: data.caption,
                        key: data.fieldName,
                        className: `table_td_align_center`,
                        dataIndex: data.fieldName,
                        width: data.width,
                        code: code,
                        render: this.rowSpan
                    })
                }
                else {
                    //有草稿状态时
                    arr.push({
                        title: data.caption,
                        key: data.fieldName,
                        className: `table_td_align_left`,
                        dataIndex: data.fieldName,
                        width: data.width,
                        code: code,
                        render: (text, record, index) => { return this.renderRowSpanSeq(text, record, index, 'seq') }
                    })
                }
            }
            else if (data.fieldName == 'settleCodes') {
                arr.push({
                    title: data.caption,
                    key: data.fieldName,
                    className: `table_td_align_${this.needAlignType(data.fieldName)}`,
                    dataIndex: data.fieldName,
                    width: data.width,
                    code: code,
                    render: (text, record, index) => {
                        let length = text ? text.length : 0;
                        if (length == 0) {
                            const obj = {
                                children: null,
                                props: {
                                    rowSpan: this.calcRowSpan(record[checkboxKey], checkboxKey, index),
                                },
                            }
                            return obj
                        }
                        else if (length == 1) {
                            const obj = {
                                children: <span className="ttk-table-app-list-td-con">
                                    <a
                                        href="javascript:;"
                                        onClick={() => this.openMoreContent(text[0].id, 'settleCodes')}
                                        className="table-needDel"
                                        title={text[0].code}
                                        data-rol={1}>
                                        {text[0].code}
                                    </a>
                                </span>,
                                props: {
                                    rowSpan: this.calcRowSpan(record[checkboxKey], checkboxKey, index),
                                },
                            }
                            return obj
                        } else {
                            const obj = {
                                children: <span className="ttk-table-app-list-td-con">
                                    <Popover content={<Menu>
                                        {text.map((item, index) => {
                                            return <Menu.Item key={index}>
                                                <a
                                                    href="javascript:;"
                                                    onClick={() => this.openMoreContent(item.id, 'settleCodes')}
                                                    className="table-needDel pu_invoice_list_green"
                                                    data-rol={1}>
                                                    {item.code}
                                                </a>
                                            </Menu.Item>
                                        })}
                                    </Menu>} title="付款列表" placement='left'>
                                        <a
                                            href="javascript:;"
                                            className="table-needDel"
                                            onClick={() => this.openMoreContent(text[0].id, 'settleCodes')}
                                            title={text[0].code}
                                            data-rol={1}>
                                            {text[0].code}
                                        </a>
                                    </Popover>
                                </span>,
                                props: {
                                    rowSpan: this.calcRowSpan(record[checkboxKey], checkboxKey, index),
                                },
                            }
                            return obj
                        }
                    }
                })
            }
            else if (data.fieldName == 'docCode') {
                arr.push({
                    title: data.caption,
                    key: data.fieldName,
                    dataIndex: data.fieldName,
                    width: data.width,
                    code: code,
                    className: `table_td_align_${this.needAlignType(data.fieldName)}`,
                    render: (text, record, index) => {

                        if (record.docSourceTypeName == '系统凭证') {
                            text = `${record.docType}-${text}`
                        }

                        const obj = {
                            children: <span className="ttk-table-app-list-td-con">
                                <a
                                    href="javascript:;"
                                    onClick={() => this.openDocContent(record.docId, text, record.docSourceTypeName)}
                                    className="table-needDel"
                                    title={text}
                                    data-rol={1}>
                                    {text}
                                </a>
                            </span>,
                            props: {
                                rowSpan: this.calcRowSpan(record[checkboxKey], checkboxKey, index),
                            },
                        }
                        return obj
                    }
                })
            }
            else if (data.fieldName == 'supplierName') {

                arr.push({
                    title: data.caption,
                    key: data.fieldName,
                    className: `table_td_align_${this.needAlignType(data.fieldName)}`,
                    dataIndex: data.fieldName,
                    width: data.width,
                    code: code,
                    onCell: (record) => {
                        if (!record[checkboxKey]) {
                            return
                        }

                        const list = dataList;
                        if (!list.size) return
                        const ds = dataList2;
                        if (!ds || !ds.length) return
                        const index = record.uuid;

                        //是否为第一行
                        if (index == 0 && !record['supplierName']) {
                            return {
                                style: {
                                    border: 'solid red 1px'
                                }
                            }
                        } else {
                            if (!record['supplierName']) {
                                //判断本行是否为空
                                return {
                                    style: {
                                        borderColor: 'red',
                                        borderLeft: 'solid 1px red'
                                    }
                                }
                            } else if (index < ds.length - 1 && ds[index + 1][checkboxKey]) {
                                //获取[]中相同docId的{}数
                                let rowSpan = 1
                                for (let i = index + 1; i < list.size; i++) {
                                    if (record[checkboxKey] == list.getIn([i, checkboxKey]))
                                        rowSpan++
                                    else
                                        break
                                }

                                if ((index + rowSpan) < ds.length && !ds[index + rowSpan]['supplierName'] && ds[index + rowSpan][checkboxKey]) {
                                    return {
                                        style: {
                                            borderBottomColor: 'red'
                                        }
                                    }
                                }

                            }
                        }
                    },
                    render: (text, record, index) => this.rowSpan(text, record, index, data.fieldName)
                })
            }
            // else if (data.fieldName == 'inventoryName') {
            //     arr.push({
            //         title: data.caption,
            //         key: data.fieldName,
            //         className: `table_td_align_${this.needAlignType(data.fieldName)}`,
            //         dataIndex: data.fieldName,
            //         width: data.width,
            //         code: code,
            //         onCell: (record) => {
            //             if (!record[checkboxKey]) {
            //                 return
            //             }
            //             const list = dataList;
            //             const ds = dataList2;
            //             const index = record.uuid;

            //             //是否为第一行
            //             if (index == 0 && !record.inventoryName) {
            //                 return {
            //                     style: {
            //                         border: 'solid red 1px'
            //                     }
            //                 }
            //             } else {
            //                 if (!record.inventoryName) {
            //                     //判断本行是否为空
            //                     return {
            //                         style: {
            //                             borderColor: 'red',
            //                             borderLeft: 'solid 1px red'
            //                         }
            //                     }
            //                 } else if (index < ds.length - 1 && !ds[index + 1].inventoryName && ds[index + 1][checkboxKey]) {
            //                     //判断下一行是否为空
            //                     return {
            //                         style: {

            //                             borderBottomColor: 'red'
            //                         }
            //                     }
            //                 }
            //             }
            //         },
            //         render: (text, record, index) => this.normalTdRender(text, record, index, data.fieldName)
            //     })
            // }
            else if (data.fieldName == 'propertyName') {
                //业务类型
                arr.push({
                    title: <span style={{ marginLeft: '-20.5px' }}>{data.caption}<Popover content='点 更多/批量修改，修改业务类型' placement='rightTop' overlayClassName='ttk-scm-app-pu-invoice-list-helpPopover' >
                        <Icon className='helpIcon' fontFamily='edficon' type="bangzhutishi" />
                    </Popover></span>,
                    key: data.fieldName,
                    className: `table_td_align_${this.needAlignType(data.fieldName)}`,
                    dataIndex: data.fieldName,
                    width: data.width,
                    code: code,
                    onCell: (record) => {
                        if (!record[checkboxKey]) {
                            return
                        }
                        const list = dataList;
                        const ds = dataList2;
                        const index = record.uuid;


                        //是否为第一行
                        if (index == 0 && !record.propertyName) {
                            // if (!record.inventoryName) {
                            //     return {
                            //         style: {
                            //             borderColor: 'red',
                            //             borderTop: 'solid 1px red',
                            //         }
                            //     }
                            // } else {
                            return {
                                style: {
                                    // borderColor: 'red',
                                    //  borderTop: 'solid 1px red',
                                    //  borderLeft: 'solid 1px red',
                                    border: 'solid 1px red'
                                }
                            }
                            //  }
                        } else {
                            if (!record.propertyName) {
                                //判断本行是否为空
                                // if (!record.inventoryName) {
                                //     return {
                                //         style: {
                                //             borderColor: 'red',
                                //         }
                                //     }
                                // } else {
                                return {
                                    style: {
                                        borderColor: 'red',
                                        borderLeft: "solid 1px red"
                                    }
                                }
                                //   }
                            } else if (index < ds.length - 1 && !ds[index + 1].propertyName && ds[index + 1][checkboxKey]) {

                                return {
                                    style: {
                                        borderBottomColor: 'red',
                                    }
                                }
                            }
                        }
                    },
                    render: (text, record, index) => this.normalTdRender(text, record, index, data.fieldName)
                })
            }
            else if (data.isHeader == true) {
                //作为表头 需要跨行 需要表头时 才跨行
                arr.push({
                    title: data.caption,
                    key: data.fieldName,
                    className: `table_td_align_${this.needAlignType(data.fieldName)}`,
                    dataIndex: data.fieldName,
                    width: data.width,
                    code: code,
                    render: (text, record, index) => this.rowSpan(text, record, index, data.fieldName)
                })
            }
            else {
                arr.push({
                    title: data.caption,
                    key: data.fieldName,
                    className: `table_td_align_${this.needAlignType(data.fieldName)}`,
                    dataIndex: data.fieldName,
                    width: data.width,
                    code: code,
                    render: (text, record, index) => this.normalTdRender(text, record, index, data.fieldName)
                })
            }
        })

        //操作栏目列
        arr.push({
            title: (
                <Icon
                    name="columnset"
                    fontFamily='edficon'
                    className='ttk-table-app-list-columnset'
                    type="youcezhankailanmushezhi"
                    onClick={() => this.showTableSetting({ value: true })}
                />
            ),
            key: 'voucherState',//不能修改
            dataIndex: 'voucherState',
            fixed: 'right',
            className: 'table_fixed_width',
            width: 87,
            render: (text, record, index) => this.operateCol(text, record, index)
        })
        return arr

    }

    //计算 跨行数 docId为主键占一行 其它的明细行都按照docId分类 docId相同视为同一单的明细  表头根据明细数判断跨行数
    calcRowSpan = (text, checkboxKey, currentRowIndex, list) => {
        //text  当前行主键的值（docId）
        //checkboxKey  行的主键 'id'
        //currentRowIndex 当前{}的索引 index
        //以docId为主键 相同的docId的{}合并为一行
        if (!text) return;
        if (!list) {
            list = this.metaAction.gf('data.list') //dataSource []
        }
        if (!list) return
        const rowCount = list.size //dataSource 长度 明细数

        if (rowCount == 0 || rowCount == 1) return 1

        //重复
        if (currentRowIndex > 0
            && currentRowIndex <= rowCount
            && text == list.getIn([currentRowIndex - 1, checkboxKey])) {
            return 0
        }

        //获取[]中相同docId的{}数
        let rowSpan = 1
        for (let i = currentRowIndex + 1; i < rowCount; i++) {
            if (text == list.getIn([i, checkboxKey]))
                rowSpan++
            else
                break
        }

        return rowSpan
    }

    //获取需要排序的列
    getSortColumnsItem = (type, width) => {

        const sort = this.metaAction.gf('data.sort').toJS()
        const columns = [
            {
                title: {
                    name: 'sort',
                    component: 'TableSort',
                    sortOrder: sort.userOrderField == "code" ? sort.order : null,
                    handleClick: (e) => { this.sortChange("code", e) },
                    title: '单据编号'
                },
                dataIndex: 'code',
                key: 'code',
                width,
                className: 'table_center',
                render: (text, record, index) => { return this.renderRowSpanA(text, record, index, 'code', { list: this.metaAction.gf('data.list') }) }
            },
            {
                title: {
                    name: 'sort',
                    component: 'TableSort',
                    sortOrder: sort.userOrderField == "businessDate" ? sort.order : null,
                    handleClick: (e) => { this.sortChange("businessDate", e) },
                    title: '单据日期',
                },
                width,
                className: 'table_center',
                dataIndex: 'businessDate',
                key: 'businessDate',
                render: this.rowSpan
            },
            {
                title: {
                    name: 'sort',
                    component: 'TableSort',
                    sortOrder: sort.userOrderField == "invoiceDate" ? sort.order : null,
                    handleClick: (e) => { this.sortChange("invoiceDate", e) },
                    title: '开票日期',
                },
                width,
                className: 'table_center',
                dataIndex: 'invoiceDate',
                key: 'invoiceDate',
                render: this.rowSpan
            },
            {
                title: {
                    name: 'sort',
                    component: 'TableSort',
                    sortOrder: sort.userOrderField == "invoiceTypeId" ? sort.order : null,
                    handleClick: (e) => { this.sortChange("invoiceTypeId", e) },
                    title: '发票类型',
                },
                width,
                className: 'table_left',
                dataIndex: 'invoiceTypeName',
                key: 'invoiceTypeName',
                render: this.rowSpan
            }
        ]
        if (this.metaAction.context.get("currentOrg").vatTaxpayer == 2000010002) {
            columns.push(
                {
                    title: {
                        name: 'sort',
                        component: 'TableSort',
                        sortOrder: sort.userOrderField == "invoiceNumber" ? sort.order : null,
                        handleClick: (e) => { this.sortChange("invoiceNumber", e) },
                        title: '发票号码',
                    },
                    width,
                    className: 'table_center',
                    dataIndex: 'invoiceNumber',
                    key: 'invoiceNumber',
                    render: this.rowSpan
                }
            )
        } else {
            columns.push({
                title: {
                    name: 'sort',
                    component: 'TableSort',
                    sortOrder: sort.userOrderField == "invoiceNumber" ? sort.order : null,
                    handleClick: (e) => { this.sortChange("invoiceNumber", e) },
                    title: '发票号码',
                },
                width,
                className: 'table_left',
                dataIndex: 'invoiceNumber',
                key: 'invoiceNumber',
                render: (text, record, index) => { return this.renderRowSpanCode(text, record, index, 'invoiceNumber') }
            })
        }

        return columns.find(item => {
            return item.dataIndex == type
            //&&item.isVisible==true
        })

        // return columns
    }

    //跨行 带a链接
    renderRowSpanA = (text, record, index, key, { list }) => {
        const num = this.calcRowSpan(record[checkboxKey], checkboxKey, index, list)
        const obj = {
            children: (
                <span className="ttk-table-app-list-td-con">
                    <a
                        href="javascript:;"
                        onClick={() => this.openMoreContent(record[checkboxKey], key)}
                        className="table-needDel"
                        title={text}
                        data-rol={num}>
                        {text}
                    </a>
                </span>
            ),
            props: {
                rowSpan: num,
            },
        }

        return obj
    }
    //跨行 带a链接
    renderRowSpanCode = (text, record, index, key) => {
        const num = this.calcRowSpan(record[checkboxKey], checkboxKey, index)
        const obj = {
            children: (
                record[checkboxKey] ? <span className="ttk-table-app-list-td-con spell">
                    {/* <a
                            href="javascript:;"
                            onClick={() => this.openMoreContent(record[checkboxKey], key)}
                            className="table-needDel"
                            title={text}
                            data-rol={num}>
                            {text}
                        </a> */}
                    <span style={{ display: 'inline-block', height: '16px', minWidth: '53px' }} title={text}>{text}</span>
                    {
                        record.invoiceTypeId != 4000010900 && record.invoiceTypeId != 4000010010 && record.invoiceTypeName != '农产品销售发票' && !record.authenticated ? <span className='state_box'><Icon className='lanmuicon_wrz' fontFamily='edficon' type="weirenzheng" title="未认证" /></span> : null
                    }
                    {
                        record.invoiceTypeId != 4000010900 && record.invoiceTypeId != 4000010010 && record.invoiceTypeName != '农产品销售发票' && record.authenticated && record.deductible ? <span className='state_box'><Icon className='lanmuicon_ydk' fontFamily='edficon' type="yidikou" title="已抵扣" /></span> : null
                    }
                    {
                        record.invoiceTypeId != 4000010900 && record.invoiceTypeId != 4000010010 && record.invoiceTypeName != '农产品销售发票' && record.authenticated && !record.deductible ? <span className='state_box'><Icon className='lanmuicon_bkd' fontFamily='edficon' type="buyudikou" title="不可抵" /></span> : null
                    }
                    {
                        record.invoiceTypeId != 4000010900 && record.invoiceTypeId != 4000010010 && record.invoiceTypeName == '农产品销售发票' && record.deductible ? <span className='state_box'><Icon className='lanmuicon_ydk' fontFamily='edficon' type="yidikou" title="已抵扣" /></span> : null
                    }
                    {
                        record.invoiceTypeId != 4000010900 && record.invoiceTypeId != 4000010010 && record.invoiceTypeName == '农产品销售发票' && !record.deductible ? <span className='state_box'><Icon className='lanmuicon_bkd' fontFamily='edficon' type="buyudikou" title="不可抵" /></span> : null
                    }

                </span> : null
            ),
            props: {
                rowSpan: num,
            },
        }

        return obj
    }

    //跨行 带a链接
    renderRowSpanSeq = (text, record, index, key) => {
        const num = this.calcRowSpan(record[checkboxKey], checkboxKey, index)
        const obj = {
            children: (
                record[checkboxKey] ? <span className="ttk-table-app-list-td-con">
                    <span className='seq-span'>
                        {text}
                    </span>
                    {
                        record.discarded ? <span className='caogao_box'><Icon className='lanmuicon_feipiao' fontFamily='edficon' type="Voidedinvoice" title="废票" /></span> : null
                    }
                    {/* {
                        record.isDraft && !record.discarded ? <span className='caogao_box'><Icon className='lanmuicon_caogao' fontFamily='edficon' type="fapiaocaogao" title="数据不完整" /></span> : null
                    } */}
                </span> : <span className='heji-span'>
                        合计
                    </span>
            ),
            props: {
                rowSpan: num,
            },
        }

        return obj
    }

    //跨行 处理数字
    rowSpan = (text, record, index, key) => {
        const obj = {
            children: <span className="ttk-table-app-list-td-con"><span title={this.transformThoundsNumber(text, key)}>{this.transformThoundsNumber(text, key)}</span></span>,
            props: {
                rowSpan: this.calcRowSpan(record[checkboxKey], checkboxKey, index),
            },
        }
        return obj
    }

    //不跨行 处理数字 
    normalTdRender = (text, record, index, key) => {
        return <span className="ttk-table-app-list-td-con" title={this.transformThoundsNumber(text, key)}>{this.transformThoundsNumber(text, key)}</span>
    }

    //不跨行 不处理数字 
    normalTdRender2 = (text) => {
        return <span title={text} className="ttk-table-app-list-td-con" title={text}>{text}</span>
    }
    //不跨行 处理数字 带链接
    normalTdRenderA = (text, record, index, key) => {
        return <span className="ttk-table-app-list-td-con">
            <a
                href="javascript:;"
                onClick={() => this.openMoreContent(record[checkboxKey], key)}
                className="table-needDel"
                title={this.transformThoundsNumber(text, key)}
                data-rol={1}>
                {this.transformThoundsNumber(text, key)}
            </a>
        </span>
    }

    //数字的转化
    transformThoundsNumber = (text, key) => {
        const arr = ['quantity', 'amount', 'detailAmount', 'detailTaxInclusiveAmount', 'notSettleAmount', 'price', 'tax', 'taxInclusiveAmount', 'totalAmount', 'totalTax', 'totalTaxInclusiveAmount']
        // text = -0.01
        if (arr.includes(key)) {
            if (!text || parseFloat(text) == 0 || isNaN(parseInt(text))) {
                return ''
            }
            if (key == 'price' || key == 'quantity') {
                return utils.number.format(text, 6)
            } else {
                return utils.number.format(text, 2)
            }
        } else {
            return text
        }
    }

    //对齐方式 货币右对齐 文字左对齐 其他居中
    needAlignType = (key) => {
        const right = ['amount', 'taxInclusiveAmount', 'tax', 'price', 'detailAmount', 'detailTaxInclusiveAmount', 'taxRateName', 'quantity', 'totalAmount', 'totalTax', 'totalTaxInclusiveAmount']
        const left = ['remark', 'supplierName', 'inventoryName', 'invoiceTypeName', 'specification', 'inventoryTypeName', 'invoiceInvName', 'invoiceCode', 'propertyName', 'inventoryRelatedAccountName']
        const center = ['seq', 'voucherSourceName', 'businessDate', 'code', 'invoiceTypeName', 'invoiceNumber', 'settleCodes', 'docCode', 'invoiceDate', 'supplierName']
        let className = right.includes(key) ? 'right' : left.includes(key) ? 'left' : 'center'
        return className
    }
    //是否为民非性质企业（民非性不显示生成凭证）
    notMinfei = () => {
        let accountingStandards = this.metaAction.context.get('currentOrg').accountingStandards;
        return accountingStandards !== 2000020008 && this.component.props.bsgztAccessTaxlist !== 1 ? true : false
    }
    //操作栏目列
    operateCol = (text, record, index) => {

        const { status, ts, docId, uncertDocId } = record;

        const num = this.calcRowSpan(record[checkboxKey], checkboxKey, index)
        const obj = {
            children: (
                record[checkboxKey] ? <span>
                    {(status == ARRIVAL_NotApprove || status == ARRIVAL_Rejected) && this.notMinfei() && <a
                        className={`${record.discarded == true ? 'disabled' : ''}`}
                        onClick={record.discarded == true ? () => { } : () => this.auditModal(record[checkboxKey], ts, record['supplierId'], record['inventoryId'])}
                        href="javascript:;"
                    >
                        <Icon className='lanmuicon_pz' fontFamily='edficon' type="shengchengpingzheng" title="生成凭证" />
                    </a>}
                    {status != ARRIVAL_NotApprove && status != ARRIVAL_Rejected && this.notMinfei() && <a
                        // onClick={() => this.unauditModal(record[checkboxKey], ts)}
                        href="javascript:;"
                    >
                        <Icon className='lanmuicon_scpz' fontFamily='edficon' type="shengchengpingzheng" title="生成凭证" />
                    </a>}
                    {record.discarded == true && this.notMinfei() && <a href="javascript:;">
                        <Icon className='lanmuicon_scpz' fontFamily='edficon' type="shengchengpingzheng" title="生成凭证" />
                        {/* <Icon className='feipiao' fontFamily='edficon' type="feipiao" title="废票" /> */}
                    </a>}
                    <a
                        onClick={() => this.insertProofConfirm(record[checkboxKey])}
                        href="javascript:;"
                    >
                        <Icon className='lanmuicon_bj' fontFamily='edficon' type="bianji" title="编辑" />
                    </a>
                    <a
                        className={`${status != ARRIVAL_NotApprove && status != ARRIVAL_Rejected ? 'disabled' : ''}`}
                        // onClick={() => this.delModal(record[checkboxKey], ts)}
                        onClick={status != ARRIVAL_NotApprove && status != ARRIVAL_Rejected ? () => { } : () => this.delModal(record[checkboxKey], ts, uncertDocId)}
                        href="javascript:;"
                    >
                        <Icon className={`${status != ARRIVAL_NotApprove && status != ARRIVAL_Rejected ? 'lanmuicon_nosc' : 'lanmuicon_sc'}`} fontFamily='edficon' type="shanchu" title="删除" />
                    </a>
                </span> : null
            ),
            props: {
                rowSpan: num,
            },
        }

        return obj
    }

    //生成凭证提示框
    auditModal = async (id, ts, supplierId) => {
        // const _this = this
        const baseUrl = this.metaAction.gf('data.tplus.baseUrl');
        const softAppName = this.metaAction.gf('data.tplus.softAppName');
        //let dataSource = this.metaAction.gf('data.list').toJS()
        if (!supplierId) {
            const queryAchivalAccount = await this.webapi.queryAchivalAccount();
            if (queryAchivalAccount) {
                const confirm = await this.metaAction.modal('confirm', {
                    title: '提示',
                    width: 500,
                    okText: '是',
                    cancelText: '否',
                    content: queryAchivalAccount
                })
                const supplierAccountSet = confirm ? 1 : 0;
                await this.webapi.saveAchivalAccount({ supplierAccountSet });
            }
        }

        if (!baseUrl) {
            // const ret = await this.metaAction.modal('confirm', {
            //     title: '生成凭证',
            //     content: '你确定要生成凭证吗？',
            //     // onOk() {
            //     //     return _this.audit(id, ts)
            //     // },
            //     // onCancel() { }
            // })
            // if (ret) {


            // const ruleRes = await this.webapi.getMatchingRule({ onlyNotMatch: true, arrivalIdList: [id] });
            // if (ruleRes.invoiceInventoryList.length > 0) {
            //     const mappingAccountRes = await this.metaAction.modal('show', {
            //         title: '科目匹配',
            //         width: 920,
            //         children: this.metaAction.loadApp('ttk-scm-mapping-account', {
            //             store: this.component.props.store,
            //             inventoryType: 'arrival',
            //             ruleRes
            //         }),
            //     })
            //     if (mappingAccountRes === 'false') return
            // }

            let param = {}
            let accountEnableDto = {}
            accountEnableDto.entranceFlag = 'arrival'
            param.accountEnableDto = accountEnableDto

            let responseNew = await this.webapi.queryAccountEnable(param)
            let aaa = 'pu'
            if (responseNew.isShow) {
                const resNew = await this.metaAction.modal('show', {
                    title: '生成凭证设置',
                    width: 405,
                    footer: null,
                    bodyStyle: { padding: '15px 0px 0px' },
                    children: this.metaAction.loadApp('ttk-scm-app-subject-card', {
                        store: this.component.props.store,
                        aaa,
                    }),
                })
                if (resNew) {
                    let checkAccountIsUsed = await this.webapi.checkAccountIsUsed({ entranceFlag: 'arrival' })
                    if (checkAccountIsUsed) {
                        const ret = await this.metaAction.modal('confirm', {
                            // title: '',
                            title: '上级科目已存在发生额，新增下级科目会把发生额自动结转到第一个下级科目上，是否继续生成'
                        })
                        if (!ret) {
                            this.metaAction.toast('warning', '请到会计科目中把余额结转到下级科目中，再批量生成凭证')
                            return
                        }
                    }
                }
            } else {
                let checkAccountIsUsed = await this.webapi.checkAccountIsUsed({ entranceFlag: 'arrival' })
                if (checkAccountIsUsed) {
                    const ret = await this.metaAction.modal('confirm', {
                        // title: '',
                        title: '上级科目已存在发生额，新增下级科目会把发生额自动结转到第一个下级科目上，是否继续生成'
                    })
                    if (!ret) {
                        this.metaAction.toast('warning', '请到会计科目中把余额结转到下级科目中，再批量生成凭证')
                        return
                    }
                }
            }


            //存在未匹配存货弹出理票弹框
            const getInvoiceInvMatch = await this.webapi.getInvoiceInvMatch({
                type: 'generateDoc',
                isArrival: true,
                isDelivery: false,
                arrivalIdList: [id],
                deliveryIdList: []
            });

            if (getInvoiceInvMatch.allMatched !== true) {
                return await this.collateInvoice({ data: [{ id, ts }], idList: [id] });
            }

            return this.audit(id, ts)
            //}
        } else {
            // const details = dataSource.filter(o => o.id == id);
            // const inventoryIdList = [];

            // details.forEach(d => {
            //     if (d.inventoryId && inventoryIdList.indexOf(d.inventoryId) == -1) {
            //         inventoryIdList.push(d.inventoryId);
            //     }
            // });

            // let accountEnableDto = {}
            // accountEnableDto.entranceFlag = 'arrival'
            // param.accountEnableDto = accountEnableDto

            // let responseNew = await this.webapi.queryAccountEnable(param)
            // let aaa = 'pu'
            // if (responseNew.isShow) {
            //     const resNew = await this.metaAction.modal('show', {
            //         title: '生成凭证设置',
            //         width: 405,
            //         footer: null,
            //         bodyStyle: { padding: '15px 0px 0px' },
            //         children: this.metaAction.loadApp('ttk-scm-app-subject-card', {
            //             store: this.component.props.store,
            //             aaa,
            //         }),
            //     })
            //     if (resNew) {
            //         let checkAccountIsUsed = await this.webapi.checkAccountIsUsed({ entranceFlag: 'arrival' })
            //         if (checkAccountIsUsed) {
            //             const ret = await this.metaAction.modal('confirm', {
            //                 // title: '',
            //                 title: '上级科目已存在发生额，新增下级科目会把发生额自动结转到第一个下级科目上，是否继续生成'
            //             })
            //             if (!ret) {
            //                 this.metaAction.toast('warning', '请到会计科目中把余额结转到下级科目中，再批量生成凭证')
            //                 return
            //             }
            //         }
            //     }
            // } else {
            //     let checkAccountIsUsed = await this.webapi.checkAccountIsUsed({ entranceFlag: 'arrival' })
            //     if (checkAccountIsUsed) {
            //         const ret = await this.metaAction.modal('confirm', {
            //             // title: '',
            //             title: '上级科目已存在发生额，新增下级科目会把发生额自动结转到第一个下级科目上，是否继续生成'
            //         })
            //         if (!ret) {
            //             this.metaAction.toast('warning', '请到会计科目中把余额结转到下级科目中，再批量生成凭证')
            //             return
            //         }
            //     }
            // }


            //生成T+凭证
            const res = await this.metaAction.modal('show', {
                title: '生成凭证',
                width: 1000,
                okText: '确定',
                footer: null,
                bodyStyle: { padding: '10px 12px' },
                children: this.metaAction.loadApp('ttk-scm-get-voucher-to-tj', {
                    store: this.component.props.store,
                    vatOrEntry: 1,
                    selectedData: [{
                        id,
                        ts
                    }],
                    baseUrl,
                    softAppName,
                    //  supplierIdList: supplierId ? [supplierId] : [],//供应商IDlist
                    //  inventoryIdList,//存货IDlist
                    arrivalIdList: [id]
                }),
            })
            if (res) {

            }
            let { checkboxValue, selectedOption } = this.metaAction.gf('data.tableCheckbox').toJS()

            checkboxValue = checkboxValue.filter(item => item != id)
            selectedOption = selectedOption.filter(item => item.id != id)
            this.injections.reduce('update', {
                path: 'data.tableCheckbox',
                value: {
                    checkboxValue: checkboxValue,
                    selectedOption: selectedOption
                }
            })
            this.sortParmas()
        }
    }
    //生成凭证
    audit = async (id, ts) => {
        const baseUrl = this.metaAction.gf('data.tplus.baseUrl');
        const softAppName = this.metaAction.gf('data.tplus.softAppName');
        if (baseUrl) {
            const res1 = await this.webapi.audit({
                id,
                ts
            });
            let params = [];
            if (res1) {
                params.push(JSON.parse(res1.message))
            } else {
                this.metaAction.toast('error', '生成凭证失败')
                return
            }
            let options = {
                headers: {
                    token: this.getOrgId()
                }
            }
            let url = `${baseUrl}/common/doc/createBatch`;
            //生成t+凭证
            const res = await this.webapi.tplus.common(url, params, options);
            if (res && res.error) {
                this.metaAction.toast('error', `${res.error.message}`);
                return
            } else if (res && res.result && res.value.allSuccess) {
                const re = await this.webapi.tplus.auditUpdate(
                    {
                        id,
                        ts
                    }
                )
                if (re) {
                    this.metaAction.toast('success', '生成凭证成功')
                } else {
                    this.metaAction.toast('error', '生成凭证失败')
                    return
                }
            } else {
                this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
                return
            }
            let { checkboxValue, selectedOption } = this.metaAction.gf('data.tableCheckbox').toJS()

            checkboxValue = checkboxValue.filter(item => item != id)
            selectedOption = selectedOption.filter(item => item.id != id)
            this.injections.reduce('update', {
                path: 'data.tableCheckbox',
                value: {
                    checkboxValue: checkboxValue,
                    selectedOption: selectedOption
                }
            })
            this.sortParmas()
        }
        else {
            const res = await this.webapi.audit({
                id,
                ts
            })
            if (res) {
                this.metaAction.toast('success', '生成凭证成功')
            }
            let { checkboxValue, selectedOption } = this.metaAction.gf('data.tableCheckbox').toJS()

            checkboxValue = checkboxValue.filter(item => item != id)
            selectedOption = selectedOption.filter(item => item.id != id)
            this.injections.reduce('update', {
                path: 'data.tableCheckbox',
                value: {
                    checkboxValue: checkboxValue,
                    selectedOption: selectedOption
                }
            })
            this.sortParmas()
        }

    }
    //删除凭证提示框
    unauditModal = async (id, ts) => {
        const _this = this
        const ret = await this.metaAction.modal('confirm', {
            title: '删除凭证',
            content: '确定删除该凭证？'
        })


        if (ret) {
            return _this.unaudit(id, ts)
        }
    }
    //删除凭证
    unaudit = async (id, ts) => {
        const res = await this.webapi.unaudit({
            id,
            ts
        })
        if (res) {
            this.metaAction.toast('success', '删除凭证成功')
        }
        let { checkboxValue, selectedOption } = this.metaAction.gf('data.tableCheckbox').toJS()

        checkboxValue = checkboxValue.filter(item => item != id)
        selectedOption = selectedOption.filter(item => item.id != id)
        this.injections.reduce('update', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: checkboxValue,
                selectedOption: selectedOption
            }
        })
        this.sortParmas()
    }

    /***********--endDate--********* */

    // 设置表格固定高度
    // renderDid = ()=>{
    //     try{
    //         let container = document.getElementsByClassName('ttk-table-app-list')[0].offsetHeight
    //         let footer = document.getElementsByClassName('ttk-table-app-list-footer')[0].offsetHeight
    //         let header = document.getElementsByClassName('mk-search')[0].offsetHeight
    //         let tableHeader = document.getElementsByClassName('ant-table-header')[0].offsetHeight
    //         // 20是padding值
    //         let height = container - header - footer - tableHeader - 20
    //         let prevHeight = this.metaAction.gf('data.tableOption.y')
    //         if( prevHeight == height ){
    //             return
    //         }
    //         // this.injections.reduce('setTableScroll', height)
    //     }catch(err){
    //       
    //     }
    // }

    //获取简单查询条件的值
    getNormalSearchValue = () => {
        let data = this.metaAction.gf('data.searchValue').toJS()
        let date = [data.beginDate, data.endDate]
        // return { date, simpleCondition: data.simpleCondition }
        return { date }
    }

    combineColumnProp = (data) => {
        if (!data) return []
        let newDataArray = []
        data.forEach((ele, index) => {
            newDataArray.push({
                "isVisible": ele.isVisible,
                "id": ele.id,
                'ts': ele.ts
            })
        })

        return newDataArray
    }

    closeTableSetting = () => {
        this.injections.reduce('tableSettingVisible', { value: false })
    }
    resetTableSetting = async () => {
        const code = this.metaAction.gf('data').toJS().other.code
        //重置栏目
        let res = await this.webapi.reInitByUser({ code: code })
        await this.sortParmas(null, null, null, 'init')
        const data = this.metaAction.gf('data').toJS()
        this.injections.reduce('settingOptionsUpdate', { visible: false, data: data.other.columnDto })

    }
    showTableSetting = async ({ value, data }) => {
        /**
         * 更新栏目
         */
        const code = this.metaAction.gf('data').toJS().other.code
        this.injections.reduce('update', {
            path: 'data.showTableSetting',
            value: false
        })
        const preData = this.metaAction.gf('data.other.columnDto')
        if (value === false) {
            this.injections.reduce('update', {
                path: 'data.other.columnDto',
                value: data
            })
            const columnSolution = await this.webapi.findByParam({ code: code })
            if (columnSolution) {
                let columnSolutionId = columnSolution.id
                const ts = this.metaAction.gf('data.other.ts')
                const columnDetail = await this.webapi.updateWithDetail({
                    "id": columnSolutionId,
                    "columnDetails": this.combineColumnProp(data),
                    ts: ts
                })
                if (columnDetail) {
                    //一般纳税人的发票号码后要加状态图标
                    if (this.metaAction.context.get("currentOrg").vatTaxpayer != 2000010002) {
                        let colu = columnDetail.columnDetails.find(item => item.fieldName == 'invoiceNumber')
                        let width = colu.width;
                        let index = fromJS(columnDetail.columnDetails).indexOf(fromJS(colu));
                        columnDetail.columnDetails[index].width = width + 38;
                    }
                    let list = this.metaAction.gf('data.list').toJS();
                    let hasDraft = false;
                    list.forEach(item => {
                        if (/*item.isDraft ||*/  item.discarded) {
                            hasDraft = true
                        }
                    })
                    if (hasDraft) {
                        columnDetail.columnDetails[0].width = columnDetail.columnDetails[0].width + 24.41;
                    }
                    this.injections.reduce('settingOptionsUpdate', { visible: value, data: columnDetail.columnDetails })
                } else {
                    this.metaAction.sf('data.other.columnDto', preData)
                }
            } else {
                this.metaAction.sf('data.other.columnDto', preData)
            }
        }
        else {
            this.injections.reduce('tableSettingVisible', { value, data: data })
        }
    }
    resizeEnd = async (params) => {
        const code = this.metaAction.gf('data').toJS().other.code;
        params.code = code;
        let columnDto = this.metaAction.gf('data.other.columnDto').toJS()
        columnDto = columnDto.filter((item) => item.isVisible === false).map(obj => {
            return {
                fieldName: obj.fieldName,
                isVisible: false,
                width: obj.width,
            }
        })
        params.columnDetails = params.columnDetails.concat(columnDto)
        let res = await this.webapi.batchUpdate(params)
        this.metaAction.sf('data.other.columnDto', fromJS(res[0].columnDetails))
    }
    //初始化选择时间
    initDate = async () => {
        if (!this.changeSipmleDate) {
            const res = await this.webapi.getDisplayDate() //获取启用日期
            res.displayDate = '2016-01-01'
            res.enabledDate = '2016-01-01'

            this.injections.reduce('updateArr', [
                {
                    path: 'data.searchValue.beginDate',
                    value: utils.date.transformMomentDate(res.displayDate)
                },
                {
                    path: 'data.searchValue.endDate',
                    value: utils.date.transformMomentDate(res.displayDate)
                },
                {
                    path: 'data.other.enableddate',
                    value: utils.date.transformMomentDate(res.enabledDate)
                }
            ])
        }
        this.injections.reduce('tableLoading', false)
    }

    // 高级搜索确定时简单搜索条件清除
    searchValueChange = (value) => {
        // console.log('触发高级搜索');
        let newArr = [value.beginDate, value.endDate]
        this.matchDateRange(newArr)

        let prevValue = this.metaAction.gf('data.searchValue').toJS()
        //时间是必填项不可清空
        value.beginDate = !value.beginDate ? moment().startOf('month') : value.beginDate;
        value.endDate = !value.endDate ? moment().endOf('month') : value.endDate;

        this.injections.reduce('searchUpdate', { ...prevValue, ...value })
        const pages = this.metaAction.gf('data.pagination').toJS()
        this.sortParmas({ ...prevValue, ...value }, { ...pages, 'currentPage': 1 })

        this.changeSipmleDate = true
    }

    getCurrentOrg = () => this.metaAction.context.get('currentOrg') || {}

    getOrgId = () => {
        const org = this.getCurrentOrg()
        if (org) {
            return org.id;
        }
        return ""
    }
    // renderCheckBox = () => {
    //     return (
    //         <Checkbox.Group className="app-proof-of-list-accountQuery-search-checkbox">
    //             <Checkbox value="1">仅显示异常数据</Checkbox>
    //         </Checkbox.Group>
    //     )
    // }
    // 处理搜索参数
    sortParmas = (search, pages, order, type, noInitDate) => {
        if (!search) {
            search = this.metaAction.gf('data.searchValue').toJS()
        }
        if (!pages) {
            pages = this.metaAction.gf('data.pagination').toJS()
        }
        if (!order) {
            let sort = this.metaAction.gf('data.sort').toJS();
            if (sort.order) {
                order = [{
                    name: sort.userOrderField,
                    asc: sort.order == 'asc' ? true : false
                }]
            } else {
                order = [
                    {
                        name: "code",
                        asc: false
                    }
                ]
            }

        }
        // if (Array.isArray(order) && order.length == 0) {
        //     order = null
        // }
        if (search.authenticated == 1) {
            //已认证
            search.authenticated = true
            delete search.deductible
        }
        else if (search.authenticated == 2) {
            //已抵扣
            search.deductible = true
            delete search.authenticated
        } else if (search.authenticated == 3) {
            //未认证
            search.authenticated = false
            delete search.deductible
        } else if (search.authenticated == 4) {
            //不予抵扣
            search.deductible = false
            search.authenticated = true
        } else {
            //全部
            search.deductible = null
            search.authenticated = null
        }

        if (search.beginDate) {
            search.beginDate = this.metaAction.momentToString(search.beginDate, 'YYYY-MM-DD')
        }
        if (search.endDate) {
            search.endDate = this.metaAction.momentToString(search.endDate, 'YYYY-MM-DD')
        }
        if (search.authenticatedMonth) {
            search.authenticatedMonth = this.metaAction.momentToString(search.authenticatedMonth, 'YYYY-MM')
        } else if (this.notXgm()) {
            search.authenticatedMonth = null
        }

        let { supplierName = null, propertyId = null, invoiceTypeId = null, invoiceNumber = null, accountStatus = null, authenticated, deductible, isDraft, authenticatedMonth, taxRateId = null, inventoryName = null, taxInclusiveAmountStr = null } = search;
        if (invoiceNumber == '') {
            invoiceNumber = null
        }
        // if (isDraft && isDraft[0]) {
        //     isDraft = true;
        // } else {
        //     isDraft = null
        // }
        try {
            taxInclusiveAmountStr = Number(taxInclusiveAmountStr.replace(/,/g, '')) || taxInclusiveAmountStr
        } catch (e) {
            taxInclusiveAmountStr = taxInclusiveAmountStr
        }
        const entity = {
            supplierName,
            propertyId,
            invoiceTypeId,
            invoiceNumber,
            accountStatus,
            authenticated,
            deductible,
            // isDraft,
            authenticatedMonth,
            taxRateId,
            inventoryName,
            taxInclusiveAmountStr
        };

        const searchValue = utils.sortSearchOption(search, null, ['supplierName', 'propertyId', 'invoiceTypeId', 'invoiceNumber', 'accountStatus', 'authenticated', 'deductible', 'isDraft', 'authenticatedMonth', 'taxRateId', 'inventoryName', 'taxInclusiveAmountStr']);
        searchValue.entity = entity;
        const page = utils.sortSearchOption(pages, null, ['total', 'totalCount', 'totalPage']);

        if (type == 'get') {
            //获取所有参数
            return { ...searchValue, orders: order }
        }
        if (type == 'init') {
            //初始化数据
            this.initData({ ...searchValue, page, orders: order, isInit: true }, noInitDate)
        }
        else {
            //查询数据
            // let isArray = Array.isArray(order)
            // let newOrder = []
            // if (!isArray) {
            //     order = newOrder.push(order)
            // } else {
            //     newOrder = order
            // }
            this.requestData({ ...searchValue, page, orders: order, isInit: false })
        }

    }

    initData = async (params) => {
        const supplier = await this.webapi.supplier();//查询供应商
        const response = await this.webapi.init(params);
        const baseUrl = this.metaAction.gf('data.tplus.baseUrl');
        let arrT = []
        for (var i = 0; i < response.list.length; i++) {
            if (response.list[i].docId && response.list[i].docSourceTypeName && response.list[i].docSourceTypeName != '系统凭证' && baseUrl) {
                arrT.push(response.list[i].docId)
            }
        }
        if (arrT.length) {
            const restplus = await this.webapi.tplus.common(`${baseUrl}/common/doc/externalDocQuery`,
                arrT
                , {
                    headers: {
                        token: this.getOrgId()
                    }
                })
            if (restplus.result) {
                for (var i = 0; i < response.list.length; i++) {
                    for (var x = 0; x < restplus.value.length; x++) {
                        if (response.list[i].docId == restplus.value[x].externalCode) {
                            response.list[i].docCode = '记-' + restplus.value[x].code
                        }
                    }
                }
            }
        }
        this.injections.reduce('tableLoading', false)
        // const hasOpend = this.metaAction.gf('data.other.hasOpend');
        if (response) {
            //一般纳税人的发票号码后要加状态图标
            if (this.metaAction.context.get("currentOrg").vatTaxpayer != 2000010002) {
                let colu = response.column.columnDetails.find(item => item.fieldName == 'invoiceNumber')
                let width = colu.width;
                let index = fromJS(response.column.columnDetails).indexOf(fromJS(colu));
                response.column.columnDetails[index].width = width + 38;
            }
        }
        this.injections.reduce('load', { response, isInit: true, supplier: supplier.list })
        setTimeout(() => {
            this.getTableScroll()
        }, 0)
    }

    requestData = async (params) => {
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.injections.reduce('tableLoading', true)
        }
        //        const supplier = await this.webapi.supplier();//查询供应商

        const response = await this.webapi.init(params)
        const baseUrl = this.metaAction.gf('data.tplus.baseUrl');
        let arrT = []
        for (var i = 0; i < response.list.length; i++) {
            if (response.list[i].docId && response.list[i].docSourceTypeName && response.list[i].docSourceTypeName != '系统凭证' && baseUrl) {
                arrT.push(response.list[i].docId)
            }
        }
        if (arrT.length) {
            const restplus = await this.webapi.tplus.common(`${baseUrl}/common/doc/externalDocQuery`,
                arrT
                , {
                    headers: {
                        token: this.getOrgId()
                    }
                })
            if (restplus.result) {
                for (var i = 0; i < response.list.length; i++) {
                    for (var x = 0; x < restplus.value.length; x++) {
                        if (response.list[i].docId == restplus.value[x].externalCode) {
                            response.list[i].docCode = '记-' + restplus.value[x].code
                        }
                    }
                }
            }
        }
        this.injections.reduce('tableLoading', false)
        this.injections.reduce('load', { response, isInit: false })
        setTimeout(() => {
            this.getTableScroll()
        }, 0)
    }

    //日期区间发生改变
    dateRangeChange = (key) => {
        let beginDate = this.metaAction.gf('data.searchValue.beginDate'),
            endDate = this.metaAction.gf('data.searchValue.endDate'),
            proper = this.metaAction.gf('data.other.proper');
        switch (key) {
            case 'all':
                break;
            case 'today':
                beginDate = moment()
                endDate = moment()
                break;
            case 'yesterday':
                beginDate = moment().subtract(1, "days")
                endDate = moment().subtract(1, "days")
                break;
            case 'thisWeek':
                beginDate = moment().startOf('week')
                endDate = moment().endOf('week')
                break;
            case 'lastWeek':
                beginDate = moment().startOf('week').subtract(7, "days")
                endDate = moment().endOf('week').subtract(7, "days")
                break;
            case 'thisMonth':
                beginDate = moment().startOf('month')
                endDate = moment().endOf('month')
                break;
            case 'lastMonth':
                beginDate = moment().subtract(1, "months").startOf('month')
                endDate = moment().subtract(1, "months").endOf('month')
                break;
            case 'thisYear':
                beginDate = moment().startOf('year')
                endDate = moment().endOf('year')
                break;
            default:

        }

        //改变日期 清除高级搜索条件
        this.injections.reduce('dateRangeChange',
            {
                'data.other.dateRangeKey': key,
                'data.searchValue.beginDate': beginDate,
                'data.searchValue.endDate': endDate,
                'data.searchValue.invoiceNumber': null,
                'data.searchValue.propertyId': null,
                'data.searchValue.invoiceTypeId': null,
                'data.searchValue.accountStatus': null,
                'data.searchValue.authenticated': proper === '0' ? 1 : null,
                //'data.searchValue.supplierId': null,
                'data.searchValue.authenticatedMonth': null,
            })
        this.sortParmas()
    }

    //排序发生变化
    sortChange = (key, value) => {
        let params = {
            'userOrderField': value == false ? null : key,
            'order': value == false ? null : value
        }
        let params2 = [
            {
                name: "code",
                asc: false
            }
        ]
        if (value) {
            params2 = [{
                'name': key,
                'asc': value == 'asc' ? true : false
            }]
        }
        //  this.metaAction.sf('data.other.asc', params2.asc)  // 记录排序
        const pages = this.metaAction.gf('data.pagination').toJS()
        this.sortParmas(null, { ...pages, 'currentPage': 1 }, params2)
        this.injections.reduce('sortReduce', params)

        // 清空选择项，防止顺序错乱
        this.injections.reduce('update', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: [],
                selectedOption: []
            }
        })
    }
    //分页发生变化
    pageChanged = (current, pageSize) => {
        let page = this.metaAction.gf('data.pagination').toJS()

        const len = this.metaAction.gf('data.list').toJS().length
        if (pageSize) {
            page = {
                ...page,
                'currentPage': len == 0 ? 1 : current,
                'pageSize': pageSize
            }
        } else {
            page = {
                ...page,
                'currentPage': len == 0 ? 1 : current
            }
        }
        this.injections.reduce('update', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: [],
                selectedOption: []
            }
        })
        // this.load({ current, pageSize })
        this.sortParmas(null, page)
    }

    checkboxChange = (arr, itemArr) => {
        let { add, sub, mul, div } = utils.calculate;//加减乘除
        itemArr = itemArr.filter(o => o);
        let totalAmount = 0;
        let totalTax = 0;
        let newArr = itemArr.map(item => {
            totalAmount = add(totalAmount, item.totalAmount)
            totalTax = add(totalTax, item.totalTax)
            return item.id
        })
        let obj = {
            'data.statistics': fromJS({
                count: itemArr.length,
                totalAmount: utils.number.format(totalAmount, 2),
                totalTax: utils.number.format(totalTax, 2),
            }),
            'data.tableCheckbox': fromJS({
                checkboxValue: newArr,
                selectedOption: itemArr
            })
        }
        this.metaAction.sfs(obj);
    }

    getChildVoucherItems = () => {
        return;
    }

    // 指定table 以什么字段作为key值
    renderRowKey = (record) => {
        return record[checkboxKey]
    }

    tableOnchange = async (pagination, filters, sorter) => {
        // const { checkboxKey, order } = sorter
        // const response = await this.webapi.report.query(sorter)
        // this.injections.reduce('tableOnchange', response.value.details)
    }

    rowSelection = (text, row, index) => {
        return undefined
    }

    //批量结算
    // settleBatchClick = async () => {

    //     const selectedOption = this.getNewData()
    //     if (selectedOption.length == 0) {
    //         this.metaAction.toast('error', '请选择您要审核的数据!')
    //         return
    //     }
    //     //结算金额
    //     let flag = false
    //     let notSettleAmount = 0;//未结算金额
    //     let list = selectedOption.map(item => {
    //         if (item.settledStatusId == 0) {
    //             flag = true;
    //             notSettleAmount += item.taxInclusiveAmount
    //         }
    //         return item.id;
    //     })
    //     if (!flag) {
    //         this.metaAction.toast('warn', '当前没有可结算的数据!')
    //         return
    //     }
    //     //list = this.delRepeat(list, 'id');
    //     list = this.dedupe(list);//数组去重
    //     const ret = await this.metaAction.modal('show', {
    //         title: '批量结算',
    //         width: 500,
    //         okText: '确定',
    //         children: this.metaAction.loadApp('ttk-scm-app-invoice-settle', {
    //             store: this.component.props.store,
    //             submitSettle: async (bankAccountId, sum) => {
    //                 return await this.webapi.settlement({ vatOrEntry: 0, bankAccountId, sum, list });
    //             },
    //             notSettleAmount
    //         }),
    //     })

    //     if (ret) {
    //         this.metaAction.toast('success', '批量结算成功')
    //         this.injections.reduce('update', {
    //             path: 'data.tableCheckbox',
    //             value: {
    //                 checkboxValue: [],
    //                 selectedOption: []
    //             }
    //         })
    //         // 重新请求列表数据
    //         this.sortParmas()
    //     }
    // }

    //点击一键采集
    oneKeyCollectClick = async () => {

        let hasReadSJInfo = await this.webapi.hasReadSJInfo({})
        if (!hasReadSJInfo) {
            // 打开企业信息中的纳税申报设置界面
            this.showPayTaxInfoSetPage()
        } else {
            const areaRule = this.metaAction.context.get('areaRule') //获取全局的启用日期
            if (areaRule && !areaRule.isGetInvoice) {
                this.metaAction.toast('error', '绑定的省市暂不支持采集发票')
            } else {
                //判断是否弹出温馨提示
                const tip = await this.webapi.getNoDisplay();
                if (tip.noDisplaySet === 1) {
                    this.onCollectModal();
                } else {
                    const tip = await this.webapi.getNoDisplay();
                    const { id, ts } = tip;
                    this.showTip(id, ts);
                }
            }
        }
    }
    showPayTaxInfoSetPage = async () => {
        const ret = await this.metaAction.modal('show', {
            height: 325,
            width: 440,
            //closable: false,
            okText: '设置',
            title: '纳税设置',
            wrapClassName: 'invoice-paytaxinfo-tip',
            children: this.getSetContent(),
        })

        if (ret == true) {
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent('企业信息', 'edfx-app-org', { initData: { activeKey: '1' } })
        }
    }

    getSetContent = () => {
        return <div>
            <p className='jinggao'><Icon type="jinggao" fontFamily='edficon' /><span>请先设置网报帐号，并确认您的纳税人信息！</span></p >
        </div>
    }

    //点击生成单据
    generateDocumentClick = async () => {
        let loading = this.metaAction.gf('data.loading')
        if (loading) {
            return
        }
        const selectedOption = this.getNewData()
        if (selectedOption.length == 0) {
            this.metaAction.toast('error', '请选择您要生成单据的数据')
            return
        }
        let flag = false
        let data = selectedOption.map(item => {
            if (item.flag == 0) {
                flag = true
            }
        })
        if (!flag) {
            return this.metaAction.toast('warn', '当前无可生单的数据')
        }
        this.injections.reduce('tableLoading', true);
        const res = await this.webapi.generateDocument(selectedOption)
        this.injections.reduce('tableLoading', false);
        if (res) {
            this.metaAction.toast('success', '生成单据成功')
            //清空选中
            this.injections.reduce('update', {
                path: 'data.tableCheckbox',
                value: {
                    checkboxValue: [],
                    selectedOption: []
                }
            })
            // 重新请求列表数据
            this.sortParmas()

        }
    }

    //打印
    print = async () => {

        let ret, form
        let _this = this
        const list = this.metaAction.gf('data.list').toJS()
        if (list.length == 0) {
            this.metaAction.toast('warn', '当前没有可打印数据')
            return
        }
        const {
            height,
            maxLineNum,
            printAuxAccCalc,
            type,
            width
        } = await this.webapi.docManage.getPrintConfig();

        this.metaAction.modal('show', {
            title: '打印',
            width: 400,
            footer: null,
            iconType: null,
            okText: '打印',
            className: 'mk-ttk-table-app-list-modal-container',
            // footer: null,
            children: <PrintOption
                height={height}
                maxLineNum={maxLineNum}
                printAuxAccCalc={printAuxAccCalc}
                type={type}
                width={width}
                callBack={_this.submitPrintOption}
            />
        })
    }

    //导出
    export = async () => {
        const params = this.sortParmas(null, null, null, 'get')
        const list = this.metaAction.gf('data.list').toJS()
        if (list.length == 0) {
            this.metaAction.toast('warn', '当前没有可导出的数据')
            return
        }
        // params.docIdsStr = this.getPrintDocId()
        const res = await this.webapi.export(params)
        /*
        const res = await new Promise((reslove, reject) => {
            setTimeout(() => {
                reslove('导出成功！')
            }, 500)
        })*/
        // this.metaAction.toast('success', '导出成功！')
    }

    //获取选中明细
    getNewData = () => {
        const checkboxValue = this.metaAction.gf('data.tableCheckbox.checkboxValue').toJS()
        const list = this.metaAction.gf('data.list').toJS()
        let arr = []
        list.map(item => {
            if (checkboxValue.includes(item[checkboxKey])) {
                arr.push(item)
            }
        })
        return arr
    }

    //
    getInsertItem = () => {
        const checkboxValue = this.metaAction.gf('data.tableCheckbox.checkboxValue').toJS()
        const list = this.metaAction.gf('data.list').toJS()
        let index = list.find(item => {
            return checkboxValue.includes(item[checkboxKey])
        })
        return index
    }

    //数组去重
    dedupe = (array) => {
        return Array.from(new Set(array));
    }


    //去重
    delRepeat = (data, id) => {
        //
        const arr = new Map()
        data.forEach(item => {
            if (!arr.has(item[id])) {
                arr.set(item[id], item)
            }
        })

        const sum = []
        for (let value of arr.values()) {
            sum.push(value)
        }
        return sum
    }

    //删除进项发票
    delete = async (id, ts) => {
        const res = await this.webapi.delete({
            id,
            ts
        })
        if (res) {
            this.metaAction.toast('success', '删除成功')
        }
        let { checkboxValue, selectedOption } = this.metaAction.gf('data.tableCheckbox').toJS()

        checkboxValue = checkboxValue.filter(item => item != id)
        selectedOption = selectedOption.filter(item => item.id != id)
        this.injections.reduce('update', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: checkboxValue,
                selectedOption: selectedOption
            }
        })
        this.sortParmas()
    }

    //删除提示框
    delModal = async (id, ts, uncertDocId) => {
        const _this = this;
        let content = '确认删除？'
        if (uncertDocId) {
            content = '删除凭证会同时删除跨月认证对应的进项税额凭证，是否删除?'
        }
        const ret = await this.metaAction.modal('confirm', {
            title: '删除',
            content
            // onOk() {
            //     return _this.delete(id, ts)
            // },
            // onCancel() { }
        })

        if (ret) {
            return _this.delete(id, ts)
        }
    }
    openDocContent = async (id, text, name) => {
        if (id && name && name != '系统凭证') {
            // const code = text.replace(/[已生成|凭证]/g, '');
            this.metaAction.toast('error', `请在${name}凭证管理查看生成的凭证`)
        } else {
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent(
                    '填制凭证',
                    'app-proof-of-charge',
                    { accessType: 1, initData: { id } }
                )
        }
    }
    openMoreContent = async (id, key) => {

        if (key == 'code') {
            this.insertProofConfirm(id);
        } else if (key == 'settleCodes') {

            this.component.props.setPortalContent &&
                this.component.props.setPortalContent(
                    '付款单',
                    'ttk-scm-app-payment-card',
                    { accessType: 1, id }
                )
        }

    }

    // rangePickerClick = () => {
    //     this.injections.reduce('update', {
    //         path: 'data.showPicker',
    //         value: true
    //     })
    // }

    normalSearchDateChange = (value) => {
        //点击日期选择框时
        // console.log('简单搜索改变日期')
        this.changeSipmleDate = true
    }

    matchDateRange = (value) => {
        let beginDate = value[0].format('YYYYMMDD'), endDate = value[1].format('YYYYMMDD')
        let dateRangeKey = null;
        if (beginDate == moment().format('YYYYMMDD') && endDate == moment().format('YYYYMMDD')) {
            dateRangeKey = 'today'
        } else if (beginDate == moment().subtract(1, "days").format('YYYYMMDD') && endDate == moment().subtract(1, "days").format('YYYYMMDD')) {
            dateRangeKey = 'yesterday'
        }
        else if (beginDate == moment().startOf('week').format('YYYYMMDD') && endDate == moment().endOf('week').format('YYYYMMDD')) {
            dateRangeKey = 'thisWeek'
        }
        else if (beginDate == moment().startOf('month').format('YYYYMMDD') && endDate == moment().endOf('month').format('YYYYMMDD')) {
            dateRangeKey = 'thisMonth'
        }
        else if (beginDate == moment().subtract(1, "months").startOf('month').format('YYYYMMDD') && endDate == moment().subtract(1, "months").endOf('month').format('YYYYMMDD')) {
            dateRangeKey = 'lastMonth'
        }
        else {
            dateRangeKey = 'custom'
        }
        this.injections.reduce('update', { path: 'data.other.dateRangeKey', value: dateRangeKey })
        //  this.metaAction.sf('data.other.dateRangeKey', dateRangeKey);
    }

    // showPickerDidMount = () => {
    //     this.dateDom = document.getElementsByClassName('ttk-table-app-list-date-picker')[0]
    //     if( !this.dateDom ) {
    //         setTimeout(()=>{
    //             this.showPickerDidMount()
    //         }, 50)
    //         return
    //     }
    //     this.dateDom.addEventListener('click', this.rangePickerClick, false)
    // }

    //简单搜索条件改变 日期+输入框 没有输入框时不执行
    normalSearchChange = (path, value, initSearchValue, type) => {
        //console.log('触发简单搜索');
        // this.injections.reduce('normalSearchChange', { path, value })
        let proper = this.metaAction.gf('data.other.proper');

        let params = this.metaAction.gf('data.searchValue').toJS()
        if (initSearchValue) {
            params = { ...params, ...initSearchValue }
        }
        if (path == 'date') {
            params.beginDate = value[0]
            params.endDate = value[1]
            this.matchDateRange(value);
        } else {
            params[path] = value
        }
        if (proper === '0') {
            params['authenticated'] = 1
        }
        this.injections.reduce('searchUpdate', params)
        const pages = this.metaAction.gf('data.pagination').toJS()
        this.sortParmas(params, { ...pages, 'currentPage': 1 })
        this.changeSipmleDate = true
    }


    getPrintDocId = () => {
        const selectedOption = this.metaAction.gf('data.tableCheckbox.selectedOption').toJS()
        if (selectedOption.length == 0) {
            return ''
        }
        let arr = selectedOption.map(item => {
            return item[checkboxKey]
        })
        return arr.join(',')
    }

    submitPrintOption = async (form, target) => {
        // 
        this.metaAction.toast('warn', '功能暂未实现')
        // let params = this.sortParmas(null, null, null, 'get')
        // delete params.page
        // let option = {
        //     "type": parseInt(form.state.value),
        //     "printAuxAccCalc": form.state.printAccountChecked,
        //     "docIdsStr": this.getPrintDocId()
        // }
        // if(form.state.value == "0"){
        //     Object.assign(option,{"maxLineNum": form.state.pageSize},params)
        // }else if(form.state.value == "2"){
        //     Object.assign(option,{"height": form.state.height, "width": form.state.width},params)
        // }else {
        //     Object.assign(option,params)
        // }
        // let res = await this.webapi.print(option)
    }

    //检查搜索条件
    checkSearchValue = (value, form) => {
        let flagCode = this.checkSearchValueCode(value, form)
        return flagCode
    }



    /**
     * current 每个月份
     * pointTime 指定比较的时间
     * type 'pre' 前 'next' 后
     * return 返回 true 代表禁用
     */
    disabledDate = (current, pointTime, type) => {
        let enableddate = this.metaAction.gf('data.other.enableddate');//起始时间
        let endEnableDate = moment();//结束时间

        let currentMonth = this.transformDateToNum(current)
        let pointTimeMonth = this.transformDateToNum(pointTime)

        if (type == 'pre') {
            if (!enableddate) {
                return currentMonth > pointTimeMonth
            } else {
                return currentMonth > pointTimeMonth || currentMonth < this.transformDateToNum(enableddate)
            }
        } else {
            return currentMonth < pointTimeMonth
            // || currentMonth > this.transformDateToNum(endEnableDate)
        }

    }

    transformDateToNum = (date) => {
        if (!date) return 0
        let time = date
        if (typeof date == 'string') {
            time = utils.date.transformMomentDate(date)
        }
        // return parseInt(`${time.year()}${time.month() < 10 ? `0${time.month()}` : `${time.month()}`}${time.date() < 10 ? `0${time.date()}` : `${time.date}`}`)
        return parseInt(time.format('YYYYMMDD'))
    }

    disabledRangePicker = (current) => {
        //  const { enabledMonth, enabledYear } = this.metaAction.context.get('currentOrg')
        let enableddate = this.metaAction.gf('data.other.enableddate');//起始时间
        let currentMonth = this.transformDateToNum(current)
        let pointTimeMonth = this.transformDateToNum(pointTime)

        if (type == 'pre') {
            if (enableddate) {
                let enableddateMonth = this.transformDateToNum(enableddate)
                return currentMonth > moment().format('YYYYMMDD') || currentMonth < enableddateMonth
            } else {
                return currentMonth > moment().format('YYYYMMDD')
            }
        } else {
            return currentMonth < pointTimeMonth || currentMonth > moment().format('YYYYMMDD')
        }

        // return true
    }

    // normalSelectDate = () => {
    //     const showPicker = this.metaAction.gf('data.showPicker')
    //     if( showPicker ){
    //         this.injections.reduce('update',{
    //             path: 'data.showPicker',
    //             value: false
    //         })
    //     }
    //     const params = this.metaAction.gf('data.searchValue').toJS()
    //     this.injections.reduce('searchUpdate', params)
    //     const pages = this.metaAction.gf('data.pagination').toJS()
    //     this.sortParmas(params, { ...pages, 'currentPage': 1 })
    // }

    // renderDatePickerExtraFooter = () => {
    //     return (
    //         <Button type="primary" style={{ float: 'right' }} size='small' onClick={this.normalSelectDate}>确定</Button>
    //     )
    // }

    // filterOptionSummary = (input, option) => {
    //     if (option && option.props && option.props.label) {
    //         return option.props.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
    //     }

    //     return true
    // }
    //支持搜索
    filterOptionSummary = (input, option, name) => {
        if (!option || !option.props || !option.props.label) {
            return false
        }
        return (option.props.label.toLowerCase().indexOf(input.toLowerCase()) >= 0)
            || (option.props.helpCode && option.props.helpCode.toLowerCase().indexOf(input.toLowerCase()) >= 0)
            || (option.props.helpCodeFull && option.props.helpCodeFull.toLowerCase().indexOf(input.toLowerCase()) >= 0)
    }

    componentWillUnmount = () => {
        // if (this.dateDom) {
        //     this.dateDom.removeEventListener('click', this.rangePickerClick)
        // }
        if (this.props && this.props.isFix === true) return
        const win = window
        if (win.removeEventListener) {
            win.removeEventListener('resize', this.onResize, false)
        } else if (win.detachEvent) {
            win.detachEvent('onresize', this.onResize)
        } else {
            win.onresize = undefined
        }
    }

    handleSearch = () => {
        this.sortParmas()
    }

    handleOnChange = (e, name) => {

        // let searchValue = this.metaAction.gf('data.searchValue').toJS()
        let value = name === 'taxRateId' ? e : e.target.value || null
        if (typeof value === 'string') value = value.trim();

        // searchValue[name] = value
        // this.metaAction.sf('data.searchValue', fromJS(searchValue))

        // let keyRandom = Math.floor(Math.random() * 10000000)
        // this.keyRandom = keyRandom
        // clearTimeout(this.time)
        // this.time = setTimeout(() => {
        //     if (keyRandom == this.keyRandom) {
        //         this.handleSearch(value, name, 'onchange')
        //     }
        // }, 300)
        this.metaAction.sf(`data.searchValue.${name}`, value);

        if (name === 'taxRateId' || name === 'authenticated') {
            this.sortParmas();
        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),//装饰器 使用metaAction为参数 实现扩展
        o = new action({ ...option, metaAction, voucherAction }),
        ret = { ...metaAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
