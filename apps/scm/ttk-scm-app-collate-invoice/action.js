import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { List, fromJS, toJS } from 'immutable'
import { FormDecorator } from 'edf-component'
import config from './config'
import CurrentAccount from './components/currentAccount'
import SettlementAccount from './components/SettlementAccount'
import InventoryAccount from './components/InventoryAccount'
import BatchSettleCom from './components/BatchSettleCom'
import BatchGenerateRevenueAccount from './components/BatchGenerateRevenueAccount'
import BatchUpdateProperty from './components/BatchUpdateProperty'
import BatchUpdateRevenueType from './components/BatchUpdateRevenueType'
import BatchUpdateChangeRate from './components/BatchUpdateChangeRate'
import BatchGenerateRevenueType from './components/BatchGenerateRevenueType'
//import BatchUpdateInventoryAccount from './components/BatchUpdateInventoryAccount'
import InventoryAccountSet from './components/InventoryAccountSet'
import BatchUpdateInventory from './components/BatchUpdateInventory'
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.voucherAction.onInit({ component, injections })
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)

        }
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel);
        }
        injections.reduce('init')
        this.load()
    }

    load = async () => {
        let { selectedOption, vatOrEntry, checkboxValue, accountEnableDto } = this.component.props;
        this.metaAction.sfs({
            'data.accountEnableDto': fromJS(accountEnableDto),
            'data.other.vatOrEntry': vatOrEntry
        });
        //vatOrEntry:0销项 1进项


        // 这里原来结算科目的 列表是由前端过滤的
        // selectedOption = selectedOption.filter(o => o.settledAmount < o.taxInclusiveAmount)
        // this.injections.reduce('load', {selectedOption:selectedOption})
    }

    //cancel
    onCancel = () => {

    }

    //上一步
    lastStep = async () => {
        const step = this.metaAction.gf('data.other.step');
        const enablingMode = this.metaAction.gf('data.accountEnableDto.currentAccount'),
            vatOrEntry = this.component.props.vatOrEntry;

        // 往来科目  启用二级后。。。回到第二步。。。
        let filter = {}, sfsObj = {}
        if (step == 3) {

            let wlneedList = this.metaAction.gf('data.other.wlneedList')
            sfsObj['data.other.radiosss'] = 1
            if (wlneedList && (wlneedList.length || wlneedList.size) && enablingMode !== 0) {
                //启用了二级并且第二步有数据
                let res, subjectListParameter
                if (vatOrEntry) {
                    filter = { list: wlneedList }
                    res = await this.webapi.queryAccountPu(filter)
                    subjectListParameter = ["应付账款", "预付账款", "其他应收款", "其他应付款"]
                } else {
                    filter = { list: wlneedList }
                    res = await this.webapi.queryAccountSa(filter)
                    subjectListParameter = ["应收账款", "预收账款", "其他应收款"]
                }
                const subject = await this.webapi.getSubject(subjectListParameter)
                if (res && subject) {
                    sfsObj['data.other.queryAccount'] = fromJS(res)
                    sfsObj['data.other.subject'] = subject
                }
                // if (res.noMachedList && res.noMachedList.length) {
                //     sfsObj['data.other.step'] = 2
                // } else {
                //     sfsObj['data.other.step'] = 1
                // }
            } else {
                //没有启用二级或者第二步无数据跳到第一步
                //  sfsObj['data.other.step'] = 1
            }

            if (enablingMode) {
                sfsObj['data.other.step'] = 2
            } else {
                sfsObj['data.other.step'] = 1
            }

        } else if (step == 2) {
            sfsObj['data.other.step'] = 1
        }

        this.metaAction.sfs(sfsObj)
    }

    getFullName = (list) => {
        let arr
        list.map(item => {
            item.fullName = `${item.code} ${item.name} ${item.propertyName} ${item.unitName ? item.unitName : ""}`
            arr = [item.code, item.name, item.propertyName]
            if (item.unitName) arr.push(item.unitName)
            item.fullNameArr = arr
        })
        return list
    }

    // 批量生成档案及明细科目
    batchGeneration = async (vatOrEntry, generationOption) => {
        let archivesGeneration
        if (vatOrEntry) {
            archivesGeneration = await this.webapi.archivesGenerationArrival(generationOption)
        } else {
            archivesGeneration = await this.webapi.archivesGenerationDelivery(generationOption)
        }
        if (archivesGeneration) {
            return true
        } else {
            return false
        }
    }

    //下一步
    nextStep = async () => {
        let step = this.metaAction.gf('data.other.step')
        const enablingMode = this.metaAction.gf('data.accountEnableDto.currentAccount'),
            vatOrEntry = this.component.props.vatOrEntry;

        let filter = {}
        let sfsObj = {}
        let oldWlneedList = []

        if (step == 1) {
            let selectOptionSettle = this.metaAction.gf('data.other.selectOptionSettle').toJS(), //当前勾选的
                selectedOption = this.metaAction.gf('data.selectedOption').toJS(), // 列表里所有的
                selectedOptionSuccess = fromJS(selectedOption).toJS() // 成功修改之后的最新的 要从这里过滤传给往来科目

            // console.log(selectedOption, 'selectedOption')
            // 不传暂未收款 暂未付款 -》现在暂未收款、暂未付款的数据也要传，结算参数增加一个字段 clearSettle
            // 在进行结算时 不再只是针对勾选的 而是针对列表里面所有的
            // let selectOptionSettleNew = selectOptionSettle.filter(o => o.bankAccountTypeId != (vatOrEntry ? 3000050006 : 3000050005)) || []
            const list = selectedOption.map((item, index) => {
                let obj = {}
                // obj.amount = item.totalTaxInclusiveAmount - item.settledAmount
                obj.id = item.id
                obj.amount = item.notSettleAmount
                obj.bankAccountId = item.bankAccountId
                obj.ts = item.ts
                obj.clearSettle = true
                return obj
            });

            if (list && list.length) {

                const result = vatOrEntry ? await this.webapi.settlePuBatch(list) : await this.webapi.settleSaBatch(list)
                if (result && result.fail.length) {
                    selectedOptionSuccess = selectedOptionSuccess.map(item => {
                        result.fail.forEach(obj => {
                            if (item.id == obj.id) {
                                item.bankAccountTypeId = vatOrEntry ? 3000050006 : 3000050005
                                item.bankAccountId = vatOrEntry ? 6 : 5
                            }
                        })
                        return item
                    })
                }
                if (result && result.success.length) {
                    const response = await this.handleSettleSearch('')
                    // console.log(response.list, 'response.list')
                    if (response.list.length) {
                        sfsObj['data.other.isFinishSettle'] = false
                    } else {
                        sfsObj['data.other.isFinishSettle'] = true
                    }
                }
            }
            sfsObj['data.other.radiosss'] = 0
            // let selectedOption = this.metaAction.gf('data.selectedOption').toJS()
            // 不是对结算方式里勾选的那些 而是针对结算方式列表里所有的 暂未付款 冲减预付款 暂未收款 冲减预收款
            if (selectedOption.length) {
                // const selectedOptionNew = selectOptionSettle.length ? selectedOptionSuccess : selectedOption
                const selectedOptionNew = fromJS(selectedOptionSuccess).toJS()
                let wlneedList = []
                selectedOptionNew.forEach(item => {
                    if (item.bankAccountTypeId == 3000050006 || item.bankAccountTypeId == 3000050005
                        || item.bankAccountTypeId == 3000050009 || item.bankAccountTypeId == 3000050010) {
                        let obj = {}
                        obj.id = item.id
                        if (vatOrEntry) {
                            obj.puSupplierName = item.voucherSupplierName
                        } else {
                            obj.saCustomerName = item.voucherCustomerName
                        }
                        obj.settleTypeId = item.bankAccountTypeId

                        wlneedList.push(obj)
                    }
                })
                sfsObj['data.other.wlneedList'] = fromJS(wlneedList)

                // 检测科目是否有发生额
                let iaHaveAccrual = false, iaHaveAccrualArr = [3000050009, 3000050005, 3000050006, 3000050010],
                    generationOption = [], isGeneration = false
                selectedOptionNew.map(item => {
                    if (iaHaveAccrualArr.indexOf(item.bankAccountTypeId) > -1) iaHaveAccrual = true
                    generationOption.push({
                        id: item.id,
                        settleTypeId: item.bankAccountTypeId
                    })
                })
                this.metaAction.sf('data.loading', true)
                if (iaHaveAccrual) {
                    let checkAccountIsUsed
                    if (vatOrEntry) {
                        checkAccountIsUsed = await this.webapi.checkAccountIsUsed({ entranceFlag: 'arrival' })
                    } else {
                        checkAccountIsUsed = await this.webapi.checkAccountIsUsed({ entranceFlag: 'delivery' })
                    }
                    if (checkAccountIsUsed) {
                        const ret = await this.metaAction.modal('confirm', {
                            // title: '',
                            content: '上级科目已存在发生额，新增下级科目会把发生额自动结转到第一个下级科目上，是否继续生成'
                        })
                        if (ret) {
                            isGeneration = await this.batchGeneration(vatOrEntry, generationOption)
                        } else {
                            // 关闭弹框。。
                            this.component.props.closeModal(2)
                        }
                    } else {
                        isGeneration = await this.batchGeneration(vatOrEntry, generationOption)
                    }
                } else {
                    isGeneration = await this.batchGeneration(vatOrEntry, generationOption)
                }
                this.metaAction.sf('data.loading', false)

                // 往来科目  启用二级后。。。
                if (wlneedList && (wlneedList.length || wlneedList.size) && enablingMode !== 0 && isGeneration) {
                    let res, subjectListParameter
                    // oldWlneedList = wlneedList
                    if (vatOrEntry) {
                        filter = { list: wlneedList }
                        res = await this.webapi.queryAccountPu(filter)
                        subjectListParameter = ["应付账款", "预付账款", "其他应收款", "其他应付款"]
                    } else {
                        filter = { list: wlneedList }
                        res = await this.webapi.queryAccountSa(filter)
                        subjectListParameter = ["应收账款", "预收账款", "其他应收款"]
                    }
                    const subject = await this.webapi.getSubject(subjectListParameter)
                    if (res && subject) {
                        oldWlneedList = res.noMachedList
                        sfsObj['data.other.queryAccount'] = fromJS(res)
                        sfsObj['data.other.subject'] = subject
                    }
                } else {
                    sfsObj['data.other.queryAccount'] = fromJS({
                        allList: [],
                        noMachedList: []
                    })
                }
            }

            // if (!oldWlneedList.length || enablingMode === 0) {
            if (enablingMode === 0) {
                //往来没有启用二级或者第二步无数据跳到第三步
                this.metaAction.sf('data.other.step', 3);
                await this.loadStep3();
            } else {
                //启用了二级并且第二步有数据
                sfsObj['data.other.step'] = 2;
            }

        } else if (step == 2) {
            //第二步跳转到第三步
            //保存后跳转
            //let res = await this.currentAccountHandleNextStep();
            let res = await this.currentAccountRef.handleNextStep();
            if (!res) return false
            this.metaAction.sf('data.other.step', 3);
            this.metaAction.sf('data.onlyNotMatch', true);
            await this.loadStep3();
        } else if (step == 3) {
            await this.onOk();
        }

        this.metaAction.sfs(sfsObj)
    }

    //保存
    save = async (isSave) => {
        let step = this.metaAction.gf('data.other.step');
        if (step == 3) {
            const inventoryAccountLoading = this.metaAction.gf('data.inventoryAccountLoading');
            if (inventoryAccountLoading) {
                this.metaAction.toast('error', '请等待数据加载完成');
                return;
            }
            this.metaAction.sf('data.inventoryAccountLoading', true);
            const saveres = await this.saveStep3();
            this.metaAction.sf('data.inventoryAccountLoading', false);
            if (saveres) {
                this.metaAction.toast('success', '保存成功')
            };
        }
        if (step == 2) {
            // let saveRes = await this.saveCurrentAccount()
            await this.currentAccountRef.handleSave()
        }
    }

    // //往来科目保存
    // addSaveListener = (actionName) => {
    //     this.saveCurrentAccount = actionName;
    // }

    // //往来科目下一步
    // addNextStepListener = (actionName) => {
    //     this.currentAccountHandleNextStep = actionName;
    // }
    renderAccount = (type) => {
        // const { vatOrEntry , selectedOption} = this.component.props;
        const { vatOrEntry, accountEnableDto } = this.component.props;
        const bankAccount = this.metaAction.gf('data.other.bankAccount'),
            selectedOption = this.metaAction.gf('data.selectedOption').toJS(),
            // selectBatchSettleId = this.metaAction.gf('data.other.selectBatchSettleId'),
            selectBatchSettleObj = this.metaAction.gf('data.other.selectBatchSettleObj').toJS()

        if (type == 'settlement') {
            // return '第一步'
            return <SettlementAccount
                handSettleCheckbox={this.handSettleCheckbox}
                handleBatchSettle={this.handleBatchSettle}
                vatOrEntry={vatOrEntry}
                selectedOption={selectedOption}
                handleSettleLoad={this.handleSettleLoad}
                bankAccount={bankAccount.toJS()}
                handleSettleSearch={this.handleSettleSearch}
                // selectBatchSettleId={selectBatchSettleId}
                selectBatchSettleObj={selectBatchSettleObj}
                handleAddSettle={this.handleAddSettle} />
        }
        if (type == 'current') {
            let queryAccount = this.metaAction.gf('data.other.queryAccount').toJS(),
                wlneedList = this.metaAction.gf('data.other.wlneedList'),
                subject = this.metaAction.gf('data.other.subject')
            // radio = this.metaAction.gf('data.other.radiosss')
            return <CurrentAccount
                metaAction={this.metaAction}
                store={this.component.props.store}
                queryAccount={queryAccount}
                wlneedList={wlneedList}
                vatOrEntry={vatOrEntry}
                subject={subject}
                // radio={radio}
                webapi={this.webapi}
                nextStep11={this.nextStep11}
                setOkListener={this.component.props.setOkListener}
                setCancelLister={this.component.props.setCancelLister}
                //addSaveListener={this.addSaveListener}
                //addNextStepListener={this.addNextStepListener}
                ref={(ref) => this.currentAccountRef = ref}

            />
        }
        if (type == 'inventoty') {
            const inventoryAccountInitData = this.metaAction.gf('data.inventoryAccountInitData').toJS(),
                inventoryAccount = this.metaAction.gf('data.inventoryAccount').toJS(),
                inventory = this.metaAction.gf('data.inventory').toJS(),
                inventoryName = this.metaAction.gf('data.inventoryName'),
                onlyNotMatch = this.metaAction.gf('data.onlyNotMatch'),
                inventoryAccountLoading = this.metaAction.gf('data.inventoryAccountLoading')
            return <InventoryAccount
                handleInventorySetting={this.handleInventorySetting}
                addInventory={this.addInventory}
                inventoryAccountInitData={inventoryAccountInitData}
                accountEnableDto={accountEnableDto}
                vatOrEntry={vatOrEntry}
                inventoryAccount={inventoryAccount}
                inventory={inventory}
                handleChangeProperty={this.handleChangeProperty}
                handleChangeInventory={this.handleChangeInventory}
                handleChangeRate={this.handleChangeRate}
                handleChangeInventoryAccount={this.handleChangeInventoryAccount}
                handleChangeRevenueType={this.handleChangeRevenueType}
                initInventoryAcountList={this.initInventoryAcountList}
                handelGenerateInventory={this.handelGenerateInventory}
                handelGenerateInventoryAccount={this.handelGenerateInventoryAccount}
                handelGenerateRevenueAccount={this.handelGenerateRevenueAccount}
                handleSwitchMatchType={this.handleSwitchMatchType}
                handleInventoryAccountInputChange={this.handleInventoryAccountInputChange}
                handleInventoryAccountOnSearch={this.handleInventoryAccountOnSearch}
                inventoryName={inventoryName}
                onlyNotMatch={onlyNotMatch}
                addRevenueType={this.addRevenueType}
                addInventoryAccount={this.addInventoryAccount}
                handleSelectOnFocus={this.handleSelectOnFocus}
                handleSelectOnBlur={this.handleSelectOnBlur}
                loading={inventoryAccountLoading}
                handFilterOption={this.handFilterOption}
                handleBatchUpdateRevenueType={this.handleBatchUpdateRevenueType}
                handleBatchUpdateProperty={this.handleBatchUpdateProperty}
                addRevenueAccount={this.addRevenueAccount}
                handleChangeRevenueAccount={this.handleChangeRevenueAccount}
                handleBatchChangeRate={this.handleBatchChangeRate}
                handelGenerateRevenueType={this.handelGenerateRevenueType}
                handelUpdateInventoryAccount={this.handelUpdateInventoryAccount}
                handelUpdateInventory={this.handelUpdateInventory}
                handleBatchUpdateInventory={this.handleBatchUpdateInventory}

            />
        }
    }

    /**
     * 结算科目相关 start
     */

    // 结算科目搜索
    handleSettleSearch = async (name) => {
        const { vatOrEntry, checkboxValue } = this.component.props;
        let res = null
        let parmasObj = {
            sourchName: name,
            idList: checkboxValue
        }
        if (vatOrEntry) {
            res = await this.webapi.puSettleList(parmasObj)
        } else {
            res = await this.webapi.saSettleList(parmasObj)
        }

        return res
    }

    //获取结算方式下拉选内容
    handleSettleLoad = async (type) => {
        const { vatOrEntry, checkboxValue } = this.component.props;
        if (type == 'init') {
            let parmasObj = {
                sourchName: null,
                idList: checkboxValue
            }
            let listWeb = [
                this.voucherAction.getBankAccount({
                    entity: { isEnable: true },
                    attributeList: vatOrEntry ? ["3000050001", "3000050002", "3000050003", "3000050004", "3000050010", "3000050006"] :
                        ["3000050001", "3000050002", "3000050003", "3000050004", "3000050009", "3000050005"]
                }, `data.other.bankAccount`)
            ]
            if (vatOrEntry == 1) {
                listWeb.push(this.webapi.puSettleList(parmasObj))
            } else if (vatOrEntry == 0) {
                listWeb.push(this.webapi.saSettleList(parmasObj))
            }

            const res = await Promise.all(listWeb)
            if (res) {
                if (res[1].message) {
                    this.metaAction.toast('warning', res[1].message)
                }
                if (res[1].list.length == 0) {
                    this.component.props.closeModal(1);
                    return;
                }
                if (res[1].invalidIds && res[1].invalidIds.length != 0) {
                    this.metaAction.sf('data.form.invalidIds', res[1].invalidIds)
                }
                // //// 这里自己添加的字段 等接口里有了 就不用自己加了
                // if(res[1]) {
                //     let list = res[1].list.map(item => {
                //         item.bankAccountId = item.bankAccountId ? item.bankAccountId : vatOrEntry ? 6 : 5
                //         item.bankAccountTypeId = item.bankAccountTypeId ? item.bankAccountTypeId : vatOrEntry ? 3000050006 : 3000050005
                //         return item
                //     })
                //     this.metaAction.sf('data.selectedOption', fromJS(list))
                // }
                // ////

                res[1] && this.metaAction.sf('data.selectedOption', fromJS(res[1].list));
                if (!res[1].list || !res[1].list.length) {
                    //无数据直接跳到第三步
                    // this.metaAction.sf('data.other.step', 3);
                    // await this.loadStep3();
                }
            }
            // console.log(res, 'res 666666')

        }
    }

    //批量修改结算方式
    handleBatchSettle = async (arr) => {
        if (arr && arr.length == 0) {
            this.metaAction.toast('error', '请选择要批量修改结算方式的数据')
            return
        }
        const bankAccount = this.metaAction.gf('data.other.bankAccount').toJS()
        const { vatOrEntry } = this.component.props;

        const res = await this.metaAction.modal('show', {
            title: '批量修改结算方式',
            width: 494,
            wrapClassName: 'settlementCss',
            children: <BatchSettleCom
                bankAccount={bankAccount}
                handleAddSettle={this.handleAddSettle}
                vatOrEntry={vatOrEntry} />
        })

        if (res) {
            this.metaAction.sf('data.other.selectBatchSettleObj', fromJS(res))
            // this.metaAction.sf('data.other.selectBatchSettleId', res)
        }
    }

    handSettleCheckbox = (itemArr, type, list) => {
        let selectedOption = this.metaAction.gf('data.selectedOption').toJS()
        if (type == 'selectChange') {
            // 不再用当前勾选的 不勾选的情况下也要进行 结算
            // selectedOption = selectedOption.map(item => {
            //     itemArr.forEach(obj => {
            //         if (item.id == obj.id) {
            //             item.bankAccountTypeId = obj.bankAccountTypeId
            //         }
            //     })
            //     return item
            // })

            selectedOption = selectedOption.map(item => {
                list.forEach(obj => {
                    if (item.id == obj.id) {
                        item.bankAccountTypeId = obj.bankAccountTypeId
                        item.bankAccountId = obj.bankAccountId
                    }
                })
                return item
            })
            this.metaAction.sfs({
                'data.other.selectOptionSettle': fromJS(itemArr),
                'data.selectedOption': fromJS(selectedOption)
            })
        } else if (type == 'props') {
            selectedOption = selectedOption.map(item => {
                itemArr.forEach(obj => {
                    if (item.id == obj.id) {
                        item.bankAccountTypeId = obj.bankAccountTypeId
                        item.bankAccountId = obj.bankAccountId
                    }
                })
                return item
            })
            this.metaAction.sfs({
                'data.other.selectOptionSettle': fromJS(itemArr),
                'data.selectedOption': fromJS(selectedOption)
            })
        } else {
            this.metaAction.sf('data.other.selectOptionSettle', fromJS(itemArr))
        }
    }

    // 新增结算方式
    handleAddSettle = async (rowDate, type) => {
        const res = await this.voucherAction.addAccount()

        let bankAccount = this.metaAction.gf('data.other.bankAccount').toJS(),
            selectedOption = this.metaAction.gf('data.selectedOption').toJS()

        if (res) {
            bankAccount.push(res)

            if (type == 'onerow') {
                selectedOption.map(item => {
                    if (item.id == rowDate.id) {
                        item.bankAccountTypeId = res.bankAccountTypeId
                        item.bankAccountId = res.id
                    }
                    return item
                })
                this.metaAction.sfs({
                    'data.other.bankAccount': fromJS(bankAccount),
                    'data.selectedOption': fromJS(selectedOption)
                })
            } else {
                this.metaAction.sf('data.other.bankAccount', fromJS(bankAccount))
            }
        }

        return res
    }
    /**
     * 结算科目相关 end
     */

    /**************************************************************************** */

    //是否显示上一步按钮
    isShowPreStep = () => {
        //第一步没有数据不显示上一步按钮 ; 第一步是否全部结算
        let selectedOption = this.metaAction.gf('data.selectedOption') // 列表里所有的
        let step = this.metaAction.gf('data.other.step')
        let isFinishSettle = this.metaAction.gf('data.other.isFinishSettle')

        if (selectedOption && selectedOption.size && step > 1 && !isFinishSettle) {
            return true
        } else {
            return false
        }
    }

    //生成凭证
    onOk = async () => {
        const inventoryAccountLoading = this.metaAction.gf('data.inventoryAccountLoading');
        if (inventoryAccountLoading) {
            this.metaAction.toast('error', '请等待数据加载完成');
            return;
        }
        const saveres = await this.saveStep3();
        if (!saveres) return;
        let list = saveres.invoiceInventoryList;
        let { selectedOption, vatOrEntry, checkboxValue, accountEnableDto, formCard } = this.component.props;
        let inventoryName = this.metaAction.gf('data.inventoryName');

        let { relatedAccountEnable, costAccountEnable, revenueAccountEnable, revenueAccounts } = this.metaAction.gf('data.inventoryAccountInitData').toJS();
        let flag = this.checkData(list, vatOrEntry, relatedAccountEnable, costAccountEnable, revenueAccountEnable, revenueAccounts);
        if (flag) {
            return;
        }

        this.metaAction.sf('data.inventoryAccountLoading', true);
        if (inventoryName) {
            this.metaAction.sf('data.inventoryName', null);
            //有搜索条件的情况无法判断出全填
            const res = await this.initInventoryAcountList({ inventoryName: null });
            let { invoiceInventoryList: list, relatedAccountEnable, costAccountEnable, revenueAccountEnable, revenueAccounts } = res;
            let flag = this.checkData(list, vatOrEntry, relatedAccountEnable, costAccountEnable, revenueAccountEnable, revenueAccounts);
            if (flag) {
                this.metaAction.sf('data.inventoryAccountLoading', false);
                return;
            }
        }

        let res;

        let invalidIds = this.metaAction.gf('data.form.invalidIds')

        if (invalidIds && invalidIds.length != 0) {
            for (var i = 0; i < invalidIds.length; i++) {
                for (var a = 0; a < selectedOption.length; a++) {
                    if (selectedOption[a].id == invalidIds[i]) {
                        selectedOption.splice(a, 1);
                    }
                }
            }
        }

        if (formCard === true) {
            if (vatOrEntry) {
                res = await this.webapi.auditPu(selectedOption[0])
            } else {
                res = await this.webapi.auditSa(selectedOption[0])
            }
        } else {
            if (vatOrEntry) {
                res = await this.webapi.getAuditPu(selectedOption)
            } else {
                res = await this.webapi.getAuditSa(selectedOption)
            }
        }

        this.metaAction.sf('data.inventoryAccountLoading', false);

        if (res) {
            this.component.props.closeModal(res);
        }
    }

    //检查是否有必填项没填
    checkData = (list, vatOrEntry, relatedAccountEnable, costAccountEnable, revenueAccountEnable, revenueAccounts) => {
        let inventoryAccount = this.metaAction.gf('data.inventoryAccount').toJS()
        const inventoryAccountInitData = this.metaAction.gf('data.inventoryAccountInitData').toJS()

        let flag = false;
        let name = new Set();
        list.forEach((obj, index) => {
            let { inventoryId, propertyId, rate, inventoryRelatedAccountId, revenueType, inventoryUnitId, unitId, revenueTypeAccountId } = obj;
            if (vatOrEntry) {
                //业务类型和存货id不能为空
                if (!propertyId) {
                    name.add('业务类型');
                    flag = true;
                }
                if (!inventoryId) {
                    name.add('存货');
                    flag = true;
                }
                //转换率不能为空
                if (unitId && inventoryUnitId && !inventoryAccountInitData.isHideUnit) {
                    if (!rate || isNaN(Number(rate)) || Number(rate) <= 0) {
                        name.add('转换率');
                        flag = true;
                    }
                }
                //存货科目不能为空
                if (relatedAccountEnable && (!inventoryRelatedAccountId || !inventoryAccount.find(o => o.id === inventoryRelatedAccountId))) {
                    name.add('存货科目');
                    flag = true;
                }
            } else {

                //存货
                if (!inventoryId) {
                    name.add('存货');
                    flag = true;
                }
                //转换率不能为空
                if (unitId && inventoryUnitId && !inventoryAccountInitData.isHideUnit) {
                    if (!rate || isNaN(Number(rate)) || Number(rate) <= 0) {
                        name.add('转换率');
                        flag = true;
                    }
                }
                //收入类型
                if (!revenueAccountEnable && !revenueType) {
                    name.add('收入类型');
                    flag = true;
                }
                //收入科目
                if (revenueAccountEnable && (!revenueTypeAccountId || !revenueAccounts.find(o => o.id === revenueTypeAccountId))) {
                    name.add('收入科目');
                    flag = true;
                }
            }
        })
        if (flag) {
            let message = [...name].join('、');
            this.metaAction.toast('error', `${message}为空，确认之后，才可以生成凭证`);
        }
        return flag;
    }

    //加载step3全部数据
    loadStep3 = async (isLoading) => {
        const { vatOrEntry } = this.component.props;
        if (!isLoading) {
            const inventoryAccountLoading = this.metaAction.gf('data.inventoryAccountLoading');
            if (inventoryAccountLoading) { this.metaAction.toast('error', '请等待数据加载完成'); return }
            this.metaAction.sf('data.inventoryAccountLoading', true);
        }

        const res = await this.initInventoryAcountList({});//列表数据

        const res2 = await this.webapi.accountQuery({ isEnable: true, isEndNode: true });//存货科目
        this.metaAction.sf('data.inventoryAccount', fromJS(res2.glAccounts));

        if (vatOrEntry) {
            const inventory = await this.webapi.queryInventory();//存货
            if (!inventory) return;
            //进销项返回不一样 进项返回fullName 销项返回fullname
            let inventoryArr = this.getFullName(inventory)
            this.metaAction.sfs({
                'data.inventory': fromJS(inventoryArr),
                'data.inventoryAll': fromJS(inventoryArr)
            })
        } else {
            const inventory = await this.webapi.inventory();
            let inventoryArr = this.getFullName(inventory)
            this.metaAction.sfs({
                'data.inventory': fromJS(inventoryArr),
                'data.inventoryAll': fromJS(inventoryArr)
            })
        }
        this.metaAction.sf('data.inventoryAccountLoading', false);
    }

    //初始化存货科目列表
    initInventoryAcountList = async (option = {}) => {
        let { selectedOption, vatOrEntry, checkboxValue, accountEnableDto } = this.component.props;
        let onlyNotMatch = this.metaAction.gf('data.onlyNotMatch');

        let parmas = {
            type: 'sortInvoice',
            isArrival: false,
            arrivalIdList: [],
            isDelivery: false,
            deliveryIdList: [],
            inventoryName: null,
            onlyNotMatch,
        }

        if (vatOrEntry) {
            parmas.isArrival = true;
            parmas.arrivalIdList = checkboxValue;

            let invalidIds = this.metaAction.gf('data.form.invalidIds')

            if (invalidIds && invalidIds.length != 0) {
                for (var i = 0; i < invalidIds.length; i++) {

                    for (var a = 0; a < parmas.arrivalIdList.length; a++) {
                        if (parmas.arrivalIdList[a] == invalidIds[i]) {
                            parmas.arrivalIdList.splice(a, 1);
                        }
                    }

                }
            }

        } else {
            parmas.isDelivery = true;
            parmas.deliveryIdList = checkboxValue;

            let invalidIds = this.metaAction.gf('data.form.invalidIds')

            if (invalidIds && invalidIds.length != 0) {
                for (var i = 0; i < invalidIds.length; i++) {

                    for (var a = 0; a < parmas.deliveryIdList.length; a++) {
                        if (parmas.deliveryIdList[a] == invalidIds[i]) {
                            parmas.deliveryIdList.splice(a, 1);
                        }
                    }

                }
            }
        }
        parmas = {
            ...parmas,
            ...option
        }



        const res = await this.webapi.getInvoiceInvMatch(parmas);

        if (res) {
            res.invoiceInventoryList = this.formatData(res.invoiceInventoryList);
        }

        this.metaAction.sf('data.inventoryAccountInitData', fromJS(res));
        return res;

    }

    //自动生成存货规则设置
    handleInventorySetting = async (e) => {

        let { vatOrEntry } = this.component.props;
        const { inventoryNameSet, invAccountList, isHideUnit } = this.metaAction.gf('data.inventoryAccountInitData').toJS();
        const inventoryAccount = this.metaAction.gf('data.inventoryAccount').toJS();

        const ret = await this.metaAction.modal('show', {
            title: '自动生成存货规则',
            width: 720,
            okText: '确定',
            bodyStyle: { padding: '10px 12px' },
            children: this.metaAction.loadApp('ttk-scm-inventory-account-set', {
                store: this.component.props.store,
                inventoryNameSet,
                invAccountList,
                inventoryAccount,
                vatOrEntry,
                isHideUnit
            }),
        })
        if (ret && ret !== true && !e) {
            this.loadStep3();
            //可能新增了科目
            // this.metaAction.sfs({
            //     'data.inventoryAccountInitData.invAccountList': fromJS(ret.invAccountList),
            //     'data.inventoryAccountInitData.inventoryNameSet': ret.inventoryNameSet
            // });
        }

    }

    //自动生成存货时弹出
    handleInventoryAccountSetting = async () => {

        let { vatOrEntry } = this.component.props;
        const { inventoryNameSet } = this.metaAction.gf('data.inventoryAccountInitData').toJS();
        const ret = await this.metaAction.modal('show', {
            title: '自动生成存货规则',
            width: 300,
            okText: '确定',
            bodyStyle: { padding: '10px 12px' },
            children: <InventoryAccountSet
                store={this.component.props.store}
                inventoryNameSet={inventoryNameSet}
                vatOrEntry={vatOrEntry}
                webapi={this.webapi}
            />
        })
        return ret;
    }

    //新增存货
    addInventory = async (index, record) => {

        const { vatOrEntry } = this.component.props;
        const isBussness = record.propertyId === 4001001
        if (vatOrEntry && isBussness) {
            let ret = await this.metaAction.modal('show', {
                title: <div style={{ fontSize: '16px', fontWeight: '500' }}>新增费用类型</div>,
                width: 400,
                height: 500,
                footer: '',
                children: this.metaAction.loadApp('scm-incomeexpenses-setting-card', {
                    store: this.component.props.store,
                    columnCode: "common",
                    incomeexpensesTabId: '4001001'
                }),
            })
            if (ret instanceof Object) {
                ret = this.getFullName([ret])[0]
                ret.propertyId = 4001001;
                ret.propertyName = '费用';
                const inventory = this.metaAction.gf('data.inventoryAll').toJS();
                inventory.push(ret);
                delete record.inventoryFocus;
                record = {
                    ...record,
                    inventoryId: ret.id,
                    name: ret.name,
                    inventoryRelatedAccountId: ret.accountId || null,
                    inventoryRelatedAccountName: ret.accountName || null,
                    businessTypeId: ret.id,
                    businessTypeName: ret.name,
                }
                let arr = {
                    // [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryId`]: ret.id,
                    // [`data.inventoryAccountInitData.invoiceInventoryList.${index}.name`]: ret.name,
                    // [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryRelatedAccountId`]: ret.accountId || null,
                    // [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryRelatedAccountName`]: ret.accountName || null,
                    // [`data.inventoryAccountInitData.invoiceInventoryList.${index}.businessTypeId`]: ret.id,
                    // [`data.inventoryAccountInitData.invoiceInventoryList.${index}.businessTypeName`]: ret.name,
                    [`data.inventoryAccountInitData.invoiceInventoryList.${index}`]: fromJS(record),
                    'data.inventoryAll': fromJS(inventory),
                    'data.inventory': fromJS(inventory)
                };
                this.metaAction.sfs(arr);
            }
        }
        else {
            let ret = await this.metaAction.modal('show', {
                title: '新增存货',
                width: 750,
                children: this.metaAction.loadApp(
                    'app-card-inventory', {
                        store: this.component.props.store
                    }
                )
            })
            if (ret instanceof Object) {
                if (!ret.isEnable) {
                    return
                }
                ret = this.getFullName([ret])[0];
                const inventory = this.metaAction.gf('data.inventoryAll').toJS();
                inventory.push(ret);
                delete record.inventoryFocus;
                delete record.inventorySaFocus;
                record = {
                    ...record,
                    inventoryId: ret.id,
                    name: ret.name,
                    propertyId: ret.propertyId,
                    propertyName: ret.propertyName,
                    inventoryUnitId: ret.unitId || null,
                    businessTypeName: ret.unitName || null
                }

                //进项自动带出存货科目
                if (vatOrEntry) {
                    record.inventoryRelatedAccountId = ret.accountId || null;
                    record.inventoryRelatedAccountName = ret.accountName || null;
                    //arr[`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryRelatedAccountId`] = ret.accountId || null;
                    //arr[`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryRelatedAccountName`] = ret.accountName || null;
                } else {
                    //销项自动带出收入类型或收入科目
                    record.revenueType = ret.revenueType || null;
                    record.revenueTypeName = ret.revenueTypeName || null;
                    record.revenueTypeAccountId = ret.accountId || null;
                    record.revenueTypeAccountName = ret.accountName || null;
                    // arr[`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueType`] = ret.revenueType || null;
                    // arr[`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueTypeName`] = ret.revenueTypeName || null;
                    // arr[`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueTypeAccountId`] = ret.accountId || null;
                    // arr[`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueTypeAccountName`] = ret.accountName || null;
                }
                let arr = {
                    // [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryId`]: ret.id,
                    // [`data.inventoryAccountInitData.invoiceInventoryList.${index}.name`]: ret.name,
                    // [`data.inventoryAccountInitData.invoiceInventoryList.${index}.propertyId`]: ret.propertyId,
                    // [`data.inventoryAccountInitData.invoiceInventoryList.${index}.propertyName`]: ret.propertyName,
                    // [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryUnitId`]: ret.unitId || null,
                    // [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryUnitName`]: ret.unitName || null,
                    [`data.inventoryAccountInitData.invoiceInventoryList.${index}`]: fromJS(record),
                    'data.inventoryAll': fromJS(inventory),
                    'data.inventory': fromJS(inventory)
                };
                this.metaAction.sfs(arr);
            }
        }

    }


    //新增末级存货科目
    addInventoryAccount = async (index) => {
        const ret = await this.metaAction.modal('show', {
            title: '新增存货科目',
            width: 450,
            okText: '保存',
            style: { top: 40 },
            bodyStyle: { padding: 24, fontSize: 12 },
            children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
                store: this.component.props.store,
                //createRevenueAccount: null,//新增存货科目
                columnCode: "subjects",
                active: 'archives'
            })
        })
        if (ret) {
            if (!ret.isEnable || !ret.isEndNode) {
                return
            }

            //重新获取末级存货科目
            const res = await this.webapi.accountQuery({ isEnable: true, isEndNode: true });
            this.injections.reduce('upDateSfs', {
                [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryRelatedAccountId`]: ret.id,
                [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryRelatedAccountName`]: ret.name,
                ['data.inventoryAccount']: fromJS(res.glAccounts),
            })

        }
    }

    //批量新增末级存货科目
    // batchAddInventoryAccount = async (index) => {
    //     const ret = await this.metaAction.modal('show', {
    //         title: '新增存货科目',
    //         width: 450,
    //         okText: '保存',
    //         style: { top: 40 },
    //         bodyStyle: { padding: 24, fontSize: 12 },
    //         children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
    //             store: this.component.props.store,
    //             createRevenueAccount: null,//新增存货科目
    //             columnCode: "subjects",
    //             active: 'archives'
    //         })
    //     })
    //     if (ret) {
    //         if (!ret.isEnable || !ret.isEndNode) {
    //             return
    //         }

    //         //重新获取末级存货科目
    //         const res = await this.webapi.accountQuery({ isEnable: true, isEndNode: true });
    //         this.injections.reduce('upDateSfs', {
    //             [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryRelatedAccountId`]: ret.id,
    //             [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryRelatedAccountName`]: ret.name,
    //             ['data.inventoryAccount']: fromJS(res.glAccounts),
    //         })
    //     }
    //     return ret;
    // }

    //新增收入科目末级科目
    addRevenueAccount = async (index) => {
        const ret = await this.metaAction.modal('show', {
            title: '新增收入科目',
            width: 450,
            okText: '保存',
            style: { top: 40 },
            bodyStyle: { padding: 24, fontSize: 12 },
            children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
                store: this.component.props.store,
                createRevenueAccount: true,//是否为新增收入科目
                columnCode: "subjects",
                active: 'archives'
            })
        })
        if (ret) {
            if (!ret.isEnable || !ret.isEndNode) {
                return;
            }
            //重新获取末级收入科目
            const res = await this.webapi.queryRevenueAccount();
            this.injections.reduce('upDateSfs', {
                [`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueTypeAccountId`]: ret.id,
                [`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueAccountName`]: ret.codeAndName,
                ['data.inventoryAccountInitData.revenueAccounts']: fromJS(res.revenueAccounts),
                ['data.inventoryAccountInitData.parentRevenueAccounts']: fromJS(res.parentRevenueAccounts),
            })
        }

    }

    //批量新增收入科目末级科目
    batchAddRevenuesubject = async (index) => {
        const ret = await this.metaAction.modal('show', {
            title: '新增收入科目',
            width: 450,
            okText: '保存',
            style: { top: 40 },
            bodyStyle: { padding: 24, fontSize: 12 },
            children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
                store: this.component.props.store,
                createRevenueAccount: true,//是否为新增收入科目
                columnCode: "subjects",
                active: 'archives'
            })
        })
        if (ret) {
            if (!ret.isEnable || !ret.isEndNode) {
                return;
            }
            //重新获取末级收入科目
            const res = await this.webapi.queryRevenueAccount();
            this.injections.reduce('upDateSfs', {
                ['data.inventoryAccountInitData.revenueAccounts']: fromJS(res.revenueAccounts),
                ['data.inventoryAccountInitData.parentRevenueAccounts']: fromJS(res.parentRevenueAccounts),
            })
        }
        return ret;
    }

    //新增存货科目（包括末级非末级）
    batchAddRevenueAccountInventory = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '新增存货科目',
            width: 450,
            okText: '保存',
            style: { top: 40 },
            bodyStyle: { padding: 24, fontSize: 12 },
            children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
                store: this.component.props.store,
                createRevenueAccount: null,//新增存货科目
                columnCode: "subjects",
                active: 'archives'
            })
        })
        if (ret) {
            if (!ret.isEnable) {
                return false;
            }
            //重新获取末级收入科目
            const res = await this.webapi.queryRevenueAccountForArrival();
            return {
                id: ret.id,
                codeAndName: ret.codeAndName,
                parentRevenueAccounts: res.parentRevenueAccounts
            };
        }
        return false;
    }

    //新增收入类型（包括末级非末级）
    batchAddRevenueAccount = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '新增收入科目',
            width: 450,
            okText: '保存',
            style: { top: 40 },
            bodyStyle: { padding: 24, fontSize: 12 },
            children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
                store: this.component.props.store,
                createRevenueAccount: true,//是否为新增收入科目
                columnCode: "subjects",
                active: 'archives'
            })
        })
        if (ret) {
            if (!ret.isEnable) {
                return false;
            }
            //重新获取末级收入科目
            const res = await this.webapi.queryRevenueAccount();
            return {
                id: ret.id,
                codeAndName: ret.codeAndName,
                parentRevenueAccounts: res.parentRevenueAccounts
            };
        }
        return false;
    }

    //select获得焦点
    handleSelectOnFocus = (name, index, propertyId) => {
        this.metaAction.sf(`data.inventoryAccountInitData.invoiceInventoryList.${index}.${name}`, true);

        if (name === 'inventoryFocus') {
            const inventoryAll = this.metaAction.gf('data.inventoryAll').toJS();
            if (propertyId) {
                const inventory = inventoryAll.filter(o => o.propertyId == propertyId);
                this.metaAction.sf('data.inventory', fromJS(inventory));
            } else {
                this.metaAction.sf('data.inventory', fromJS(inventoryAll));
            }
        }
    }

    //select失去焦点 删除焦点字段
    handleSelectOnBlur = (name, index) => {
        let list = this.metaAction.gf(`data.inventoryAccountInitData.invoiceInventoryList.${index}`).toJS();
        delete list[name];
        this.metaAction.sf(`data.inventoryAccountInitData.invoiceInventoryList.${index}`, fromJS(list));
    }

    //新增收支类型
    addRevenueType = async (index) => {
        const ret = await this.metaAction.modal('show', {
            title: '新增收入类型',
            wrapClassName: 'income-expenses-card',
            width: 410,
            okText: '确定',
            footer: '',
            bodyStyle: { padding: '10px 0' },
            children: this.metaAction.loadApp('scm-incomeexpenses-setting-card', {
                store: this.component.props.store,
                incomeexpensesTabId: 2001003,
                record: undefined
            }),
        })
        if (ret) {
            if (!ret.isEnable) {
                return
            }
            const account = this.metaAction.gf('data.inventoryAccountInitData.revenueTypes').toJS();
            account.push({
                id: ret.id,
                name: ret.name
            });
            this.injections.reduce('upDateSfs', {
                [`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueType`]: ret.id,
                [`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueTypeName`]: ret.name,
                'data.inventoryAccountInitData.revenueTypes': fromJS(account)
            })
        }
    }

    //批量新增收入类型
    batchAddRevenueType = async (index) => {
        const ret = await this.metaAction.modal('show', {
            title: '新增收入类型',
            wrapClassName: 'income-expenses-card',
            width: 410,
            okText: '确定',
            footer: '',
            bodyStyle: { padding: '10px 0' },
            children: this.metaAction.loadApp('scm-incomeexpenses-setting-card', {
                store: this.component.props.store,
                incomeexpensesTabId: 2001003,
                record: undefined
            }),
        });
        if (ret) {
            if (!ret.isEnable) {
                return
            }
            //补充数据
            const account = this.metaAction.gf('data.inventoryAccountInitData.revenueTypes').toJS();
            account.push({
                id: ret.id,
                name: ret.name
            });
            this.metaAction.sf('data.inventoryAccountInitData.revenueTypes', fromJS(account))
        }
        return ret;
    }

    //进项改变业务类型
    handleChangeProperty = (v = null, index) => {

        const properties = this.metaAction.gf('data.inventoryAccountInitData.properties').toJS();

        if (v) {
            let item = properties.find(o => o.propertyId == v);

            //存货改为费用清空存货
            if (v === 4001001) {
                this.metaAction.sfs({
                    [`data.inventoryAccountInitData.invoiceInventoryList.${index}.businessTypeId`]: null,
                    [`data.inventoryAccountInitData.invoiceInventoryList.${index}.businessTypeName`]: null,
                    [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryId`]: null,
                    [`data.inventoryAccountInitData.invoiceInventoryList.${index}.name`]: null,
                    [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryUnitId`]: null,
                    [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryUnitName`]: null,
                    [`data.inventoryAccountInitData.invoiceInventoryList.${index}.propertyId`]: v,
                    [`data.inventoryAccountInitData.invoiceInventoryList.${index}.propertyName`]: item.propertyName
                })
            } else {
                this.metaAction.sfs({
                    [`data.inventoryAccountInitData.invoiceInventoryList.${index}.propertyId`]: v,
                    [`data.inventoryAccountInitData.invoiceInventoryList.${index}.propertyName`]: item.propertyName
                })
            }
        } else {
            this.metaAction.sfs({
                [`data.inventoryAccountInitData.invoiceInventoryList.${index}.propertyId`]: null,
                [`data.inventoryAccountInitData.invoiceInventoryList.${index}.propertyName`]: null
            })
        }
    }

    //修改存货
    handleChangeInventory = (v, index) => {

        let row = this.metaAction.gf(`data.inventoryAccountInitData.invoiceInventoryList.${index}`).toJS();//修改的单行数据

        if (v) {
            const { vatOrEntry } = this.component.props;
            const inventory = this.metaAction.gf('data.inventoryAll').toJS();
            const item = inventory.find(o => o.id == v);//获取选择的存货
            //当存货计量单位和发票计量单位相同使转换率默认1
            if (!row.rate && row.unitName && item.unitName && row.unitName === item.unitName) {
                row.rate = 1
            }
            row = {
                ...row,
                inventoryId: v,
                name: item.name,
                propertyId: item.propertyId,
                propertyName: item.propertyName,
                inventoryUnitId: item.unitId || null,
                inventoryUnitName: item.unitName || null,
            }
            //进项需要带出业务类型和存货科目
            if (vatOrEntry) {
                row.businessTypeId = item.propertyId === 4001001 ? v : null
                row.businessTypeName = item.propertyId === 4001001 ? item.name : null
                row.inventoryRelatedAccountId = item.accountId || null
                row.inventoryRelatedAccountName = item.accountName || null
            } else {
                //销项需要带出收入科目或收入类型
                row.revenueType = item.revenueType || null
                row.revenueTypeName = item.revenueTypeName || null
                row.revenueTypeAccountId = item.accountId || null
                row.revenueTypeAccountName = item.accountName || null
            }

        } else {
            row.inventoryId = null
            row.name = null
            row.inventoryUnitId = null
            row.inventoryUnitName = null

            row.businessTypeId = null
            row.businessTypeName = null
            row.inventoryRelatedAccountId = null
            row.inventoryRelatedAccountName = null

            row.revenueType = null
            row.revenueTypeName = null
            row.revenueTypeAccountId = null
            row.revenueTypeAccountName = null

        }
        this.metaAction.sf(`data.inventoryAccountInitData.invoiceInventoryList.${index}`, fromJS(row))
    }

    //改变换算率
    handleChangeRate = (v, index) => {
        // if (!isNaN(Number(v))) {
        this.metaAction.sf(`data.inventoryAccountInitData.invoiceInventoryList.${index}.rate`, v)
        // }
    }

    //改变存货科目
    handleChangeInventoryAccount = (v = null, index, sfsObj = {}, type) => {
        if (v) {
            let inventoryAccount = this.metaAction.gf('data.inventoryAccount').toJS();
            let item = inventoryAccount.find(o => o.id == v)
            // this.metaAction.sfs({
            //     [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryRelatedAccountId`]: v,
            //     [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryRelatedAccountName`]: item.name
            // })
            sfsObj[`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryRelatedAccountId`] = v
            sfsObj[`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryRelatedAccountName`] = item.name
            if (type != 'update') this.metaAction.sfs(sfsObj)
        } else {
            // this.metaAction.sfs({
            //     [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryRelatedAccountId`]: null,
            //     [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryRelatedAccountName`]: null
            // })
            sfsObj[`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryRelatedAccountId`] = null
            sfsObj[`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryRelatedAccountName`] = null
            this.metaAction.sfs(sfsObj)
        }
    }

    //改变收入类型
    handleChangeRevenueType = (v = null, index) => {
        if (v) {
            let revenueTypes = this.metaAction.gf('data.inventoryAccountInitData.revenueTypes').toJS();
            let item = revenueTypes.find(o => o.id == v);
            this.metaAction.sfs({
                [`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueType`]: v,
                [`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueTypeName`]: item.name
            })
        } else {
            this.metaAction.sfs({
                [`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueType`]: null,
                [`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueTypeName`]: null,
            })
        }

    }

    //修改收入科目
    handleChangeRevenueAccount = (v = null, index, sfsObj = {}, type) => {
        if (v) {
            let revenueTypes = this.metaAction.gf('data.inventoryAccountInitData.revenueAccounts').toJS();
            let item = revenueTypes.find(o => o.id == v);
            // this.metaAction.sfs({
            //     [`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueTypeAccountId`]: v,
            //     [`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueAccountName`]: item.name
            // })
            sfsObj[`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueTypeAccountId`] = v
            sfsObj[`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueAccountName`] = item.name
            if (type != 'update') this.metaAction.sfs(sfsObj)
        } else {
            // this.metaAction.sfs({
            //     [`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueTypeAccountId`]: null,
            //     [`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueAccountName`]: null,
            // })
            sfsObj[`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueTypeAccountId`] = null
            sfsObj[`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueAccountName`] = null
            this.metaAction.sfs(sfsObj)
        }
    }

    //自动生成存货档案
    handelGenerateInventory = async (data) => {
        const { vatOrEntry } = this.component.props;
        if (data.length == 0) {
            this.metaAction.toast('error', '请先选择需要自动生成存货的数据');
            return;
        }
        const inventoryAccountLoading = this.metaAction.gf('data.inventoryAccountLoading');
        if (inventoryAccountLoading) {
            this.metaAction.toast('error', '请等待数据加载完成');
            return;
        }
        const list = this.metaAction.gf('data.inventoryAccountInitData.invoiceInventoryList').toJS();

        //选择的数据不准确重新从list中获取数据
        let flag = false;
        let flag2 = false;
        let arr = [];
        data.forEach((o, index) => {
            let keyId = o.keyId - 1;
            let obj = list[keyId];
            arr.push(obj);
            if (!vatOrEntry && !obj.inventoryId) {
                //销项
                flag = true;
            }
            //进项如果为费用
            else if (vatOrEntry && obj.propertyId !== 4001001 && !obj.inventoryId) {
                flag = true;
            }
            else if (vatOrEntry && obj.propertyId === 4001001 && !obj.inventoryId) {
                flag2 = true;
            }
        })
        if (flag2 && !flag) {
            //费用无需生成存货
            this.metaAction.toast('error', '费用类型不能自动生成，请手工选择费用类型');
            return;
        } else if (!flag) {
            this.metaAction.toast('error', '已匹配存货档案，不需要再次生成');
            return;
        }

        //设置
        let setres = await this.handleInventoryAccountSetting();//弹框
        if (!setres) return

        this.metaAction.sf('data.inventoryAccountLoading', true);
        //保存
        const saveres = await this.saveStep3();
        if (!saveres) { this.metaAction.sf('data.inventoryAccountLoading', false); return };

        const res = await this.webapi.generateInventory({
            invoiceInventoryList: this.formatParams(arr)
        });
        let inventory;
        if (vatOrEntry) {
            //进项
            inventory = await this.webapi.queryInventory();//存货
        } else {
            inventory = await this.webapi.inventory();
        }
        if (!inventory) return;
        //进销项返回不一样 进项返回fullName 销项返回fullname
        let inventoryArr = this.getFullName(inventory)
        this.metaAction.sfs({
            'data.inventory': fromJS(inventoryArr),
            'data.inventoryAll': fromJS(inventoryArr)
        })

        let sfsObj = {}
        const invoiceInventoryList = res.invoiceInventoryList

        if (invoiceInventoryList.length) {
            arr.forEach(obj => {
                let item = invoiceInventoryList.find(o => o.id && o.id === obj.id);
                if (item) {
                    item.keyId = obj.keyId;
                    let index = obj.keyId - 1;
                    list[index] = item;
                }
            })
            this.metaAction.sf('data.inventoryAccountInitData.invoiceInventoryList', fromJS(list));
            this.metaAction.toast('success', '存货档案生成成功');
        }

        sfsObj['data.inventoryAccountLoading'] = false
        this.metaAction.sfs(sfsObj)
        // this.metaAction.sf('data.inventoryAccountLoading', false);

    }

    //自动生成存货科目
    handelGenerateInventoryAccount = async (data) => {
        if (data.length == 0) {
            this.metaAction.toast('error', '请选择数据');
            return;
        }
        const inventoryAccountLoading = this.metaAction.gf('data.inventoryAccountLoading');
        if (inventoryAccountLoading) {
            this.metaAction.toast('error', '请等待数据加载完成');
            return;
        }

        const saveres = await this.saveStep3();
        if (!saveres) { return };

        const list = this.metaAction.gf('data.inventoryAccountInitData.invoiceInventoryList').toJS();
        let inventoryAccount = this.metaAction.gf('data.inventoryAccount').toJS();
        //选择的数据不准确重新从list中获取数据
        let flag = false;
        let arr = [];
        let hasInventoryId = false;
        data.forEach((o, index) => {
            let keyId = o.keyId - 1;
            let obj = list[keyId];
            arr.push(obj);
            if (!obj.inventoryRelatedAccountId || !inventoryAccount.find(re => re.id === obj.inventoryRelatedAccountId)) {
                flag = true;
            }
            if (obj.inventoryId) {
                hasInventoryId = true;
            }
        })
        /*if (!flag) {
            this.metaAction.toast('error', '已匹配存货科目，不需要再次生成');
            return;
        }*/
        if (!hasInventoryId) {
            this.metaAction.toast('error', '请先点击自动生成存货档案按钮，再点击自动生成存货科目');
            this.metaAction.sf('data.inventoryAccountLoading', false);
            return;
        }

        const parentRevenueAccounts = this.metaAction.gf('data.inventoryAccountInitData.parentRevenueAccounts').toJS()

        const ret = await this.metaAction.modal('show', {
            title: '自动生成存货科目',
            width: 400,
            wrapClassName: 'inventroy-batch-update-wrap',
            children: <BatchGenerateRevenueAccount
                parentRevenueAccounts={parentRevenueAccounts}
                invoiceInventoryList={this.formatParams(arr)}
                generateRevenueAccount={this.generateRevenueAccountInventory}
                batchAddRevenueAccount={this.batchAddRevenueAccountInventory}
            />
        })
        const result = await Promise.all([
            this.webapi.queryRevenueAccountForArrival(),
            this.webapi.accountQuery({ isEnable: true, isEndNode: true })
        ])
        this.metaAction.sfs({
            'data.inventoryAccountInitData.revenueAccounts': result[0] ? fromJS(result[0].revenueAccounts) : [],
            'data.inventoryAccount': result[1] ? fromJS(result[1].glAccounts) : []
        })

        this.metaAction.sf('data.inventoryAccountLoading', true);

        let sfsObj = {}

        if (ret) {
            const invoiceInventoryList = ret.invoiceInventoryList
            if (invoiceInventoryList.length) {
                arr.forEach(obj => {
                    let item = invoiceInventoryList.find(o => o.inventoryId && o.inventoryId === obj.inventoryId);
                    if (item) {
                        let index = obj.keyId - 1;
                        this.handleChangeInventoryAccount(item.inventoryRelatedAccountId, index, sfsObj, 'update')
                    }
                })
                this.metaAction.toast('success', '自动生成存货科目成功')
            }

        }
        sfsObj['data.inventoryAccountLoading'] = false
        this.metaAction.sfs(sfsObj)

        // this.metaAction.sf('data.inventoryAccountLoading', false);
    }

    //自动生成收入科目
    handelGenerateRevenueAccount = async (data) => {
        if (data.length == 0) {
            this.metaAction.toast('error', '请先选择需要生成收入科目的数据');
            return;
        }
        const inventoryAccountLoading = this.metaAction.gf('data.inventoryAccountLoading');
        if (inventoryAccountLoading) {
            this.metaAction.toast('error', '请等待数据加载完成');
            return;
        }
        const saveres = await this.saveStep3();
        if (!saveres) { return };
        // const list = this.metaAction.gf('data.inventoryAccountInitData.invoiceInventoryList').toJS();
        let list = saveres.invoiceInventoryList;
        //选择的数据不准确重新从list中获取数据
        let flag = false;
        let arr = [];
        data.forEach((o, index) => {
            let keyId = o.keyId - 1;
            let obj = list[keyId];
            arr.push(obj);
            if (obj.inventoryId) {
                flag = true;
            }
        })
        if (!flag) {
            this.metaAction.toast('error', '请先点击自动生成存货档案按钮，再点击自动生成收入科目');
            return;
        }


        // arr = this.formatParams(arr);
        const parentRevenueAccounts = this.metaAction.gf('data.inventoryAccountInitData.parentRevenueAccounts').toJS()

        const ret = await this.metaAction.modal('show', {
            title: '自动生成收入科目',
            width: 400,
            wrapClassName: 'inventroy-batch-update-wrap',
            children: <BatchGenerateRevenueAccount
                parentRevenueAccounts={parentRevenueAccounts}
                invoiceInventoryList={this.formatParams(arr)}
                generateRevenueAccount={this.generateRevenueAccount}
                batchAddRevenueAccount={this.batchAddRevenueAccount}
            />
        })
        //重新获取收入科目
        const newqueryRevenueAccount = await this.webapi.queryRevenueAccount()
        this.metaAction.sf('data.inventoryAccountInitData.revenueAccounts', fromJS(newqueryRevenueAccount.revenueAccounts));
        if (ret) {
            this.metaAction.sf('data.inventoryAccountLoading', true);
            let sfsObj = {}
            const invoiceInventoryList = ret.invoiceInventoryList
            if (invoiceInventoryList.length) {
                arr.forEach(obj => {
                    let item = invoiceInventoryList.find(o => o.inventoryId && o.inventoryId === obj.inventoryId)
                    if (item) {
                        let index = obj.keyId - 1;
                        this.handleChangeRevenueAccount(item.revenueTypeAccountId, index, sfsObj, 'update')
                    }
                })

                this.metaAction.toast('success', '自动生成收入科目成功')
            }

            sfsObj['data.inventoryAccountLoading'] = false
            this.metaAction.sfs(sfsObj)
        }

        // this.metaAction.sf('data.inventoryAccountLoading', false);
    }

    //自动生成存货科目
    generateRevenueAccountInventory = async (parmas) => {
        return await this.webapi.generateInventoryAccount(parmas)
    }

    //自动生成收入科目
    generateRevenueAccount = async (parmas) => {
        return await this.webapi.generateRevenueAccount(parmas)
    }


    //批量修改收入科目
    handelGenerateRevenueType = async (data) => {
        if (data.length == 0) {
            this.metaAction.toast('error', '请先选择需要修改收入科目的数据');
            return;
        }
        // const parentRevenueAccounts = this.metaAction.gf('data.inventoryAccountInitData.parentRevenueAccounts').toJS()
        const parentRevenueAccounts = this.metaAction.gf('data.inventoryAccountInitData.revenueAccounts').toJS()

        const ret = await this.metaAction.modal('show', {
            title: '批量修改收入科目',
            width: 400,
            wrapClassName: 'inventroy-batch-update-wrap',
            children: <BatchGenerateRevenueType
                parentRevenueAccounts={parentRevenueAccounts}
                batchAddRevenuesubject={this.batchAddRevenuesubject}
            />
        })
        //重新获取收入科目

        if (ret) {
            let invoiceInventoryList = this.metaAction.gf('data.inventoryAccountInitData.invoiceInventoryList').toJS();
            data.forEach(o => {
                let index = o.keyId - 1;
                invoiceInventoryList[index].revenueTypeAccountId = ret.id;
                invoiceInventoryList[index].revenueAccountName = ret.name;
            })
            this.metaAction.sf('data.inventoryAccountInitData.invoiceInventoryList', fromJS(invoiceInventoryList));
            this.metaAction.toast('success', '修改收入科目成功');
        }
    }

    //批量修改存货弹框中新增存货或费用
    batchAddInventoryAdd = async () => {
        let set = this.metaAction.gf('data.set'), vatOrEntry = this.component.props.vatOrEntry, ret

        if (set === 4001001) {
            ret = await this.metaAction.modal('show', {
                title: <div style={{ fontSize: '16px', fontWeight: '500' }}>新增费用类型</div>,
                width: 400,
                height: 500,
                footer: '',
                children: this.metaAction.loadApp('scm-incomeexpenses-setting-card', {
                    store: this.component.props.store,
                    columnCode: "common",
                    incomeexpensesTabId: '4001001'
                }),
            })
            if (typeof ret == 'object') {
                // ret = this.getFullName([ret])[0]
                ret.propertyId = 4001001;
                ret.propertyName = '费用';
            }
        } else {
            ret = await this.metaAction.modal('show', {
                title: '新增存货',
                width: 750,
                children: this.metaAction.loadApp(
                    'app-card-inventory', {
                        store: this.component.props.store
                    }
                )
            })
        }

        if (ret.isEnable) {
            let inventoryAll = this.metaAction.gf('data.inventoryAll').toJS();
            inventoryAll.push(this.getFullName([ret])[0]);
            this.metaAction.sfs({
                'data.inventoryAll': fromJS(inventoryAll),
                'data.inventory': fromJS(inventoryAll),
            });
        }
        return ret;
    }

    //批量修改存货 --新增存货
    // batchAddInventory = async (data) => {
    //     const { vatOrEntry } = this.component.props;
    //     if (vatOrEntry) {
    //         let ret = await this.metaAction.modal('show', {
    //             title: <div style={{ fontSize: '16px', fontWeight: '500' }}>新增费用类型</div>,
    //             width: 400,
    //             height: 500,
    //             footer: '',
    //             children: this.metaAction.loadApp('scm-incomeexpenses-setting-card', {
    //                 store: this.component.props.store,
    //                 columnCode: "common",
    //                 incomeexpensesTabId: '4001001'
    //             }),
    //         })
    //         if (ret instanceof Object) {
    //             ret = this.getFullName([ret])[0]
    //             ret.propertyId = 4001001;
    //             ret.propertyName = '费用';
    //             const inventory = this.metaAction.gf('data.inventoryAll').toJS();
    //             inventory.push(ret);

    //             let arr = {
    //                 [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryId`]: ret.id,
    //                 [`data.inventoryAccountInitData.invoiceInventoryList.${index}.name`]: ret.name,
    //                 [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryRelatedAccountId`]: ret.accountId || null,
    //                 [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryRelatedAccountName`]: ret.accountName || null,
    //                 [`data.inventoryAccountInitData.invoiceInventoryList.${index}.businessTypeId`]: ret.id,
    //                 [`data.inventoryAccountInitData.invoiceInventoryList.${index}.businessTypeName`]: ret.name,
    //                 'data.inventoryAll': fromJS(inventory)
    //             };
    //             this.metaAction.sfs(arr);
    //         }
    //     }
    //     else {
    //         let ret = await this.metaAction.modal('show', {
    //             title: '新增存货',
    //             width: 750,
    //             children: this.metaAction.loadApp(
    //                 'app-card-inventory', {
    //                     store: this.component.props.store
    //                 }
    //             )
    //         })
    //         if (ret) {
    //             if (!ret.isEnable) {
    //                 return
    //             }
    //             const inventory = this.metaAction.gf('data.inventoryAll').toJS();
    //             ret = this.getFullName([ret])[0]
    //             inventory.push(ret);

    //             let arr = {}
    //             data.map((item, index) => {
    //                 arr = {
    //                     [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryId`]: ret.id,
    //                     [`data.inventoryAccountInitData.invoiceInventoryList.${index}.name`]: ret.name,
    //                     [`data.inventoryAccountInitData.invoiceInventoryList.${index}.propertyId`]: ret.propertyId,
    //                     [`data.inventoryAccountInitData.invoiceInventoryList.${index}.propertyName`]: ret.propertyName,
    //                     [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryUnitId`]: ret.unitId || null,
    //                     [`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryUnitName`]: ret.unitName || null,
    //                     'data.inventoryAll': fromJS(inventory),
    //                     'data.inventory': fromJS(inventory),
    //                 };
    //                 //进项自动带出存货科目
    //                 if (vatOrEntry) {
    //                     arr[`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryRelatedAccountId`] = ret.accountId || null;
    //                     arr[`data.inventoryAccountInitData.invoiceInventoryList.${index}.inventoryRelatedAccountName`] = ret.accountName || null;
    //                 } else {
    //                     //销项自动带出收入类型或收入科目
    //                     arr[`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueType`] = ret.revenueType || null;
    //                     arr[`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueTypeName`] = ret.revenueTypeName || null;
    //                     arr[`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueTypeAccountId`] = ret.accountId || null;
    //                     arr[`data.inventoryAccountInitData.invoiceInventoryList.${index}.revenueTypeAccountName`] = ret.accountName || null;
    //                 }
    //             })

    //             this.metaAction.sfs(arr);
    //             return ret
    //         }
    //     }

    // }

    //批量修改存货
    handleBatchUpdateInventory = async (data) => {
        if (data.length == 0) {
            this.metaAction.toast('error', '请先选择需要修改存货的数据');
            return;
        }
        const { vatOrEntry } = this.component.props
        if (vatOrEntry) {
            let set = new Set();
            data.forEach(o => {
                if (o.propertyId) set.add(o.propertyId)
            })
            if (set.size > 1) {
                this.metaAction.toast('error', '业务类型不相同，不允许批量修改存货名称，请先批量把业务类型改成相同的');
                return
            }
            let newSet = Array.from(set)
            this.metaAction.sf('data.set', newSet[0]);
            if (newSet[0] === 4001001) {
                this.handleSelectOnFocus('inventoryFocus', 1, 4001001)
            }
        }

        let inventoryList = this.metaAction.gf('data.inventory').toJS()

        const ret = await this.metaAction.modal('show', {
            title: '批量修改存货',
            width: 400,
            wrapClassName: 'inventroy-batch-update-wrap',
            children: <BatchUpdateInventory
                inventoryList={inventoryList}
                batchAddInventoryAdd={this.batchAddInventoryAdd}
                data={data}
            />
        })

        if (ret) {
            let obj = {}

            data.forEach(o => {
                if (!o.rate && o.unitName && ret.unitName && o.unitName === ret.unitName) {
                    o.rate = 1
                }
                o.inventoryId = ret.id;
                o.name = ret.name;
                o.inventoryUnitId = ret.unitId || null;
                o.inventoryUnitName = ret.unitName || null;
                o.propertyId = ret.propertyId;
                o.propertyName = ret.propertyName;

                if (vatOrEntry) {
                    o.businessTypeId = ret.propertyId === 4001001 ? ret.id : null;
                    o.businessTypeName = ret.propertyId === 4001001 ? ret.name : null;
                    o.inventoryRelatedAccountId = ret.accountId || null;
                    o.inventoryRelatedAccountName = ret.accountName || null;
                } else {
                    o.revenueType = ret.revenueType || null;
                    o.revenueTypeName = ret.revenueTypeName || null;
                    o.revenueTypeAccountId = ret.accountId || null;
                    o.revenueTypeAccountName = ret.accountName || null;
                }
                obj[`data.inventoryAccountInitData.invoiceInventoryList.${o.keyId - 1}`] = fromJS(o);
            })
            this.metaAction.sfs(obj);
            this.metaAction.toast('success', '修改存货成功');
        }
        //  else {
        //     let inventory;
        //     if (vatOrEntry) {
        //         //进项
        //         inventory = await this.webapi.queryInventory();//存货
        //     } else {
        //         inventory = await this.webapi.inventory();
        //     }
        //     if (!inventory) return;
        //     //进销项返回不一样 进项返回fullName 销项返回fullname
        //     inventory.forEach(o => {
        //         o.fullname = o.fullName;
        //     })
        //     this.metaAction.sfs({
        //         'data.inventory': fromJS(inventory),
        //         'data.inventoryAll': fromJS(inventory)
        //     })
        // }
    }

    //批量修改存货科目
    handelUpdateInventoryAccount = async (data) => {
        if (data.length == 0) {
            this.metaAction.toast('error', '请先选择需要修改收入科目的数据');
            return;
        }
        // const parentRevenueAccounts = this.metaAction.gf('data.inventoryAccountInitData.parentRevenueAccounts').toJS()
        const inventoryAccount = this.metaAction.gf('data.inventoryAccount').toJS()

        const ret = await this.metaAction.modal('show', {
            title: '批量修改存货科目',
            width: 400,
            wrapClassName: 'inventroy-batch-update-wrap',
            children: this.metaAction.loadApp('ttk-scm-app-collate-invoice-batch-update-inventory-account', {
                store: this.component.props.store,
                inventoryAccount,
                // batchAddInventoryAccount: this.batchAddInventoryAccount
            }),
        })
        // 重新存货科目
        const res = await this.webapi.accountQuery({ isEnable: true, isEndNode: true });
        this.metaAction.sf('data.inventoryAccount', fromJS(res.glAccounts))
        if (ret) {
            let invoiceInventoryList = this.metaAction.gf('data.inventoryAccountInitData.invoiceInventoryList').toJS();
            data.forEach(o => {
                let index = o.keyId - 1;
                invoiceInventoryList[index].inventoryRelatedAccountId = ret.id;
                invoiceInventoryList[index].inventoryRelatedAccountName = ret.name;
            })
            this.metaAction.sf('data.inventoryAccountInitData.invoiceInventoryList', fromJS(invoiceInventoryList));
            this.metaAction.toast('success', '修改存货科目成功');
        }
    }

    // 批量修改换算率
    handleBatchChangeRate = async (data) => {
        if (data.length == 0) {
            this.metaAction.toast('error', '请先选择需要修改换算率的数据');
            return;
        }

        let flag = false

        data.forEach(o => {
            let index = o.keyId - 1;
            if (o.inventoryUnitName && o.unitName) {
                flag = true
            }
        })

        if (!flag) {
            this.metaAction.toast('error', '请先选择需要修改换算率的数据');
            return;
        }

        const ret = await this.metaAction.modal('show', {
            title: '批量修改换算率',
            width: 400,
            wrapClassName: 'inventroy-batch-update-wrap',
            children: <BatchUpdateChangeRate

            />
        })

        if (ret) {
            let invoiceInventoryList = this.metaAction.gf('data.inventoryAccountInitData.invoiceInventoryList').toJS();
            data.forEach(o => {
                let index = o.keyId - 1;
                if (invoiceInventoryList[index].inventoryUnitName && invoiceInventoryList[index].unitName) {
                    invoiceInventoryList[index].rate = ret;
                }
            })
            this.metaAction.sf('data.inventoryAccountInitData.invoiceInventoryList', fromJS(invoiceInventoryList));
            this.metaAction.toast('success', '修改换算率成功');
        }
    }

    //批量修改收入类型
    handelUpdateInventory = async (data) => {
        if (data.length == 0) {
            this.metaAction.toast('error', '请先选择需要修改收入类型的数据');
            return;
        }
        //const inventory = this.metaAction.gf('data.inventory').toJS()

        const ret = await this.metaAction.modal('show', {
            title: '批量修改收入类型',
            width: 400,
            wrapClassName: 'inventroy-batch-update-wrap',
            children: <BatchUpdateRevenueType
                revenueTypes={revenueTypes}
                batchAddRevenueType={this.batchAddRevenueType}
            />
        })
        //重新获取收入类型


        if (ret) {
            let invoiceInventoryList = this.metaAction.gf('data.inventoryAccountInitData.invoiceInventoryList').toJS();
            data.forEach(o => {
                let index = o.keyId - 1;
                invoiceInventoryList[index].revenueType = ret.id;
                invoiceInventoryList[index].revenueTypeName = ret.name;
            })
            this.metaAction.sf('data.inventoryAccountInitData.invoiceInventoryList', fromJS(invoiceInventoryList));
            this.metaAction.toast('success', '修改收入类型成功');
        }
    }

    //批量修改收入类型
    handleBatchUpdateRevenueType = async (data) => {
        if (data.length == 0) {
            this.metaAction.toast('error', '请先选择需要修改收入类型的数据');
            return;
        }
        const revenueTypes = this.metaAction.gf('data.inventoryAccountInitData.revenueTypes').toJS()

        const ret = await this.metaAction.modal('show', {
            title: '批量修改收入类型',
            width: 400,
            wrapClassName: 'inventroy-batch-update-wrap',
            children: <BatchUpdateRevenueType
                revenueTypes={revenueTypes}
                batchAddRevenueType={this.batchAddRevenueType}
            />
        })
        //重新获取收入类型

        if (ret) {
            let invoiceInventoryList = this.metaAction.gf('data.inventoryAccountInitData.invoiceInventoryList').toJS();
            data.forEach(o => {
                let index = o.keyId - 1;
                invoiceInventoryList[index].revenueType = ret.id;
                invoiceInventoryList[index].revenueTypeName = ret.name;
            })
            this.metaAction.sf('data.inventoryAccountInitData.invoiceInventoryList', fromJS(invoiceInventoryList));
            this.metaAction.toast('success', '修改收入类型成功');
        }
    }

    //进项批量修改业务类型
    handleBatchUpdateProperty = async (data) => {
        if (data.length == 0) {
            this.metaAction.toast('error', '请先选择需要修改业务类型的数据');
            return;
        }
        const properties = this.metaAction.gf('data.inventoryAccountInitData.properties').toJS()
        const inventoryAll = this.metaAction.gf('data.inventoryAll').toJS();
        const businessTypes = inventoryAll.filter(o => o.propertyId === 4001001);//费用类型
        const ret = await this.metaAction.modal('show', {
            title: '批量修改业务类型',
            width: 400,
            wrapClassName: 'inventroy-batch-update-wrap',
            children: <BatchUpdateProperty
                properties={properties}
                businessTypes={businessTypes}
            />
        })

        if (ret) {
            let { property, business } = ret;
            let invoiceInventoryList = this.metaAction.gf('data.inventoryAccountInitData.invoiceInventoryList').toJS();
            data.forEach(o => {
                let index = o.keyId - 1;
                invoiceInventoryList[index].propertyId = property.propertyId;
                invoiceInventoryList[index].propertyName = property.propertyName;
                //批量修改为费用（同时修改费用类型）
                if (property.propertyId === 4001001) {
                    invoiceInventoryList[index].inventoryId = business.id;
                    invoiceInventoryList[index].name = business.name;
                    invoiceInventoryList[index].inventoryUnitId = null;
                    invoiceInventoryList[index].inventoryUnitName = null;
                    invoiceInventoryList[index].businessTypeId = business.id;
                    invoiceInventoryList[index].businessTypeName = business.name;
                    invoiceInventoryList[index].inventoryRelatedAccountId = business.accountId || null;
                    invoiceInventoryList[index].inventoryRelatedAccountName = business.accountName || null;
                }
            })
            this.metaAction.sf('data.inventoryAccountInitData.invoiceInventoryList', fromJS(invoiceInventoryList));
            this.metaAction.toast('success', '修改业务类型成功');
        }
    }

    //保存
    saveStep3 = async () => {
        let invoiceInventoryList = this.metaAction.gf('data.inventoryAccountInitData.invoiceInventoryList').toJS();
        invoiceInventoryList = this.formatParams(invoiceInventoryList);

        const res = await this.webapi.getInvoiceInvSave({
            invoiceInventoryList
        });

        if (res) {
            res.invoiceInventoryList = this.formatData(res.invoiceInventoryList);
            this.metaAction.sf('data.inventoryAccountInitData.invoiceInventoryList', fromJS(res.invoiceInventoryList))
            return res;
        } else {
            return false;
        }
    }

    //接口参数格式化据 默认为null
    formatParams = (data) => {
        data = fromJS(data).toJS();
        let { revenueAccounts, relatedAccountEnable, costAccountEnable, revenueTypes } = this.metaAction.gf('data.inventoryAccountInitData').toJS();
        let inventoryAccount = this.metaAction.gf('data.inventoryAccount').toJS();
        let { vatOrEntry } = this.component.props;

        data.forEach((o, index) => {
            delete o.keyId;
            o.rate = Number(o.rate) || null;
            if (!o.specification) o.specification = null;//规格型号默认值
            if (!o.unitId) o.unitId = null;
            if (!o.unitName) o.unitName = null;
            if (!o.inventoryUnitId) o.inventoryUnitId = null;
            if (!o.inventoryUnitName) o.inventoryUnitName = null;
            if (!o.propertyId) o.propertyId = null;
            if (!o.propertyName) o.propertyName = null;
            if (!o.revenueType) o.revenueType = null;
            if (!o.revenueTypeName) o.revenueTypeName = null;
            if (!o.inventoryRelatedAccountId) o.inventoryRelatedAccountId = null;
            if (!o.inventoryRelatedAccountName) o.inventoryRelatedAccountName = null;

            if (o.businessTypeId) {
                //有费用id使用费用id(费用改为存货的情况，需要传businessTypeId而不是存货id,所以不能使用propertyId来判断)
                o.inventoryId = null;
                o.name = null;
            }
            if (!o.businessTypeId) {
                o.businessTypeId = null;
                o.businessTypeName = null;
            }
            if (!o.inventoryId) {
                o.inventoryId = null;
                o.name = null;
            }

            if (vatOrEntry && o.inventoryRelatedAccountId) {
                //进项启用存货科目
                if (!inventoryAccount.find(re => re.id === o.inventoryRelatedAccountId)) {
                    o.inventoryRelatedAccountId = null;
                    o.inventoryRelatedAccountName = null;
                }

            }

            if (!vatOrEntry && o.revenueTypeAccountId && revenueAccounts) {
                //销项启用收入科目
                if (!revenueAccounts.find(re => re.id === o.revenueTypeAccountId)) {
                    o.revenueTypeAccountId = null;
                    o.revenueTypeAccountName = null;
                }
            }

            if (!vatOrEntry && o.revenueType && revenueTypes) {
                if (!revenueTypes.find(re => re.id === o.revenueType)) {
                    o.revenueType = null;
                    o.revenueTypeName = null;
                }
            }
        })

        return data;


    }

    //显示数据格式化(存在id但是下拉框中没有数据清空id)
    formatData = (data) => {


        data.forEach((o, index) => {
            o.keyId = index + 1;
            if (o.propertyId === 4001001) {
                //费用时返回businessTypeName将费用赋值给存货
                o.inventoryId = o.businessTypeId;
                o.name = o.businessTypeName;
            }



        })
        return data;
    }



    //获取选中明细
    getSeletedData = (tableCheckbox) => {

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

    //切换 全部/未匹配
    handleSwitchMatchType = async (e) => {
        this.metaAction.sf('data.inventoryAccountLoading', true);
        const inventoryName = this.metaAction.gf('data.inventoryName');
        let invoiceInventoryList = this.metaAction.gf('data.inventoryAccountInitData.invoiceInventoryList');
        invoiceInventoryList = this.formatParams(invoiceInventoryList)
        const onlyNotMatch = e.target.value;
        this.metaAction.sf('data.onlyNotMatch', onlyNotMatch);
        await this.initInventoryAcountList({
            onlyNotMatch,
            inventoryName,
            invoiceInventoryList
        })
        this.metaAction.sf('data.inventoryAccountLoading', false);
    }

    //改变搜索条件
    handleInventoryAccountInputChange = (e) => {
        let value = e.target.value || null;
        if (value) value = value.trim();
        this.metaAction.sf('data.inventoryName', value);
    }

    //搜索
    handleInventoryAccountOnSearch = async () => {
        const loading = this.metaAction.gf('data.inventoryAccountLoading');
        if (loading) return
        this.metaAction.sf('data.inventoryAccountLoading', true);
        const inventoryName = this.metaAction.gf('data.inventoryName')
        await this.initInventoryAcountList({ inventoryName });
        this.metaAction.sf('data.inventoryAccountLoading', false);
    }

    //支持搜索
    handFilterOption = (inputValue, option, name) => {

        inputValue = inputValue.replace(/\\/g, "\\\\")
        if (!option || !option.props || !option.props.value) return false
        let regExp = new RegExp(inputValue, 'i');
        let account, paramsValue;

        if (name === 'inventory') {
            account = this.metaAction.gf('data.inventory');
        } else if (name === 'inventoryAccount') {
            account = this.metaAction.gf('data.inventoryAccount');
        } else if (name === 'revenueTypes') {
            account = this.metaAction.gf('data.inventoryAccountInitData.revenueTypes');
        } else if (name === 'properties') {
            account = this.metaAction.gf('data.inventoryAccountInitData.properties');
        } else if (name === 'revenueAccount') {
            account = this.metaAction.gf('data.inventoryAccountInitData.revenueAccounts');
        } else {
            return false
        }

        if (name === 'properties') {
            paramsValue = account.find(item => item.get('propertyId') == option.props.value)
            if (!paramsValue) {
                return false
            }
        } else {
            paramsValue = account.find(item => item.get('id') == option.props.value)
            if (!paramsValue) {
                return false
            }
        }
        if (paramsValue.get('propertyName') && paramsValue.get('propertyName').search(regExp) != -1) {
            return true
        }
        if (paramsValue.get('name') && paramsValue.get('name').search(regExp) != -1) {
            return true
        }
        if (paramsValue.get('fullname') && paramsValue.get('fullname').search(regExp) != -1) {
            return true
        }
        if (paramsValue.get('codeAndName') && paramsValue.get('codeAndName').search(regExp) != -1) {
            return true
        }
        if (paramsValue.get('helpCode') && paramsValue.get('helpCode').search(regExp) != -1) {
            return true
        }
        if (paramsValue.get('helpCodeFull') && paramsValue.get('helpCodeFull').search(regExp) != -1) {
            return true
        }

        return false;
    }

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, voucherAction }),
        ret = { ...metaAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}