import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { List, fromJS, toJS } from 'immutable'
import { Icon, Input } from 'edf-component'
import moment from 'moment'
import extend from './extend'
import config from './config'
import BatchUpdateModal from './components/BatchUpdateModal'

//起始编码格式化
const formatStarCode = (s) => {
    let last = s.charAt(s.length - 1);
    let res = null
    if (!isNaN(Number(last))) {
        let b = ''
        s = s.replace(/\d+$/g, function (num) {
            b = num
            return ''
        })

        res = Number(b) + 1
        let w = b.length - String(res).length
        if (w > 0) {
            for (let i = 0; i < w; i++) {
                res = '0' + res
            }
        }
        res = s + res
    } else {
        res = s + 1
    }

    return res;
}
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi = this.config.webapi
        if (option.extendAction.gridAction) {
            this.option = option.extendAction.gridAction.option
        }
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections

        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel);
        }
        this.callbackres = null;
        injections.reduce('init', { softAppName: this.component.props.softAppName })
        this.load()
    }

    load = async () => {
        this.metaAction.sf('data.loading', true);
        const { vatOrEntry, baseUrl, softAppName, arrivalIdList = [], deliveryIdList = [] } = this.component.props;
        this.metaAction.sf('data.other.vatOrEntry', vatOrEntry);

        let res = await Promise.all([
            this.webapi.tplus.generateArchive({ deliveryIdList, arrivalIdList }),//生成档案
            this.webapi.tplus.common(`${baseUrl}/common/account/queryIsAux`, {}, this.getOrgId()),//是否启用辅助核算
            this.webapi.tplus.queryAccountEnable({ entranceFlag: "system" }),//是否启用明细
            this.webapi.tplus.ruleGet(),//自动生成档案科目规则
        ]);

        const { customerIds, inventoryIds, supplierIds } = res[0];
        const isAux = res[1];
        let accountEnable = res[2];
        let ruleRes = res[3];

        //生成档案
        //const { customerIds, inventoryIds, supplierIds } = await this.webapi.tplus.generateArchive({ deliveryIdList, arrivalIdList });
        this.ids = {
            customerIds,
            inventoryIds,
            supplierIds
        };

        //是否启用辅助核算
        //const isAux = await this.webapi.tplus.common(`${baseUrl}/common/account/queryIsAux`, {}, this.getOrgId())
        //是否启用明细

        //let accountEnable = await this.webapi.tplus.queryAccountEnable({ entranceFlag: "system" });//启用明细设置
        let ruleDto = {
            "customerSet": false,//不自动生成客户档案
            "customerCodeRule": 2,//编码按照拼音
            "customerAccountSet": false,//不自动生成客户往来档案
            "supplierSet": false,
            "supplierCodeRule": 2,
            "supplierAccountSet": false,
            "inventorySet": false,
            "inventoryCodeRule": 2,
            "inventoryAccountSet": false,
        }
        //生成规则
        //let ruleRes = await this.webapi.tplus.ruleGet();

        this.metaAction.sf('data.loading', false);
        if (ruleRes) {
            ruleDto = ruleRes;
        }
        this.metaAction.sf('data.other.ruleDto', fromJS(ruleDto));

        let accountEnableDto = {
            currentAccount: 0,
            inventoryAccount: 0,
            revenueAccount: 0,
            saleAccount: 0,
        }
        if (accountEnable.accountEnableDto) {
            accountEnableDto = accountEnable.accountEnableDto;
            this.metaAction.sf('data.other.accountEnableDto', fromJS(accountEnableDto));//
        }
        let { currentAccount, inventoryAccount, revenueAccount, saleAccount } = accountEnableDto;
        if (isAux && isAux.error) {
            this.metaAction.toast('error', `${isAux.error.message}`)
            return
        } else if (isAux && isAux.result) {
            let AuxEnableDto = {
                consumer: false,
                supplier: false,
                inventory: false,
                department: false,
                item: false,
                person: false,
            }
            if (isAux.value) {
                AuxEnableDto = isAux.value
            }
            this.metaAction.sf('data.other.isAux', fromJS(AuxEnableDto))
            let { consumer, supplier, inventory, department, item, person } = AuxEnableDto;

            if (vatOrEntry == 0) {
                if (!consumer && !inventory && !currentAccount && !revenueAccount) {
                    //销项没有启用明细和辅助核算
                    await this.skipToStep2();
                } else {
                    const list = []
                    if (consumer || currentAccount) {
                        list.push(this.loadCustomer())
                    }
                    if (inventory || revenueAccount) {
                        list.push(this.loadInventory())
                        if (!consumer && !currentAccount) this.metaAction.sf('data.other.tab1', '3')
                    }
                    await Promise.all(list);
                }
            } else {
                if (!supplier && !inventory && !currentAccount && !inventoryAccount) {
                    await this.skipToStep2();
                } else {
                    const list = [];
                    if (supplier || currentAccount) {
                        list.push(this.loadSupplier());
                        this.metaAction.sf('data.other.tab1', '2')
                    }
                    if (inventory || inventoryAccount) {
                        list.push(this.loadInventory());
                        if (!supplier && !currentAccount) this.metaAction.sf('data.other.tab1', '3')
                    }
                    await Promise.all(list);
                }
            }

        } else {
            this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
        }

    }
    //是否显示上一步按钮
    backStepButton = () => {
        const step = this.metaAction.gf('data.other.step');
        const isAux = this.metaAction.gf('data.other.isAux');
        const { vatOrEntry } = this.component.props;
        let accountEnableDto = this.metaAction.gf('data.other.accountEnableDto').toJS();
        let {
            currentAccount,
            inventoryAccount,
            revenueAccount,
        } = accountEnableDto;

        if (!isAux) return false
        const { consumer, supplier, inventory } = isAux.toJS();

        if (!vatOrEntry) {
            return (consumer || inventory || currentAccount || revenueAccount) && step == 2 ? true : false
        } else {
            return (supplier || inventory || currentAccount || inventoryAccount) && step == 2 ? true : false
        }
    }
    nextStepButton = () => {
       // const step = this.metaAction.gf('data.other.step');
        const isAux = this.metaAction.gf('data.other.isAux');
        let accountEnableDto = this.metaAction.gf('data.other.accountEnableDto').toJS();

        if (!isAux) return false
        const { consumer, supplier, inventory } = isAux.toJS();
        let {
            currentAccount,
            inventoryAccount,
            revenueAccount,
        } = accountEnableDto;
        const { vatOrEntry } = this.component.props;
        if (vatOrEntry == 0) {
            return (consumer || inventory || currentAccount || revenueAccount)
        } else {
            return (supplier || inventory || currentAccount || inventoryAccount)
        }
    }
    onOk = () => {
        if (this.callbackres) {
            this.component.props.closeModal(this.callbackres);
        } else {
            this.component.props.closeModal('false');
        }
    }
    onCancel = () => {
        if (this.callbackres) {
            this.component.props.closeModal(this.callbackres);
        } else {
            this.component.props.closeModal('false');
        }
    }
    //切换档案tab
    changFileTab = async (key) => {
        this.metaAction.sf('data.other.tab1', key);
        if (key == '1') {
            await this.loadCustomer()
        }
        else if (key == '2') {
            await this.loadSupplier()
        }
        else if (key == '3') {
            await this.loadInventory();
        }
    }
    //切换科目tab
    changAccountTab = async (key) => {
        this.metaAction.sf('data.other.tab2', key);
        if (key == '1') {
            await this.loadRevenueType();
        } else if (key == '2') {
            await this.loadInventoryType();
        } else if (key == '3') {
            await this.loadBusiness();
        } else if (key == '4') {
            await this.loadSettle();
        } else if (key == '5') {
            await this.loadTax();
        } else if (key == '6') {
            await this.loadAsset();
        }
    }

    loadTAccount = async () => {
        const { baseUrl, softAppName } = this.component.props;
        let account = this.metaAction.gf('data.other.account').toJS()
        if (account.length == 0) {
            //重新获取下account
            account = await this.webapi.tplus.common(`${baseUrl}/common/account/query`, {
                year: moment(this.metaAction.context.get('currentOrg').periodDate).format('YYYY')
            }, this.getOrgId())
            if (account && account.result) {
                account = account.value
                account.forEach(
                    o => o.codeAndName = o.code + " " + o.name
                )
                this.metaAction.sf('data.other.account', fromJS(account));
                return account;
            } else if (account && account.error) {
                this.metaAction.toast('error', account.error.message);
                return [];
            } else {
                this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`);
                return [];
            }
        } else {
            return account
        }
    }
    //判断是否需要重新加载数据
    needReload = (name, type) => {
        return true;
        //判断是否需要重新加载
        let flag = false;
        let list = this.metaAction.gf(`data.form.${name}`).toJS();
        if (list.length == 0) {
            flag = true;
        } else {
            if (type == 'file') {
                list.forEach((o) => {
                    if (!o.mappingCode) {
                        flag = true;
                    }
                })
            } else {
                list.forEach(o => {
                    if (!o.accountCode) {
                        flag = true;
                    }
                })
            }
        }
        return flag
    }

    //------加载档案
    loadTCustomer = async (customerIds) => {
        //获取T+客户
        const { baseUrl, softAppName } = this.component.props;

        const isAux = this.metaAction.gf('data.other.isAux').toJS();//是否启用辅助核算
        const currentAccount = this.metaAction.gf('data.other.accountEnableDto.currentAccount');


        let customer = {}, account = {};

        // let wake = (time) => {
        //     return new Promise((resolve, reject) => {
        //         setTimeout(() => {
        //             new Error(`${time / 1000}秒后醒来`)
        //         }, time)
        //     })
        // }
        // let p1 = wake(10000)
        let arr = [
            // p1,
            this.webapi.tplus.customer({ idList: customerIds })
        ]
        if (isAux.consumer) {
            arr.push(this.webapi.tplus.common(`${baseUrl}/common/consumer/query`, {}, this.getOrgId()))
        }
        if (currentAccount) {
            //启用了往来科目明细获取往来科目
            arr.push(this.webapi.tplus.common(`${baseUrl}/common/account/query`, { year: moment(this.metaAction.context.get('currentOrg').periodDate).format('YYYY') }, this.getOrgId()))
        }
        const res = await Promise.all(arr)
        const [res0, res1, res2] = res;
        if (!res0.list) {
            this.metaAction.toast('error', '获取客户档案列表失败')
        }
        if (res1 && res1.error) {
            this.metaAction.toast('error', `${res1.error.message}`);
        } else if (res1 && res1.result) {
            if (isAux.consumer) {
                customer = res1;
            } else if (currentAccount) {
                account = res1;
            }
        } else {
            this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`);
        }
        if (arr.length == 3) {
            if (res2 && res2.error) {
                this.metaAction.toast('error', `${res2.error.message}`);
            } else if (res2 && res2.result) {
                account = res2;
            } else {
                this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`);
            }
        }
        return {
            customerList: res0.list || [],
            customer,
            account
        }

    }

    //加载客户档案列表
    loadCustomer = async () => {
        const { baseUrl, softAppName } = this.component.props;
        //是否加载中
        const customerLoading = this.metaAction.gf('data.customerLoading');
        if (customerLoading) return

        //是否需要重新加载
        let flag = this.needReload('customerList', 'file');
        if (!flag) return

        this.metaAction.sf('data.customerLoading', true);
        let { currentAccount } = this.metaAction.gf('data.other.accountEnableDto').toJS();
        let isAux = this.metaAction.gf('data.other.isAux').toJS();

        let { customerSet: autoAddCustomer, customerAccountSet: autoAddCustomerCurrentAccount, customerClassCode = null, customerCodeRule, customerStarCode, customerParentAccountCode } = this.metaAction.gf('data.other.ruleDto').toJS();
        const { customerIds } = this.ids;
        let { customerList, customer, account } = await this.loadTCustomer(customerIds, currentAccount);

        //自动匹配客户档案 获取存货档案失败则不进行匹配(启用了客户辅助核算)
        if (isAux.consumer && customer.value) {
            let needUpdateList = [], needAddList = [];
            customerList.forEach(
                o => {
                    //是否匹配T+code
                    let isMapCode = customer.value.find(p => p.code == o.mappingCode);
                    if (!isMapCode) {
                        //需要修改的数据
                        needUpdateList.push(o);
                    }
                    if (autoAddCustomer) {
                        //是否匹配T+name
                        let isMapName = customer.value.find(b => b.name == o.archiveName);
                        if (!isMapName) {
                            //需要新增的客户
                            needAddList.push({
                                name: o.archiveName,//名称
                                partnerClass: {
                                    code: customerClassCode,//客户分类
                                },
                                codeType: customerCodeRule === 1 ? 'number' : 'pinyin',//编码规则
                                code: customerCodeRule === 1 ? customerStarCode : null
                            })
                            if (customerCodeRule === 1) {
                                customerStarCode = formatStarCode(customerStarCode);
                            }
                        }
                    }


                }
            )
            //自动新增T+客户档案
            if (autoAddCustomer && needAddList.length > 0) {
                //批量新增T+客户
                const res = await this.webapi.tplus.common(`${baseUrl}/common/consumer/createBatch`, needAddList, this.getOrgId());
                if (res && res.error) {
                    //this.metaAction.sf('data.customerLoading', false);
                    // this.metaAction.toast('error', `${res.error.message}`);
                } else if (res && res.result) {
                    //重新获取T+客户
                    customer = await this.webapi.tplus.common(`${baseUrl}/common/consumer/query`, {}, this.getOrgId())
                } else {
                    //this.metaAction.sf('data.customerLoading', false);
                    this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
                }
            }

            //批量修改T+客户档案
            if (needUpdateList.length > 0) {
                const setList = []
                needUpdateList.forEach(o => {
                    let item = customer.value.find(p => p.name == o.archiveName);
                    if (item) {
                        setList.push({
                            ...o,
                            mappingCode: item.code,

                        })
                    }
                })
                if (setList.length > 0) {
                    const ret = await this.webapi.tplus.customerSet(setList);
                    //批量修改后重新获取列表数据（不论批量修改成功与否,因为生成往来科目需要T+档案）
                    let res = await this.webapi.tplus.customer({ idList: customerIds });
                    customerList = res.list || []
                    if (ret === null) {

                    } else {
                        //this.metaAction.sf('data.customerLoading', false);
                        this.metaAction.toast('error', '自动绑定客户失败')
                        // return
                    }
                }
            }

            //更新最新的起始编码
            if (autoAddCustomer && customerCodeRule === 1) {
                this.metaAction.sf('data.other.ruleDto.customerStarCode', customerStarCode);
                await this.webapi.tplus.updateStarCode({ customerStarCode })
            }
        }

        //自动匹配客户往来科目(1、启用了明细2、启用了自动生成3、存在T+档案)
        if (currentAccount && account.value) {
            let needUpdateList = [], needAddList = [];
            let endClassAccount = account.value;//
            if (autoAddCustomerCurrentAccount) {
                endClassAccount = account.value.filter((a) => {
                    return new RegExp(`^${customerParentAccountCode}`).test(a.code)
                });//
            }
            customerList.forEach(
                o => {
                    //启用了辅助核算(按照档案名称映射)
                    if (isAux.consumer) {
                        //是否匹配了档案
                        let isMapCode = customer.value.find(p => p.code == o.mappingCode);
                        if (isMapCode) {
                            //是否匹配T+往来科目
                            let isMapAccoutCode = account.value.find(p => p.code == o.accountCode);
                            if (!isMapAccoutCode) {
                                //需要修改的数据
                                needUpdateList.push(o);
                            }
                            //是否匹配T+name(需要在选择的上级科目中判断是否存在相同的名称)
                            if (autoAddCustomerCurrentAccount) {
                                let isMapName = endClassAccount.find(b => b.name == isMapCode.name);
                                if (!isMapName) {
                                    //需要新增的往来科目
                                    needAddList.push({
                                        name: isMapCode.name,//名称(档案名称)
                                        parentCode: customerParentAccountCode,//上级编码
                                        year: this.metaAction.context.get("currentOrg").periodDate.slice(0, 4),
                                        aux: {
                                            isCalcQuantity: false,
                                            unitDto: {
                                                // id: "1",
                                                // code: "001",
                                                // name: "个"
                                            },
                                            isCalcMulti: false
                                        }
                                    })
                                }
                            }

                        }
                    } else {
                        //没有启用辅助核算按照客户名称
                        //是否匹配T+往来科目
                        let isMapAccoutCode = account.value.find(p => p.code == o.accountCode);
                        if (!isMapAccoutCode) {
                            //需要修改的数据
                            needUpdateList.push(o);
                        }

                        if (autoAddCustomerCurrentAccount) {
                            //是否匹配T+name
                            let isMapName = endClassAccount.find(b => b.name == o.archiveName);
                            if (!isMapName) {
                                //需要新增的往来科目
                                needAddList.push({
                                    name: o.archiveName,//名称(档案名称)
                                    parentCode: customerParentAccountCode,//上级编码
                                    year: this.metaAction.context.get("currentOrg").periodDate.slice(0, 4),
                                    aux: {
                                        isCalcQuantity: false,
                                        unitDto: {
                                            // id: "1",
                                            // code: "001",
                                            // name: "个"
                                        },
                                        isCalcMulti: false
                                    }
                                })
                            }
                        }

                    }

                }
            )

            //批量新增往来科目（启用自动生成上级科目）
            if (autoAddCustomerCurrentAccount && needAddList.length > 0) {
                const res = await this.webapi.tplus.common(`${baseUrl}/common/account/createBatch`, needAddList, this.getOrgId());
                if (res && res.error) {
                    //this.metaAction.sf('data.customerLoading', false);
                    // this.metaAction.toast('error', `${res.error.message}`);
                } else if (res && res.result) {
                    //重新获取T+往来科目
                    const periodDate = this.metaAction.context.get("currentOrg").periodDate
                    const newPeriodDate = periodDate.slice(0, 4)
                    const newOptions = { 'year': newPeriodDate };
                    account = await this.webapi.tplus.common(`${baseUrl}/common/account/query`, newOptions, this.getOrgId())
                } else {
                    //this.metaAction.sf('data.customerLoading', false);
                    this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
                }
            }

            //批量修改往来科目
            if (needUpdateList.length > 0) {
                const setList = [];
                let endClassAccount = account.value;
                if (autoAddCustomerCurrentAccount) {
                    //启用了自动生成存在上级科目
                    endClassAccount = account.value.filter((a) => {
                        return new RegExp(`^${customerParentAccountCode}`).test(a.code)
                    });//
                }
                if (isAux.consumer) {
                    //启用了辅助核算
                    needUpdateList.forEach(o => {
                        let isMapCode = customer.value.find(p => p.code == o.mappingCode);
                        if (isMapCode) {

                            let item = endClassAccount.find(p => p.name == isMapCode.name);
                            if (item) {
                                setList.push({
                                    ...o,
                                    accountCode: item.code
                                })
                            }
                        }
                    })
                } else {
                    //没有启用辅助核算
                    needUpdateList.forEach(o => {
                        let item = endClassAccount.find(p => p.name == o.archiveName);
                        if (item) {
                            setList.push({
                                ...o,
                                accountCode: item.code
                            })
                        }
                    })
                }

                if (setList.length > 0) {
                    const ret = await this.webapi.tplus.customerSet(setList);
                    let res = await this.webapi.tplus.customer({ idList: customerIds });
                    customerList = res.list || []
                    if (ret !== null) {
                        this.metaAction.toast('error', '自动映射客户往来科目失败')
                    }
                }
            }
        }

        let obj = {}
        let options = {}
        if (isAux.consumer) {
            customer.value ? customer.value.forEach(
                (o) => {
                    o.codeAndName = o.code + " " + o.name;
                }
            ) : customer.value = [];
            obj['data.other.customer'] = fromJS(customer.value);
            options['doc'] = customer.value;
        }
        if (currentAccount) {
            account.value ? account.value.forEach(
                (o) => {
                    o.codeAndName = o.code + " " + o.name;
                }
            ) : account.value = [];
            obj['data.other.account'] = fromJS(account.value);
            options['account'] = account.value;
        }

        this.handlefilterDoc(customerList, options);
        obj['data.form.customerList'] = fromJS(customerList);
        obj['data.customerLoading'] = false;
        this.injections.reduce('sfs', obj);
    }



    loadTSupplier = async (supplierIds) => {
        const { baseUrl, softAppName } = this.component.props;
        const isAux = this.metaAction.gf('data.other.isAux').toJS();//是否启用辅助核算
        const currentAccount = this.metaAction.gf('data.other.accountEnableDto.currentAccount');

        let arr = [
            this.webapi.tplus.supplier({ idList: supplierIds })
        ];
        if (isAux.supplier) {
            arr.push(this.webapi.tplus.common(`${baseUrl}/common/supplier/query`, {}, this.getOrgId()))
        }
        if (currentAccount) {
            arr.push(this.webapi.tplus.common(`${baseUrl}/common/account/query`, { year: this.metaAction.context.get("currentOrg").periodDate.slice(0, 4) }, this.getOrgId()))
        }

        let supplier = {}, account = {};
        const [res0, res1, res2] = await Promise.all(arr)

        if (!res0.list) {
            this.metaAction.toast("error", '获取供应商档案失败');
        }
        if (res1 && res1.error) {
            this.metaAction.toast('error', `${res1.error.message}`);
        } else if (res1 && res1.result) {
            if (isAux.supplier) {
                supplier = res1;
            } else if (currentAccount) {
                account = res1;
            }
        } else {
            this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`);
        }
        if (arr.length == 3) {
            if (res2 && res2.error) {
                this.metaAction.toast('error', `${res2.error.message}`);
            } else if (res2 && res2.result) {
                account = res2;
            } else {
                this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`);
            }
        }
        return {
            supplierList: res0.list || [],
            supplier,
            account
        }
    }

    //加载供应商档案列表
    loadSupplier = async () => {
        const { baseUrl, softAppName } = this.component.props;
        //是否加载中
        const supplierLoading = this.metaAction.gf('data.supplierLoading');
        if (supplierLoading) return

        //是否需要重新加载
        let flag = this.needReload('supplierList', 'file');
        if (!flag) return

        this.metaAction.sf('data.supplierLoading', true);

        let { supplierSet: autoAddSupplier, supplierAccountSet: autoAddSupplierCurrentAccount, supplierClassCode = null, supplierCodeRule, supplierStarCode, supplierParentAccountCode } = this.metaAction.gf('data.other.ruleDto').toJS();
        let { currentAccount } = this.metaAction.gf('data.other.accountEnableDto').toJS();
        let isAux = this.metaAction.gf('data.other.isAux').toJS();

        const { supplierIds } = this.ids;

        let { supplierList, supplier, account } = await this.loadTSupplier(supplierIds, currentAccount);

        //自动匹配T+供应商 获取供应商档案失败不进行匹配
        if (isAux.supplier && supplier.value) {
            let needUpdateList = [], needAddList = [];

            supplierList.forEach(
                (o) => {
                    //是否匹配T+code
                    let isMapCode = supplier.value.find(p => p.code == o.mappingCode);
                    if (!isMapCode) {
                        //需要修改的数据
                        needUpdateList.push(o);
                    }
                    if (autoAddSupplier) {
                        //是否匹配T+name
                        let isMapName = supplier.value.find(b => b.name == o.archiveName);
                        if (!isMapName) {
                            //需要新增的客户
                            needAddList.push({
                                name: o.archiveName,//名称
                                partnerClass: {
                                    code: supplierClassCode,//供应商分类编码
                                },
                                codeType: supplierCodeRule === 1 ? 'number' : 'pinyin',//编码规则
                                code: supplierCodeRule === 1 ? supplierStarCode : null
                            })
                            if (supplierCodeRule === 1) {
                                supplierStarCode = formatStarCode(supplierStarCode);
                            }
                        }
                    }

                }
            )


            //批量新增供应商档案
            if (autoAddSupplier && needAddList.length > 0) {
                const res = await this.webapi.tplus.common(`${baseUrl}/common/supplier/createBatch`, needAddList, this.getOrgId());
                if (res && res.error) {
                    //this.metaAction.toast('error', `${res.error.message}`);
                } else if (res && res.result) {
                    //重新获取T+供应商
                    supplier = await this.webapi.tplus.common(`${baseUrl}/common/supplier/query`, {}, this.getOrgId())
                } else {
                    this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
                }
            }

            //批量修改供应商档案
            if (needUpdateList.length > 0) {
                const setList = []
                needUpdateList.forEach(o => {
                    let item = supplier.value.find(p => p.name == o.archiveName);
                    if (item) {
                        setList.push({
                            ...o,
                            mappingCode: item.code
                        })
                    }
                })
                if (setList.length > 0) {
                    const ret = await this.webapi.tplus.supplierSet(setList);
                    let res = await this.webapi.tplus.supplier({ idList: supplierIds });
                    supplierList = res.list || [];
                    if (ret === null) {

                    } else {
                        this.metaAction.toast("error", '自动绑定供应商失败');
                    }
                }
            }
            //更新最新的起始编码
            if (autoAddSupplier && supplierCodeRule === 1) {
                this.metaAction.sf('data.other.ruleDto.supplierStarCode', supplierStarCode);
                await this.webapi.tplus.updateStarCode({ supplierStarCode })
            }
        }

        //自动匹配供应商往来科目(1、启用了明细2、启用了自动生成3、存在T+的档案)
        if (currentAccount && account.value) {
            let needUpdateList = [], needAddList = [];
            let endClassAccount = account.value;
            if (autoAddSupplierCurrentAccount) {
                endClassAccount = account.value.filter((a) => {
                    return new RegExp(`^${supplierParentAccountCode}`).test(a.code)
                });//
            }
            //T+有往来科目 
            supplierList.forEach(
                o => {
                    if (isAux.supplier) {
                        //是否匹配了档案
                        let isMapCode = supplier.value.find(p => p.code == o.mappingCode);
                        if (isMapCode) {
                            //是否匹配T+往来科目
                            let isMapAccoutCode = account.value.find(p => p.code == o.accountCode);
                            if (!isMapAccoutCode) {
                                //需要修改的数据
                                needUpdateList.push(o);
                            }
                            if (autoAddSupplierCurrentAccount) {
                                //是否匹配T+name
                                let isMapName = endClassAccount.find(b => b.name == isMapCode.name);
                                if (!isMapName) {
                                    //需要新增的往来科目
                                    needAddList.push({
                                        name: isMapCode.name,//名称(档案名称)
                                        parentCode: supplierParentAccountCode,//上级编码
                                        year: this.metaAction.context.get("currentOrg").periodDate.slice(0, 4),
                                        aux: {
                                            isCalcQuantity: false,
                                            unitDto: {
                                                // id: "1",
                                                // code: "001",
                                                // name: "个"
                                            },
                                            isCalcMulti: false
                                        }
                                    })
                                }
                            }
                        }
                    } else {

                        //是否匹配T+往来科目
                        let isMapAccoutCode = account.value.find(p => p.code == o.accountCode);
                        if (!isMapAccoutCode) {
                            //需要修改的数据
                            needUpdateList.push(o);
                        }
                        if (autoAddSupplierCurrentAccount) {
                            //是否匹配T+name
                            let isMapName = endClassAccount.find(b => b.name == o.archiveName);
                            if (!isMapName) {
                                //需要新增的往来科目
                                needAddList.push({
                                    name: o.archiveName,//名称(档案名称)
                                    parentCode: supplierParentAccountCode,//上级编码
                                    year: this.metaAction.context.get("currentOrg").periodDate.slice(0, 4),
                                    aux: {
                                        isCalcQuantity: false,
                                        unitDto: {
                                            // id: "1",
                                            // code: "001",
                                            // name: "个"
                                        },
                                        isCalcMulti: false
                                    }
                                })
                            }
                        }
                    }

                }
            )


            //自动新增往来科目
            if (autoAddSupplierCurrentAccount && needAddList.length > 0) {
                const res = await this.webapi.tplus.common(`${baseUrl}/common/account/createBatch`, needAddList, this.getOrgId());
                if (res && res.error) {
                    //this.metaAction.sf('data.customerLoading', false);
                    // this.metaAction.toast('error', `${res.error.message}`);
                } else if (res && res.result) {
                    //重新获取T+往来科目
                    const periodDate = this.metaAction.context.get("currentOrg").periodDate
                    const newPeriodDate = periodDate.slice(0, 4)
                    const newOptions = { 'year': newPeriodDate };
                    account = await this.webapi.tplus.common(`${baseUrl}/common/account/query`, newOptions, this.getOrgId())
                } else {
                    //this.metaAction.sf('data.customerLoading', false);
                    this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
                }
            }

            //批量修改往来科目
            if (needUpdateList.length > 0) {
                const setList = [];
                let endClassAccount = account.value;
                if (autoAddSupplierCurrentAccount) {
                    endClassAccount = account.value.filter((a) => {
                        return new RegExp(`^${supplierParentAccountCode}`).test(a.code)
                    });//自动生成往来科目有上级科目
                }

                //启用辅助核算
                if (isAux.supplier) {
                    needUpdateList.forEach(o => {
                        let isMapCode = supplier.value.find(p => p.code == o.mappingCode);
                        if (isMapCode) {
                            let item = endClassAccount.find(p => p.name == isMapCode.name);
                            if (item) {
                                setList.push({
                                    ...o,
                                    accountCode: item.code
                                })
                            }
                        }
                    })
                } else {
                    needUpdateList.forEach(o => {
                        let item = endClassAccount.find(p => p.name == o.archiveName);
                        if (item) {
                            setList.push({
                                ...o,
                                accountCode: item.code
                            })
                        }
                    })
                }

                if (setList.length > 0) {
                    const ret = await this.webapi.tplus.supplierSet(setList);
                    let res = await this.webapi.tplus.supplier({ idList: supplierIds });
                    supplierList = res.list || [];
                    if (ret !== null) {
                        this.metaAction.toast('error', '自动映射供应商往来科目失败')
                    }
                }
            }
        }

        let obj = {}
        let options = {}
        if (isAux.supplier) {
            supplier.value ? supplier.value.forEach(
                (o) => {
                    o.codeAndName = o.code + " " + o.name
                }
            ) : supplier.value = [];
            obj['data.other.supplier'] = fromJS(supplier.value);
            options['doc'] = supplier.value;
        }
        if (currentAccount) {
            account.value ? account.value.forEach(
                (o) => {
                    o.codeAndName = o.code + " " + o.name;
                }
            ) : account.value = [];
            obj['data.other.account'] = fromJS(account.value);
            options['account'] = account.value;
        }
        this.handlefilterDoc(supplierList, options);
        obj['data.form.supplierList'] = fromJS(supplierList);
        obj['data.supplierLoading'] = false;
        this.injections.reduce('sfs', obj);
    }

    //获取存货档案列表、存货档案、收入类型
    loadTInventory = async (inventoryIds) => {
        const { baseUrl, softAppName, vatOrEntry } = this.component.props;
        const isAux = this.metaAction.gf('data.other.isAux').toJS();//是否启用辅助核算
        const { inventoryAccount, revenueAccount } = this.metaAction.gf('data.other.accountEnableDto').toJS();//是否启用明细科目
        let inventory = {}, revenueTypeList = [], account = [];
        const periodDate = this.metaAction.context.get("currentOrg").periodDate
        const newPeriodDate = periodDate.slice(0, 4)
        const newOptions = { 'year': newPeriodDate }

        let arr = [
            this.webapi.tplus.inventory({ idList: inventoryIds })
        ]
        if (isAux.inventory) {
            arr.push(this.webapi.tplus.common(`${baseUrl}/common/inventory/query`, {}, this.getOrgId()))
        }
        if (vatOrEntry && inventoryAccount) {
            arr.push(this.webapi.tplus.common(`${baseUrl}/common/account/query`, newOptions, this.getOrgId()))
        } else if (!vatOrEntry && revenueAccount) {
            arr.push(this.webapi.tplus.businessType({ parentId: "2001003", includeDisable: "false" }))
        }
        const [res0, res1, res2] = await Promise.all(arr)

        if (!res0.list) {
            this.metaAction.toast('error', '获取存货档案列表失败');
        }
        if (isAux.inventory) {
            inventory = res1
        }
        if (vatOrEntry && inventoryAccount) {
            account = res1
        } else if (!vatOrEntry && revenueAccount) {
            revenueTypeList = res1
        }

        if (arr.length === 3) {
            if (vatOrEntry && inventoryAccount) {
                account = res2
            } else if (!vatOrEntry && revenueAccount) {
                revenueTypeList = res2
            }
        }

        return {
            inventoryList: res0.list || [],
            inventory,
            revenueTypeList,
            account
        }
    }

    //加载存货档案列表 遇到报错不要return 以保证页面有列表
    loadInventory = async () => {
        // const { softAppName } = this.component.props;
        const { baseUrl, softAppName, vatOrEntry } = this.component.props;
        //是否全部为费用
        const { inventoryIds } = this.ids;
        if (inventoryIds.length == 0) return

        //是否加载中
        const inventoryLoading = this.metaAction.gf('data.inventoryLoading');
        if (inventoryLoading) return

        //是否需要重新加载
        let flag = this.needReload('inventoryList', 'file');
        if (!flag) return

        this.metaAction.sf('data.inventoryLoading', true);
        let { inventorySet: autoAddInventory, inventoryClassCode = null, inventoryCodeRule, inventoryStarCode, inventoryAccountSet: autoAddInventoryAccount } = this.metaAction.gf('data.other.ruleDto').toJS();

        //获取存货列表
        //let inventoryList = await this.webapi.tplus.inventory({ idList: inventoryIds });
        let { inventoryList, inventory, revenueTypeList, account } = await this.loadTInventory(inventoryIds);
        let { inventoryAccount, revenueAccount } = this.metaAction.gf('data.other.accountEnableDto').toJS();
        let isAux = this.metaAction.gf('data.other.isAux').toJS();
        this.metaAction.sf('data.form.revenueTypeList', fromJS(revenueTypeList));

        //获取云平台的存货列表
        // const inventoryQuery = await this.webapi.tplus.inventoryQuery({ "status": true, "notNeedPage": true, "entity": { "isEnable": true } });
        // if (!inventoryQuery.list) {
        //     this.metaAction.sf('data.inventoryLoading', false);
        //    this.metaAction.toast('error', '获取存货信息失败');
        //}
        //自动映射存货档案 
        // console.log(autoAddInventory, inventory.value, inventoryList)
        if (isAux.inventory && inventory.value) {

            let needUpdateList = [], needAddList = [];
            //T+
            inventoryList.forEach(
                o => {
                    //是否匹配T+code
                    let isMapCode = inventory.value.find(p => p.code == o.mappingCode);
                    if (!isMapCode) {
                        //需要修改的数据
                        needUpdateList.push(o);
                    }
                    if (autoAddInventory) {
                        //是否匹配T+name
                        let isMapName = inventory.value.find(b => b.name == o.inventoryName);
                        if (!isMapName) {
                            //需要新增的存货
                            needAddList.push({
                                name: o.inventoryName,
                                code: inventoryStarCode,
                                inventoryClass: {
                                    code: inventoryClassCode
                                },
                                unit: {
                                    code: null,
                                    name: o.unitName
                                }
                            })
                            if (inventoryCodeRule === 1) {
                                inventoryStarCode = formatStarCode(inventoryStarCode);
                            }
                            // }
                        }
                    }

                }
            )

            //批量新增存货档案
            if (autoAddInventory && needAddList.length > 0) {
                //批量新增
                const res = await this.webapi.tplus.common(`${baseUrl}/common/inventory/createBatch`, needAddList, this.getOrgId());
                if (res && res.error) {
                    //新增失败 提示错误 继续执行 后续通过手动新增
                    //this.metaAction.toast('error', `${res.error.message}`); U8自动新增存货没有分类时有问题 不抛异常 手动新增
                } else if (res && res.result) {
                    inventory = await this.webapi.tplus.common(`${baseUrl}/common/inventory/query`, { 'year': this.metaAction.context.get("currentOrg").periodDate.slice(0, 4) }, this.getOrgId())
                } else {
                    this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
                }
            }

            //批量修改存货档案
            if (needUpdateList.length > 0) {
                const setList = []
                needUpdateList.forEach(o => {
                    let item = inventory.value.find(p => p.name == o.inventoryName);//可能新增T+存货失败
                    if (item) {
                        setList.push({
                            ...o,
                            mappingCode: item.code,
                        })
                    }
                })
                if (setList.length > 0) {

                    const ret = await this.webapi.tplus.inventorySet(setList);
                    let res = await this.webapi.tplus.inventory({ idList: inventoryIds });
                    inventoryList = res.list || [];
                    if (ret === null) {
                        //成功
                    } else {
                        this.metaAction.toast('error', `自动映射${softAppName}存货失败`);
                    }
                }
            }

            //更新最新的起始编码
            if (autoAddInventory && inventoryCodeRule === 1) {
                this.metaAction.sf('data.other.ruleDto.inventoryStarCode', inventoryStarCode);
                await this.webapi.tplus.updateStarCode({ inventoryStarCode })
            }

        }

        //进项自动新增存货科目(本期不做)


        //进项自动映射存货档案(1、启用了明细2、启用了自动生成3、存在T+的档案)
        if (vatOrEntry && inventoryAccount && account.value) {
            let needUpdateList = [], needAddList = [];

            // let endClassAccount = account.value.filter((a) => {
            //     return new RegExp(`^${supplierParentAccountCode}`).test(a.code)
            //  });//
            //T+有往来科目 
            inventoryList.forEach(
                o => {

                    if (isAux.inventory) {
                        //是否匹配了档案
                        let isMapCode = inventory.value.find(p => p.code == o.mappingCode);
                        if (isMapCode) {
                            //是否匹配T+往来科目
                            let isMapAccoutCode = account.value.find(p => p.code == o.accountCode);
                            if (!isMapAccoutCode) {
                                //需要修改的数据
                                needUpdateList.push(o);
                            }
                            //是否匹配T+name

                            // let isMapName = endClassAccount.find(b => b.name == isMapCode.name);
                            // if (!isMapName) {
                            //     //需要新增的往来科目
                            //     needAddList.push({
                            //         name: isMapCode.name,//名称(档案名称)
                            //         parentCode: inventoryParentAccountCode,//上级编码
                            //         year: this.metaAction.context.get("currentOrg").periodDate.slice(0, 4),
                            //         aux: {
                            //             isCalcQuantity: false,
                            //             unitDto: {
                            //                 id: "1",
                            //                 code: "001",
                            //                 name: "个"
                            //             },
                            //             isCalcMulti: false
                            //         }
                            //     })
                            // }
                        }
                    } else {
                        let isMapAccoutCode = account.value.find(p => p.code == o.accountCode);
                        if (!isMapAccoutCode) {
                            //需要修改的数据
                            needUpdateList.push(o);
                        }
                    }
                }
            )

            //批量新增存货科目（本期不做）
            // if (currentAccount && autoAddSupplierCurrentAccount && needAddList.length > 0) {
            //     const res = await this.webapi.tplus.common(`${baseUrl}/common/account/createBatch`, needAddList, this.getOrgId());
            //     if (res && res.error) {
            //         //this.metaAction.sf('data.customerLoading', false);
            //         // this.metaAction.toast('error', `${res.error.message}`);
            //     } else if (res && res.result) {
            //         //重新获取T+往来科目
            //         const periodDate = this.metaAction.context.get("currentOrg").periodDate
            //         const newPeriodDate = periodDate.slice(0, 4)
            //         const newOptions = { 'year': newPeriodDate };
            //         account = await this.webapi.tplus.common(`${baseUrl}/common/account/query`, newOptions, this.getOrgId())
            //     } else {
            //         //this.metaAction.sf('data.customerLoading', false);
            //         this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
            //     }
            // }

            //批量修改往来科目
            if (needUpdateList.length > 0) {
                const setList = [];
                let endClassAccount = account.value;
                // if (currentAccount && autoAddSupplierCurrentAccount) {
                //     endClassAccount = inventory.value.filter((a) => {
                //         return new RegExp(`^${supplierParentAccountCode}`).test(a.code)
                //     });//自动生成往来科目有上级科目
                // }
                if (isAux.inventory) {
                    needUpdateList.forEach(o => {
                        let isMapCode = inventory.value.find(p => p.code == o.mappingCode);
                        if (isMapCode) {

                            let item = endClassAccount.find(p => p.name == isMapCode.name);
                            if (item) {
                                setList.push({
                                    ...o,
                                    accountCode: item.code,
                                })
                            }
                        }
                    })
                } else {
                    needUpdateList.forEach(o => {
                        let item = endClassAccount.find(p => p.name == o.inventoryName);
                        if (item) {
                            setList.push({
                                ...o,
                                accountCode: item.code,

                            })
                        }
                    })
                }
                if (setList.length > 0) {
                    const ret = await this.webapi.tplus.inventorySet(setList);
                    let res = await this.webapi.tplus.inventory({ idList: inventoryIds });
                    inventoryList = res.list || [];
                    if (ret !== null) {
                        this.metaAction.toast('error', '自动映射存货科目失败')
                    }
                }
            }
        } else if (!vatOrEntry && revenueAccount) {
            //销项自动映射收入类型
            let needUpdateList = [], needAddList = [];
            inventoryList.forEach(
                o => {
                    if (isAux.inventory) {
                        //是否匹配了档案
                        let isMapCode = inventory.value.find(p => p.code == o.mappingCode);
                        if (isMapCode) {
                            //是否匹配收入类型
                            let isMapAccoutCode = revenueTypeList.find(p => p.id == o.revenueType);
                            if (!isMapAccoutCode) {
                                //需要修改的数据
                                needUpdateList.push(o);
                            }
                        }
                    } else {
                        let isMapAccoutCode = revenueTypeList.find(p => p.id == o.revenueType);
                        if (!isMapAccoutCode) {
                            //需要修改的数据
                            needUpdateList.push(o);
                        }
                    }
                }
            )


            //批量修改收入类型
            if (needUpdateList.length > 0) {
                const setList = [];
                if (isAux.inventory) {
                    needUpdateList.forEach(o => {
                        let isMapCode = inventory.value.find(p => p.code == o.mappingCode);
                        if (isMapCode) {
                            let item = revenueTypeList.find(p => p.name == isMapCode.name);
                            if (item) {
                                setList.push({
                                    ...o,
                                    revenueType: item.id
                                })
                            }
                        }
                    })
                } else {
                    needUpdateList.forEach(o => {
                        let item = revenueTypeList.find(p => p.name == o.inventoryName);
                        if (item) {
                            setList.push({
                                ...o,
                                revenueType: item.id
                            })
                        }
                    })
                }
                if (setList.length > 0) {
                    const ret = await this.webapi.tplus.inventorySet(setList);
                    let res = await this.webapi.tplus.inventory({ idList: supplierIds });
                    supplierList = res.list || [];
                    if (ret !== null) {
                        this.metaAction.toast('error', '自动映射收入类型失败')
                    }
                }
            }
        }

        let obj = {}
        let options = {}
        if (isAux.inventory) {
            //启用了存货辅助核算
            inventory.value ? inventory.value.forEach(
                (o) => {
                    o.codeAndName = o.code + " " + o.name;
                }
            ) : inventory.value = [];
            obj['data.other.inventory'] = fromJS(inventory.value);
            options['doc'] = inventory.value;

        }
        if (vatOrEntry && inventoryAccount) {
            //进项启用了存货科目
            account.value ? account.value.forEach(
                (o) => {
                    o.codeAndName = o.code + " " + o.name;
                }
            ) : account.value = [];
            obj['data.other.account'] = fromJS(account.value);
            options['account'] = account.value;
        } else if (!vatOrEntry && revenueAccount) {
            //销项启用了收入科目
            obj['data.form.revenueTypeList'] = fromJS(revenueTypeList);
            options['revenueTypeList'] = revenueTypeList;
        }
        this.handlefilterDoc(inventoryList, options, 'inventory');
        obj['data.form.inventoryList'] = fromJS(inventoryList);
        obj['data.inventoryLoading'] = false;
        this.injections.reduce('sfs', obj);
    }


    //------加载科目

    //加载收入类型
    loadRevenueType = async (firstTime) => {

        if (!firstTime) {
            //是否加载中
            const loadingRevenueType = this.metaAction.gf('data.loadingRevenueType');
            if (loadingRevenueType) return

            //判断是否需要重新获取
            let flag = this.needReload('revenueTypeList', 'account');
            if (!flag) return
            this.metaAction.sf('data.loadingRevenueType', true);
        }
        let account = await this.loadTAccount();
        //收入类型
        let revenueTypeList = await this.webapi.tplus.businessType({ parentId: "2001003", includeDisable: "false" });
        this.metaAction.sf('data.loadingRevenueType', false)
        if (!revenueTypeList) {
            this.metaAction.toast('error', '收入类型加载失败');
            return
        }
        this.handlefilter(revenueTypeList, account);
        this.metaAction.sf('data.form.revenueTypeList', fromJS(revenueTypeList))
    }

    //加载存货类别
    loadInventoryType = async (firstTime) => {
        if (!firstTime) {
            const loadingInventoryType = this.metaAction.gf('data.loadingInventoryType');
            if (loadingInventoryType) return
            //判断是否需要重新加载
            let flag = this.needReload('inventoryTypeList', 'account');
            if (!flag) return
            this.metaAction.sf('data.loadingInventoryType', true);
        }
        let account = await this.loadTAccount();
        //存货类别
        let inventoryTypeList = await this.webapi.tplus.inventoryType({ "entity": { "templateAccountTypeId": "2001001", "influenceValue": "" } });
        this.metaAction.sf('data.loadingInventoryType', false)
        if (!inventoryTypeList.list) {
            this.metaAction.toast('error', '获取存货类别失败');
            return
        }
        inventoryTypeList = inventoryTypeList.list;
        inventoryTypeList.forEach(o => o.name = o.influenceList[0].influenceValue);
        this.handlefilter(inventoryTypeList, account);
        this.metaAction.sf('data.form.inventoryTypeList', fromJS(inventoryTypeList))

    }

    //加载增值税
    loadTax = async (firstTime) => {
        if (!firstTime) {
            const loadingTax = this.metaAction.gf('data.loadingTax');
            if (loadingTax) return
            let flag = this.needReload('taxList', 'account');
            if (!flag) return
            this.metaAction.sf('data.loadingTax', true);
        }
        let account = await this.loadTAccount();
        let taxList;
        if (this.component.props.vatOrEntry == 0) {
            taxList = await this.webapi.tplus.tax({ type: "sa" });
        } else {
            taxList = await this.webapi.tplus.tax({ type: "pu" });
        }
        this.metaAction.sf('data.loadingTax', false)
        if (!taxList) {
            this.metaAction.toast('error', '获取增值税失败')
            return
        }
        this.handlefilter(taxList, account);
        this.metaAction.sf('data.form.taxList', fromJS(taxList));

    }

    //加载结算方式
    loadSettle = async (firstTime) => {
        if (!firstTime) {
            const loadingSettle = this.metaAction.gf('data.loadingSettle');
            if (loadingSettle) return
            let flag = this.needReload('settleList', 'account');
            if (!flag) return
            this.metaAction.sf('data.loadingSettle', true);
        }
        let account = await this.loadTAccount();
        const settleList = await this.webapi.tplus.settle();
        this.metaAction.sf('data.loadingSettle', false)
        if (!settleList) {
            this.metaAction.toast('error', '获取结算方式失败');
            return
        }
        this.handlefilter(settleList, account);
        this.metaAction.sf('data.form.settleList', fromJS(settleList))
    }

    //加载费用类型
    loadBusiness = async (firstTime) => {
        if (!firstTime) {
            const loadingBusiness = this.metaAction.gf('data.loadingBusiness');
            if (loadingBusiness) return
            let flag = this.needReload('busnessList', 'account');
            if (!flag) return
            this.metaAction.sf('data.loadingBusiness', true);
        }
        let account = await this.loadTAccount();
        const busnessList = await this.webapi.tplus.businessType({ parentId: "4001001", includeDisable: "false" });
        this.metaAction.sf('data.loadingBusiness', false)
        if (!busnessList) {
            this.metaAction.toast('error', '获取费用类型失败');
            return
        }
        this.handlefilter(busnessList, account);
        this.metaAction.sf('data.form.busnessList', fromJS(busnessList))

    }

    //加载资产
    loadAsset = async (firstTime) => {
        if (!firstTime) {
            const loadingAsset = this.metaAction.gf('data.loadingAsset');
            if (loadingAsset) return
            //判断是否需要重新加载
            let flag = this.needReload('assetList', 'account');
            if (!flag) return
            this.metaAction.sf('data.loadingAsset', true);
        }
        let account = await this.loadTAccount();
        let assetList = await this.webapi.tplus.inventoryType({ "entity": { "templateAccountTypeId": "4000080003", "influenceValue": "" } });
        this.metaAction.sf('data.loadingAsset', false)
        if (!assetList) {
            this.metaAction.toast('error', '获取资产失败');
            return
        }
        assetList = assetList.list;
        assetList.forEach(o => {
            o.name = o.influenceList[0].influenceValue;
            o.assetType = o.influenceList[1].influenceValue
        });

        this.handlefilter(assetList, account);
        this.metaAction.sf('data.form.assetList', fromJS(assetList))
    }

    //判断是否小规模+进项
    isXgmAndPu = () => {
        return this.metaAction.context.get("currentOrg").vatTaxpayer != 2000010002 || this.component.props.vatOrEntry == 0
    }

    //判断是否小规模
    isXgm = () => {
        return this.metaAction.context.get("currentOrg").vatTaxpayer != 2000010002
    }

    //处理科目不匹配
    handlefilter = (a, b) => {
        a.forEach((o) => {
            if (b && b.length > 0) {
                const ck = b.find((p) => p.code == o.accountCode)
                if (!ck) {
                    o.accountCode = null
                }
            } else {
                o.accountCode = null
            }
        })
    }


    //处理档案不匹配
    handlefilterDoc = (list, options, docName) => {
        list.forEach((o) => {
            let b = options.doc;
            let c = options.account;
            let d = options.revenueTypeList;
            if (b) {
                const ck = b.find((p) => p.code == o.mappingCode)
                if (!ck) {
                    o.mappingCode = null
                } else {
                    if (docName == 'inventory') {
                        o.unit = ck.unit
                    }
                }
            }
            if (c) {
                const ck = c.find((p) => p.code == o.accountCode)
                if (!ck) {
                    o.accountCode = null
                }
            }
            if (d) {
                const ck = d.find((p) => p.id == o.revenueType)
                if (!ck) {
                    o.revenueType = null
                }
            }

        })
    }


    //获取orgID
    getOrgId = () => {
        const org = this.metaAction.context.get('currentOrg') || {}
        return {
            headers: {
                token: org.id || ''
            }
        }
    }

    //检查
    check = (loadingName, name, title, type) => {
        const loading = this.metaAction.gf(`data.${loadingName}`);
        let flag = false;
        if (loading) {
            this.metaAction.toast('warning', `请等待${title}数据加载完成`);
            return false
        }
        const list = this.metaAction.gf(`data.form.${name}`).toJS();
        if (list.length == 0) {
            this.metaAction.toast('warning', `请重新加载${title}数据`);
            return false
        } else {
            list.forEach(o => {
                type.forEach(item => {
                    if (!o[item]) {
                        flag = true;
                    }
                })
            })
            if (flag) {
                this.metaAction.toast('warning', `请完成${title}修改`);
                return false
            }
        }
        return true;
    }

    //检查step1页是否有为空
    checkStep1 = () => {
        const { vatOrEntry } = this.component.props;
        const { inventoryIds } = this.ids;
        const { consumer, supplier, inventory } = this.metaAction.gf('data.other.isAux').toJS();//是否启用辅助核算
        let { currentAccount, inventoryAccount, revenueAccount } = this.metaAction.gf('data.other.accountEnableDto').toJS();//是否启用明细科目
        if (vatOrEntry) {
            //进项
            if (supplier && currentAccount) {
                if (!this.check('supplierLoading', 'supplierList', '供应商档案', ['mappingCode', 'accountCode'])) return false;
            } else if (supplier && !currentAccount) {
                if (!this.check('supplierLoading', 'supplierList', '供应商档案', ['mappingCode'])) return false;
            } else if (!supplier && currentAccount) {
                if (!this.check('supplierLoading', 'supplierList', '供应商档案', ['accountCode'])) return false;
            }
            if (inventoryIds.length > 0) {
                //进项非费用
                if (inventory && inventoryAccount) {
                    if (!this.check('inventoryLoading', 'inventoryList', '存货档案', ['mappingCode', 'accountCode'])) return false;
                }
                if (inventory && !inventoryAccount) {
                    if (!this.check('inventoryLoading', 'inventoryList', '存货档案', ['mappingCode'])) return false;
                }
                if (!inventory && inventoryAccount) {
                    if (!this.check('inventoryLoading', 'inventoryList', '存货档案', ['accountCode'])) return false;
                }
            }
        } else {
            //销项
            if (consumer && currentAccount) {
                if (!this.check('customerLoading', 'customerList', '客户档案', ['mappingCode', 'accountCode'])) return false;
            } else if (consumer && !currentAccount) {
                if (!this.check('customerLoading', 'customerList', '客户档案', ['mappingCode'])) return false;
            } else if (!consumer && currentAccount) {
                if (!this.check('customerLoading', 'customerList', '客户档案', ['accountCode'])) return false;
            }
            //销项存货收入类型
            if (inventory && revenueAccount) {
                if (!this.check('inventoryLoading', 'inventoryList', '存货档案', ['mappingCode', 'revenueType'])) return false;
            }
            if (inventory && !revenueAccount) {
                if (!this.check('inventoryLoading', 'inventoryList', '存货档案', ['mappingCode'])) return false;
            }
            if (!inventory && revenueAccount) {
                if (!this.check('inventoryLoading', 'inventoryList', '存货档案', ['revenueType'])) return false;
            }
        }
        return true;
    }

    //检查step2页是否有为空
    checkStep2 = () => {
        if (this.component.props.vatOrEntry == 0) {
            if (!this.check('loadingRevenueType', 'revenueTypeList', '收入科目', ['accountCode'])) return false;
        } else {
            if (!this.check('loadingInventoryType', 'inventoryTypeList', '存货类别科目', ['accountCode'])) return false;
            // if (!this.check('loadingAsset', 'assetList', '资产科目', ['accountCode'])) return false;
            // if (!this.check('loadingBusiness', 'busnessList', '费用科目', 'accountCode')) return false;
        }
        if (!this.check('loadingSettle', 'settleList', '结算方式科目', ['accountCode'])) return false;
        if (this.isXgmAndPu()) {
            if (!this.check('loadingTax', 'taxList', '增值税科目', ['accountCode'])) return false;
        }
        return true;
    }

    //未启用辅助核算直接跳转到tep2
    skipToStep2 = async () => {
        const { baseUrl, softAppName, vatOrEntry } = this.component.props;
        //1=》2
        if (vatOrEntry == 0) {
            this.metaAction.sf('data.other.tab2', "1");
        } else {
            this.metaAction.sf('data.other.tab2', "2");
        }
        this.metaAction.sf('data.other.step', 2);
        const firstTime = this.metaAction.gf('data.firstTime');
        if (firstTime) {
            //第一次时获取科目
            this.metaAction.sf('data.firstTime', false);
            await this.loadTAccount();
        }
        if (vatOrEntry == 0) {
            await Promise.all([
                this.loadRevenueType(firstTime),
                this.loadSettle(firstTime),
                this.loadTax(firstTime)
            ])
        } else {
            const list = [
                this.loadInventoryType(firstTime),
                this.loadAsset(firstTime),
                this.loadBusiness(firstTime),
                this.loadSettle(firstTime)
            ]
            if (this.metaAction.context.get("currentOrg").vatTaxpayer != 2000010002) {
                list.push(this.loadTax(firstTime))
            }
            await Promise.all(list)
        }
    }

    //上一步
    backLastStep = async () => {
        let loading = this.metaAction.gf('data.loading');
        if (loading) {
            return
        }
        let step = this.metaAction.gf('data.other.step')
        this.metaAction.sf('data.other.step', step - 1);
        const tab1 = this.metaAction.gf('data.other.tab1');
        if (step == 2) {
            //2=>1
            if (this.component.props.vatOrEntry == 0) {
                return await this.changFileTab(tab1);
            } else {
                return await this.changFileTab(tab1);
            }
        }
    }

    //生成凭证
    getVourch = async () => {
        const { baseUrl, softAppName, selectedData, vatOrEntry, entity } = this.component.props;
        let errorList = [];
        let successCount = 0;
        let allCount = 0;
        this.metaAction.sf('data.loading', true);
        let res1;
        const params = [];
        //科目
        const account = this.metaAction.gf('data.other.account').toJS();
        await this.webapi.tplus.saveAccount(account);

        if (entity == 'card') {
            //卡片生成凭证
            if (vatOrEntry == 0) {
                res1 = await this.webapi.tplus.auditSa(selectedData);
            } else {
                res1 = await this.webapi.tplus.auditPu(selectedData);
            }
            if (res1) {
                params.push(JSON.parse(res1.message))
            } else {
                this.metaAction.sf('data.loading', false);
                return
            }
        } else {
            if (vatOrEntry == 0) {
                res1 = await this.webapi.tplus.auditBatchForTPlusSa(selectedData);
            } else {
                res1 = await this.webapi.tplus.auditBatchForTPlusPu(selectedData);
            }

            if (res1) {

                allCount = res1.success.length + res1.fail.length;//合并后需要生成的凭证
                //全部失败
                if (res1.success.length == 0) {
                    this.showError('生成凭证失败', res1.success, res1.fail);
                    this.metaAction.sf('data.loading', false);
                    return false
                } else {
                    //部分失败
                    if (res1.fail.length > 0) {
                        errorList = errorList.concat(res1.fail);
                    }
                    //获取成功的列表
                    res1.success.forEach(item => {
                        item.message = JSON.parse(item.message);
                        params.push(item.message);
                    });
                }
            } else {
                this.metaAction.sf('data.loading', false);
                return false
            }
        }

        const url = `${baseUrl}/common/doc/createBatch`;

        //生成t+凭证
        const res = await this.webapi.tplus.common(url, params, this.getOrgId());
        if (res && res.error) {
            this.metaAction.sf('data.loading', false);
            this.metaAction.toast('error', `${res.error.message}`);
            //  return
        } else if (res && res.result) {
            if (!res.value.successItems) res.value.successItems = [];
            if (!res.value.failItems) res.value.failItems = [];

            if (entity == 'card') {
                //只有一条数据，要么成功要么失败 已经存在视为成功
                if (res.value.failItems.length > 0) {
                    if (/已经存在/.test(res.value.failItems[0].msg)) {
                        res.value.successItems.push(res.value.failItems[0].key)
                    } else {
                        errorList.push({
                            message: `${res.value.failItems[0].msg}`
                        })
                    }
                }
                if (res.value.successItems.length > 0) {
                    //成功
                    let callbackres;
                    if (vatOrEntry == 0) {
                        callbackres = await this.webapi.tplus.auditUpdateSa({ ...selectedData, docId: res.value.successItems[0] });
                    } else {
                        callbackres = await this.webapi.tplus.auditUpdatePu({ ...selectedData, docId: res.value.successItems[0] });
                    }
                    if (callbackres) {
                        successCount = 1;
                        this.callbackres = callbackres;
                    }
                }
                this.injections.reduce('sfs', {
                    'data.errorList': fromJS(errorList),
                    'data.other.successCount': successCount,
                    'data.other.failCount': 1 - successCount,
                    'data.other.step': 3,
                    'data.loading': false
                })
            } else {
                //处理失败部分 已经存在视为成功
                if (res.value.failItems.length > 0) {
                    res.value.failItems.forEach(fa => {
                        if (/已经存在/.test(fa.msg)) {
                            res.value.successItems.push(fa.key);
                        } else {
                            errorList.push({
                                message: `${fa.msg}`
                            })
                        }
                    })
                }
                successCount = res.value.successItems.length;//合并后成功凭证数
                //处理成功部分 
                if (res.value.successItems.length > 0) {
                    let successItems = [], updateres
                    res.value.successItems.forEach((o) => {
                        let item = res1.success.find(p => p.message.externalCode == o);
                        let idList = item.idList;
                        idList.forEach(z => {
                            let se = selectedData.find(x => x.id == z)
                            successItems.push({
                                id: se.id,
                                ts: se.ts,
                                docId: item.message.externalCode
                            })
                        })
                    })

                    if (vatOrEntry == 0) {
                        updateres = await this.webapi.tplus.updateBatchForTPlusSa(successItems);
                        if (updateres.fail.length > 0) {
                            errorList = errorList.concat(updateres.fail)
                        }
                    } else {
                        updateres = await this.webapi.tplus.updateBatchForTPluPu(successItems);
                        if (updateres.fail.length > 0) {
                            errorList = errorList.concat(updateres.fail)
                        }
                    }
                }
                this.injections.reduce('sfs', {
                    'data.errorList': fromJS(errorList),
                    'data.other.successCount': successCount,
                    'data.other.failCount': allCount - successCount,
                    'data.other.step': 3,
                    'data.loading': false
                })
            }
        } else {
            this.metaAction.sf('data.loading', false);
            this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
            // return
        }
    }

    //下一步
    nextStep = async () => {
        const step = this.metaAction.gf('data.other.step');
        const loading = this.metaAction.gf('data.loading');
        if (loading) {
            return
        }
        if (step == 1) {
            const checkStep = this.checkStep1();
            if (!checkStep) return
            await this.skipToStep2();
        }
        else if (step == 2) {
            const checkStep = this.checkStep2();
            if (!checkStep) return
            await this.getVourch();
        }
        else if (step == 3) {
            this.onOk()
        }
    }

    showError = (title, successArr, failArr) => {
        const ret = this.metaAction.modal('show', {
            title,
            width: 585,
            // footer: null,
            bodyStyle: { padding: '2px 0 10px 11px' },
            children: this.metaAction.loadApp('ttk-scm-app-error-list', {
                store: this.component.props.store,
                successArr,
                failArr
            }),
        })
    }

    //修改
    onFieldChange = async (path, value, index, type) => {
        if (!value) return
        if (path == 'customerList') {
            //修改客户
            const data = this.metaAction.gf('data.form.customerList').toJS();
            const customer = this.metaAction.gf('data.other.customer').toJS();
            const mapping = customer.find(o => o.code == value);
            const res = await this.webapi.tplus.customerSet([
                {
                    archiveId: data[index].archiveId,
                    mappingCode: value,
                    mappingName: mapping.mappingName,
                    accountCode: data[index].accountCode
                }
            ])
            if (res === null) {
                this.injections.reduce('upDate', { path: `data.form.${path}.${index}.mappingCode`, value: value })
            }
        } else if (path == 'customerAccount') {
            //修改客户往来科目
            const data = this.metaAction.gf('data.form.customerList').toJS();
            const res = await this.webapi.tplus.customerSet([
                {
                    archiveId: data[index].archiveId,
                    mappingCode: data[index].mappingCode,
                    mappingName: data[index].mappingName,
                    accountCode: value
                }
            ])
            if (res === null) {
                this.injections.reduce('upDate', { path: `data.form.customerList.${index}.accountCode`, value: value })
            }
        } else if (path == 'supplierAccount') {
            //修改客户往来科目
            const data = this.metaAction.gf('data.form.supplierList').toJS();
            const res = await this.webapi.tplus.supplierSet([
                {
                    archiveId: data[index].archiveId,
                    mappingCode: data[index].mappingCode,
                    mappingName: data[index].mappingName,
                    accountCode: value
                }
            ])
            if (res === null) {
                this.injections.reduce('upDate', { path: `data.form.supplierList.${index}.accountCode`, value: value })
            }
        } else if (path == 'supplierList') {
            //修改供应商
            const data = this.metaAction.gf('data.form.supplierList').toJS();
            const supplier = this.metaAction.gf('data.other.supplier').toJS();
            const mapping = supplier.find(o => o.code == value);
            const res = await this.webapi.tplus.supplierSet([
                {
                    archiveId: data[index].archiveId,
                    mappingCode: value,
                    mappingName: mapping.mappingName,
                    accountCode: data[index].accountCode
                }
            ])
            if (res === null) {
                this.injections.reduce('upDate', { path: `data.form.${path}.${index}.mappingCode`, value: value })
            }
        } else if (path == 'inventoryList') {
            //修改存货
            const data = this.metaAction.gf('data.form.inventoryList').toJS();
            const inventory = this.metaAction.gf('data.other.inventory').toJS();
            const mapping = inventory.find(o => o.code == value);

            if (type == 'revenueType') {
                const res = await this.webapi.tplus.inventorySet([
                    // {
                    //     archiveId: data[index].archiveId,
                    //     mappingCode: data[index].mappingCode,
                    //     mappingName: data[index].mappingName,
                    //     revenueType: value
                    // }
                    {
                        archiveId: data[index].archiveId,
                        mappingCode: data[index].mappingCode,
                        mappingName: data[index].mappingName,
                        accountCode: data[index].accountCode,
                        rate: data[index].rate,
                        revenueType: value
                    }
                ])
                if (res === null) {
                    this.injections.reduce('upDate', { path: `data.form.${path}.${index}.revenueType`, value: value })
                }
            } else if (type == 'account') {
                const res = await this.webapi.tplus.inventorySet([
                    // {
                    //     archiveId: data[index].archiveId,
                    //     mappingCode: data[index].mappingCode,
                    //     mappingName: data[index].mappingName,
                    //     accountCode: value
                    // }
                    {
                        archiveId: data[index].archiveId,
                        mappingCode: data[index].mappingCode,
                        mappingName: data[index].mappingName,
                        accountCode: value,
                        rate: data[index].rate,
                        revenueType: data[index].revenueType
                    }
                ])
                if (res === null) {
                    this.injections.reduce('upDate', { path: `data.form.${path}.${index}.accountCode`, value: value })
                }
            } else if (type == 'rate') {
                const res = await this.webapi.tplus.inventorySet([
                    {
                        archiveId: data[index].archiveId,
                        mappingCode: data[index].mappingCode,
                        mappingName: data[index].mappingName,
                        accountCode: data[index].accountCode,
                        revenueType: data[index].revenueType,
                        rate: Number(value),
                    }
                ])
                if (res === null) {
                    this.injections.reduce('upDate', { path: `data.form.${path}.${index}.rate`, value: value })
                }
            } else {
                // console.log(mapping,inventory, 'mapping')
                const res = await this.webapi.tplus.inventorySet([
                    // {
                    //     archiveId: data[index].archiveId,
                    //     mappingCode: value,
                    //     mappingName: mapping.mappingName,
                    //     accountCode: data[index].accountCode
                    // }

                    {
                        archiveId: data[index].archiveId,
                        mappingCode: value,
                        mappingName: mapping.mappingName,
                        accountCode: data[index].accountCode,
                        rate: data[index].rate,
                        revenueType: data[index].revenueType
                    }
                ])
                if (res === null) {
                    this.injections.reduce('upDate', { path: `data.form.${path}.${index}.mappingCode`, value: value })
                    const inventory = this.metaAction.gf('data.other.inventory').toJS()
                    const { unit = {} } = inventory.find(o => o.code == value)

                    console.log(unit, `data.form.${path}.${index}.unit`, 'unit *************')
                    this.metaAction.sfs({
                        [`data.form.${path}.${index}.mappingCode`]: value,
                        [`data.form.${path}.${index}.unit`]: unit
                    })
                }
            }
        } else if (path == 'revenueTypeList') {
            //修改收入类型
            const data = this.metaAction.gf('data.form.revenueTypeList').toJS();
            const res = await this.webapi.tplus.bussinessSet(
                {
                    code: data[index].code,
                    name: data[index].name,
                    accountCode: value,
                    id: data[index].id,
                    ts: data[index].ts
                })
            if (res) {
                //   this.metaAction.sf(`data.form.${path}.${index}`, res);
                this.injections.reduce('upDate', { path: `data.form.${path}.${index}`, value: res });
                //await this.loadRevenueType();
                //this.injections.reduce('upDate', { path: `data.form.${path}.${index}.accountCode`, value: value })
            }
        } else if (path == 'settleList') {
            //修改结算方式
            const data = this.metaAction.gf('data.form.settleList').toJS();
            const res = await this.webapi.tplus.settleSet(
                [{
                    archiveId: data[index].archiveId,
                    accountCode: value
                }]
            )
            if (res === null) {
                this.injections.reduce('upDate', { path: `data.form.${path}.${index}.accountCode`, value: value })
            }
        } else if (path == 'inventoryTypeList') {
            //修改存货类别
            const data = this.metaAction.gf('data.form.inventoryTypeList').toJS();
            const res = await this.webapi.tplus.inventoryTypeSet(
                {
                    id: data[index].templateUserId,
                    templateAccountTypeId: data[index].templateAccountTypeId,
                    influence: data[index].influence,
                    influenceValue: data[index].influenceValue,
                    accountCode: value,
                    ts: data[index].ts
                }
            )
            if (res) {
                // await this.loadInventoryType();
                const arr = {};
                arr[`data.form.${path}.${index}.accountCode`] = value;
                arr[`data.form.${path}.${index}.ts`] = res.ts;
                arr[`data.form.${path}.${index}.templateUserId`] = res.templateUserId;
                this.injections.reduce('sfs', arr);
                //  this.metaAction.sf(`data.form.${path}.${index}`, res);
                // this.injections.reduce('upDate', { path: `data.form.${path}.${index}.accountCode`, value: value })
            }
        } else if (path == 'busnessList') {
            //修改费用类型
            const data = this.metaAction.gf('data.form.busnessList').toJS();
            const res = await this.webapi.tplus.bussinessSet(
                {
                    code: data[index].code,
                    name: data[index].name,
                    accountCode: value,
                    id: data[index].id,
                    ts: data[index].ts
                })
            if (res) {
                //  this.metaAction.sf(`data.form.${path}.${index}`, res);
                this.injections.reduce('upDate', { path: `data.form.${path}.${index}`, value: res });
                // await this.loadBusiness();
                //this.injections.reduce('upDate', { path: `data.form.${path}.${index}.accountCode`, value: value })
            }
        } else if (path == 'taxList') {
            const data = this.metaAction.gf('data.form.taxList').toJS();
            const res = await this.webapi.tplus.taxSet(
                {
                    influence: data[index].influence,
                    influenceValue: data[index].influenceValue,
                    accountCode: value,
                    templateAccountTypeId: data[index].templateAccountTypeId
                }
            );
            if (res === null) {
                this.injections.reduce('upDate', { path: `data.form.${path}.${index}.accountCode`, value: value })
            }
        } else if (path == 'assetList') {
            //修改资产
            const data = this.metaAction.gf('data.form.assetList').toJS();
            const res = await this.webapi.tplus.inventoryTypeSet(
                {
                    id: data[index].templateUserId,
                    templateAccountTypeId: data[index].templateAccountTypeId,
                    influence: data[index].influence,
                    influenceValue: data[index].influenceValue,
                    accountCode: value,
                    ts: data[index].ts
                }
            )
            if (res) {
                let arr = {};
                arr[`data.form.${path}.${index}.accountCode`] = value;
                arr[`data.form.${path}.${index}.ts`] = res.ts;
                arr[`data.form.${path}.${index}.templateUserId`] = res.templateUserId;
                this.injections.reduce('sfs', arr);
                //await this.loadAsset();
                //  this.metaAction.sf(`data.form.${path}.${index}`, res);
                // this.injections.reduce('upDate', { path: `data.form.${path}.${index}.accountCode`, value: value })
            }
        } else {
            this.injections.reduce('upDate', { path: `data.form.${path}.${index}.accountCode`, value: value })
        }
    }

    //新增客户
    addcustomer = async (index) => {
        const { store, baseUrl, softAppName } = this.component.props;
        const customer = this.metaAction.gf('data.other.customer').toJS();
        // let { customerCodeRule, customerStarCode, customerSet } = this.metaAction.gf('data.other.ruleDto').toJS();


        const ret = await this.metaAction.modal('show', {
            title: '新增客户',
            width: 400,
            // footer: false,
            children: this.metaAction.loadApp(
                'ttk-tplus-consumer-card', {
                    store,
                    baseUrl,
                    softAppName,
                    consumer: customer,
                    options: this.getOrgId(),
                    // starCode: customerCodeRule === 1 ? customerStarCode : ''
                }
            )
        })

        if (ret.value) {

            //新增客户档案成功后更新起始编码
            // if (customerSet && customerCodeRule === 1 && !isNaN(Number(customerStarCode)) && !isNaN(Number(ret.value.code)) && Number(ret.value.code) >= Number(customerStarCode)) {
            //     customerStarCode = formatStarCode(ret.value.code);//起始编码增加1
            //     this.metaAction.sf('data.other.ruleDto.customerStarCode', customerStarCode);
            //     await this.webapi.tplus.updateStarCode({ customerStarCode });//更新编码
            // }

            ret.value.codeAndName = ret.value.code + " " + ret.value.name;
            //修改客户
            const data = this.metaAction.gf('data.form.customerList').toJS();
            //  const customer = this.metaAction.gf('data.other.customer').toJS();
            //  const hascustomer = customer.find(o => o.name == ret.value.name && o.code == ret.value.code)
            //if (!hascustomer) {
            customer.push(ret.value);
            this.injections.reduce('upDate', { path: 'data.other.customer', value: customer });
            //   }
            const res = await this.webapi.tplus.customerSet([
                {
                    archiveId: data[index].archiveId,
                    mappingCode: ret.value.code,
                    mappingName: ret.value.name,
                    accountCode: data[index].accountCode
                }
            ])

            if (res === null) {
                this.injections.reduce('upDate', { path: `data.form.customerList.${index}.mappingCode`, value: ret.value.code })

            }
        }
    }
    //新增供应商
    addSupplier = async (index) => {
        const { store, baseUrl, softAppName } = this.component.props;
        const supplier = this.metaAction.gf('data.other.supplier').toJS();
        // let { supplierCodeRule, supplierStarCode } = this.metaAction.gf('data.other.ruleDto').toJS();


        const ret = await this.metaAction.modal('show', {
            title: '新增供应商',
            width: 400,
            // footer: false,
            children: this.metaAction.loadApp(
                'ttk-tplus-supplier-card', {
                    store,
                    baseUrl,
                    supplier,
                    softAppName,
                    options: this.getOrgId(),
                    // starCode: supplierCodeRule === 1 ? supplierStarCode : ''
                }
            )
        })
        if (ret.value) {
            //防止新增一个停用的往来科目 需要重新获取下
            // ret.value = ret.value[0];
            // if (supplierCodeRule === 1) {
            //     supplierStarCode = formatStarCode(ret.value.code);
            //     this.metaAction.sf('data.other.ruleDto.supplierStarCode', supplierStarCode);
            //     await this.webapi.tplus.updateStarCode({ supplierStarCode })
            // }
            const data = this.metaAction.gf('data.form.supplierList').toJS();
            // const supplier = this.metaAction.gf('data.other.supplier').toJS();

            ret.value.codeAndName = ret.value.code + " " + ret.value.name;
            //   const hassupplier = supplier.find(o => o.name == ret.value.name && o.code == ret.value.code)
            //   if (!hassupplier) {
            supplier.push(ret.value);
            //   }
            this.injections.reduce('upDate', { path: 'data.other.supplier', value: supplier });
            const res = await this.webapi.tplus.supplierSet([
                {
                    archiveId: data[index].archiveId,
                    mappingCode: ret.value.code,
                    mappingName: ret.value.name,
                    accountCode: ret.value.accountCode
                }
            ])
            if (res === null) {
                this.injections.reduce('upDate', { path: `data.form.supplierList.${index}.mappingCode`, value: ret.value.code });

            }
        }
    }
    //新增存货
    addInventory = async (index) => {
        const { store, baseUrl } = this.component.props;
        const inventory = this.metaAction.gf('data.other.inventory').toJS();
        //let { inventoryCodeRule, inventoryStarCode } = this.metaAction.gf('data.other.ruleDto').toJS();

        const ret = await this.metaAction.modal('show', {
            title: '新增存货',
            width: 400,
            //  footer: false,
            children: this.metaAction.loadApp(
                'ttk-tplus-inventory-card', {
                    store,
                    baseUrl,
                    inventory,
                    options: this.getOrgId(),
                    //starCode: inventoryCodeRule === 1 ? inventoryStarCode : ''
                }
            )
        })

        if (ret.value) {
            // ret.value = ret.value[0];
            //修改存货
            // if (inventoryCodeRule === 1) {
            //     inventoryStarCode = formatStarCode(ret.value.code);//
            //     this.metaAction.sf('data.other.ruleDto.inventoryStarCode', inventoryStarCode);
            //     await this.webapi.tplus.updateStarCode({ inventoryStarCode })
            // }

            const data = this.metaAction.gf('data.form.inventoryList').toJS();
            //  const inventory = this.metaAction.gf('data.other.inventory').toJS();

            ret.value.codeAndName = ret.value.code + " " + ret.value.name;
            //  const hasinventory = inventory.find(o => o.name == ret.value.name && o.code == ret.value.code)
            // if (!hasinventory) {
            inventory.push(ret.value);
            // }
            this.injections.reduce('upDate', { path: `data.other.inventory`, value: inventory })
            const res = await this.webapi.tplus.inventorySet([
                {
                    archiveId: data[index].archiveId,
                    mappingCode: ret.value.code,
                    mappingName: ret.value.name,
                    accountCode: ret.value.accountCode
                }
            ])
            if (res === null) {
                // this.injections.reduce('upDate', { path: `data.form.inventoryList.${index}.mappingCode`, value: ret.value.code })
                this.metaAction.sfs({
                    [`data.form.inventoryList.${index}.mappingCode`]: ret.value.code,
                    [`data.form.inventoryList.${index}.unit`]: ret.value.unit ? ret.value.unit : {},
                })
            }
        }
    }

    //新增收入类型
    addRevenueTypeCode = async (index) => {
        const { baseUrl, softAppName } = this.component.props;
        const account = this.metaAction.gf('data.other.account').toJS()
        const ret = await this.metaAction.modal('show', {
            title: '新增收入类型',
            wrapClassName: 'income-expenses-card',
            width: 410,
            okText: '确定',
            footer: '',
            bodyStyle: { padding: '10px 0' },
            closeModal: (v) => this.close(v, index),
            closeBack: (back) => { this.closeTip = back },
            children: this.metaAction.loadApp('scm-incomeexpenses-setting-card', {
                store: this.component.props.store,
                incomeexpensesTabId: 2001003,
                record: undefined,
                baseUrl,
                softAppName,
                account
            }),
        })

    }

    close = async (ret, index) => {
        this.closeTip()
        if (ret && ret.id) {
            let revenueTypeList = this.metaAction.gf('data.form.revenueTypeList').toJS(),
                inventoryList = this.metaAction.gf('data.form.inventoryList').toJS()

            revenueTypeList.push(ret)
            // console.log(ret, 'ret--******')

            let rowData = this.metaAction.gf(`data.form.inventoryList.${index}`).toJS()
            rowData = {
                ...rowData,
                revenueType: ret.id
            }
            const res = await this.webapi.tplus.inventorySet([rowData])
            if (res === null) {
                this.metaAction.sfs({
                    [`data.form.inventoryList.${index}.revenueType`]: ret.id,
                    'data.form.revenueTypeList': fromJS(revenueTypeList)
                })
            }
        }
    }

    //新增科目
    addAccount = async (docName, index) => {
        const { baseUrl, softAppName } = this.component.props;
        let year = moment(this.metaAction.context.get('currentOrg').periodDate).format('YYYY');
        let inventory = this.metaAction.gf('data.other.account').toJS();
        let rowData = this.metaAction.gf(`data.form.${docName}List.${index}`).toJS();
        let title;
        if (docName === 'inventory') {
            title = '新增存货科目'
        } else if (docName === 'customer' || docName === 'supplier') {
            title = '新增往来科目'
        } else {
            title = `新增${softAppName}科目`
        }
        const ret = await this.metaAction.modal('show', {
            title,
            width: 400,
            children: this.metaAction.loadApp(
                'ttk-tplus-account-card', {
                    store: this.component.props.store,
                    baseUrl,
                    softAppName,
                    inventory
                }
            )
        })
        if (ret) {
            const addObj = ret[0]
            rowData = {
                ...rowData,
                accountCode: addObj.code
            }

            let apiName = `${docName}Set`;
            if (docName == 'revenueType') {
                apiName = 'bussinessSet'
            } else if (docName == 'asset') {
                apiName = 'inventoryTypeSet'
            } else if (docName == 'busness') {
                apiName = 'bussinessSet'
            }
            if (docName == 'customer' || docName == 'supplier' || docName == 'inventory' || docName == 'settle') {
                rowData = [rowData]
            }
            let res = await Promise.all([
                this.webapi.tplus[apiName](rowData),
                this.webapi.tplus.common(`${baseUrl}/common/account/query`, { 'year': year }, this.getOrgId())
            ])
            if (res[1] && res[1].result) {
                let account = res[1].value
                account.forEach(
                    o => o.codeAndName = o.code + " " + o.name
                )
                this.metaAction.sf('data.other.account', fromJS(account))
            }
            if (res[0] || res[0] === null) {
                this.metaAction.sf(`data.form.${docName}List.${index}.accountCode`, addObj.code);
                this.metaAction.toast('success', '保存成功');
            } else {
                //this.metaAction.toast('error', `${res[0].error.message}`);
                this.metaAction.toast('error', '保存失败');
            }


        }
    }

    renderAccountSelectOption = (docName) => {

        let data = this.metaAction.gf(`data.other.${docName}`) && this.metaAction.gf(`data.other.${docName}`).toJS()
        if (data) {
            return data.map((d, index) => <Option title={d.codeAndName} key={index} value={d.code} style={{ 'font-size': '12px', 'height': '36px', 'line-height': '26px' }}>{d.codeAndName}</Option>)
        }
    }
    //收入类型
    renderRevenueTypeSelectOption = () => {
        let data = this.metaAction.gf('data.form.revenueTypeList') && this.metaAction.gf('data.form.revenueTypeList').toJS()
        if (data) {
            return data.map((d, index) => <Option title={d.name} key={index} value={d.id} style={{ 'font-size': '12px', 'height': '36px', 'line-height': '26px' }}>{d.name}</Option>)
        }
    }
    //按名称检索
    filterOptionName = (input, option) => {
        return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }

    //名称+助记码搜索
    filterOption = (input, option, name) => {

        input = input.replace(/\\/g, "\\\\")
        if (!option || !option.props || !option.props.value) return false
        let parmasName = null;
        if (name.currentPath) {
            parmasName = name.currentPath
        }
        if (parmasName.indexOf('customerMappingCode') != -1) {
            parmasName = 'customer';
        } else if (parmasName.indexOf('supplierMappingCode') != -1) {
            parmasName = 'supplier';
        } else if (parmasName.indexOf('inventoryMappingCode') != -1) {
            parmasName = 'inventory';
        } else if (parmasName.indexOf('revenueType') != -1) {
            parmasName = 'revenueType';
        } else {
            parmasName = 'account';
        }

        let paramsValues, paramsValue;
        if (parmasName == 'revenueType') {
            paramsValues = this.metaAction.gf('data.form.revenueTypeList');
            paramsValue = paramsValues.find((item) => item.get('id') == option.props.value)
        } else {
            paramsValues = this.metaAction.gf(`data.other.${parmasName}`);
            paramsValue = paramsValues.find((item) => item.get('code') == option.props.value)
        }

        if (!paramsValue) {
            return false
        }

        let regExp = new RegExp(input, 'i')
        if (paramsValue.get('shorthand') && paramsValue.get('shorthand').search(regExp) != -1) {
            return true
        } else if (paramsValue.get('name') && paramsValue.get('name').search(regExp) != -1) {
            return true
        } else if (paramsValue.get('codeAndName') && paramsValue.get('codeAndName').search(regExp) != -1) {
            return true
        } else if (paramsValue.get('helpCode') && paramsValue.get('helpCode').search(regExp) != -1) {
            return true
        } else if (paramsValue.get('helpCodeFull') && paramsValue.get('helpCodeFull').search(regExp) != -1) {
            return true
        }
        return false
    }

    //错误提示
    getErrorList = () => {
        let list = this.metaAction.gf('data.errorList');
        if (list) {
            list = list.toJS()
            if (list && list.length > 0) {
                return (
                    <div>
                        <div className="jinggao">
                            <Icon type="jinggao" fontFamily='edficon' />
                            <span>失败原因如下：</span>
                        </div>
                        <div className='error-row'>
                            <ul>
                                {
                                    list.map(
                                        (o, i) => <li key={i}>{o.message}</li>
                                    )
                                }
                            </ul>
                        </div>
                    </div>
                )
            } else {
                return null;
            }
        } else {
            return null
        }
    }

    selectRow = (rowIndex, path) => (e) => {
        this.injections.reduce('selectRow', rowIndex, path, e.target.checked)
    }

    //批量生成客户往来科目
    handleBatchGetCustomerCurrentAccount = async () => {

        let loading = this.metaAction.gf('data.customerLoading');
        if (loading) {
            this.metaAction.toast('error', '请等待数据加载完成');
            return
        }
        let doc = this.metaAction.gf('data.other.customer').toJS();//档案列表
        let selectList = this.metaAction.gf('data.form.customerList').toJS().filter(o => o.selected);
        let isAux = this.metaAction.gf('data.other.isAux').toJS();
        const { customerIds } = this.ids;

        let account = {
            value: this.metaAction.gf('data.other.account').toJS()
        };
        if (selectList.length === 0) {
            this.metaAction.toast('error', '请选择数据');
            return
        }

        if (isAux.consumer) {
            let flag = true;
            selectList.forEach(o => {
                let isMapCode = doc.find(p => p.code == o.mappingCode);
                if (isMapCode) {
                    flag = false;
                }
            })
            if (flag) {
                this.metaAction.toast('error', '请先修改客户档案')
                return;
            }
        }

        const linkConfig = this.metaAction.context.get('linkConfig');
        const baseUrl = `${document.location.protocol}//${linkConfig.foreseeClientHost}`;

        const ret = await this.metaAction.modal('show', {
            title: '批量生成往来科目',
            width: 450,
            children: this.metaAction.loadApp(
                'ttk-tplus-batch-get-current-account', {
                    store: this.component.props.store,
                    baseUrl,
                    docName: '客户'
                }
            )
        })
        if (ret) {

            let { code: parentCode, name, isCalcQuantity, accountName } = ret;

            let year = moment(this.metaAction.context.get('currentOrg').periodDate).format('YYYY');
            let failItems = []

            let needUpdateList = [], needAddList = [];
            let endClassAccount = account.value.filter((a) => {
                return new RegExp(`^${parentCode}`).test(a.code)
            });//下级科目
            selectList.forEach(
                o => {
                    if (isAux.consumer) {
                        //是否匹配了档案
                        let isMapCode = doc.find(p => p.code == o.mappingCode);
                        if (isMapCode) {

                            //是否映射当前下级科目 是否名称相同
                            let isMapAccoutCode = endClassAccount.find(p => p.code == o.accountCode);

                            if (!isMapAccoutCode) {
                                needUpdateList.push(o);
                            } else if (isMapAccoutCode.name != isMapCode.name) {
                                needUpdateList.push(o);
                            }
                            //是否匹配T+name
                            let isMapName = endClassAccount.find(b => b.name == isMapCode.name);
                            if (!isMapName) {
                                //需要新增的往来科目
                                needAddList.push({
                                    name: isMapCode.name,//名称(档案名称)
                                    parentCode,//上级编码
                                    year,
                                    aux: {
                                        isCalcQuantity,
                                        unitDto: {
                                            // id: "1",
                                            // code: "001",
                                            // name: "个"
                                        },
                                        isCalcMulti: false
                                    }
                                })
                            }
                        }
                    } else {
                        //是否映射当前下级科目 是否名称相同
                        let isMapAccoutCode = endClassAccount.find(p => p.code == o.accountCode);

                        if (!isMapAccoutCode) {
                            needUpdateList.push(o);
                        } else if (isMapAccoutCode.name != o.archiveName) {
                            needUpdateList.push(o);
                        }
                        //是否匹配T+name
                        let isMapName = endClassAccount.find(b => b.name == o.archiveName);
                        if (!isMapName) {
                            //需要新增的往来科目
                            needAddList.push({
                                name: o.archiveName,//名称(档案名称)
                                parentCode,//上级编码
                                year,
                                aux: {
                                    isCalcQuantity,
                                    unitDto: {
                                        // id: "1",
                                        // code: "001",
                                        // name: "个"
                                    },
                                    isCalcMulti: false
                                }
                            })
                        }
                    }

                }
            )
            this.metaAction.sf('data.customerLoading', true)
            //批量新增往来科目
            if (needAddList.length > 0) {
                const res = await this.webapi.tplus.common(`${baseUrl}/common/account/createBatch`, needAddList, this.getOrgId());
                if (res && res.error) {
                    //this.metaAction.sf('data.customerLoading', false);
                    // this.metaAction.toast('error', `${res.error.message}`);
                } else if (res && res.result) {
                    //重新获取T+往来科目
                    //successItems
                    account = await this.webapi.tplus.common(`${baseUrl}/common/account/query`, { year }, this.getOrgId())
                    account.value ? account.value.forEach(
                        (o) => {
                            o.codeAndName = o.code + " " + o.name;
                        }
                    ) : account.value = [];
                    this.metaAction.sf('data.other.account', fromJS(account.value))
                } else {
                    //this.metaAction.sf('data.customerLoading', false);
                    this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
                }
                if (res.failItems) {
                    failItems = res.failItems//批量新增失败
                }
            }

            //批量修改往来科目
            if (needUpdateList.length > 0) {

                const setList = [];
                let endClassAccount = account.value.filter((a) => {
                    return new RegExp(`^${parentCode}`).test(a.code)
                });//
                if (isAux.consumer) {
                    needUpdateList.forEach(o => {
                        let isMapCode = doc.find(p => p.code == o.mappingCode);
                        if (isMapCode) {

                            let item = endClassAccount.find(p => p.name == isMapCode.name);

                            if (item) {
                                setList.push({
                                    ...o,
                                    accountCode: item.code
                                })
                            }
                        }
                    })
                } else {
                    needUpdateList.forEach(o => {
                        let item = endClassAccount.find(p => p.name == o.archiveName);
                        if (item) {
                            setList.push({
                                ...o,
                                accountCode: item.code
                            })
                        }
                    })
                }

                if (setList.length > 0) {
                    //更新客户
                    const ret = await this.webapi.tplus.customerSet(setList);
                    let res = await this.webapi.tplus.customer({ idList: customerIds });
                    let customerList = res.list || [];
                    this.handlefilterDoc(customerList, {
                        account: account.value
                    });
                    this.metaAction.sf('data.form.customerList', fromJS(customerList))
                }
            }

            if (failItems.length) {
                const content = <div>
                    {
                        response.failItems.map((item, index) => {
                            return <div>{`${item.key} ${item.msg}`}</div>
                        })
                    }
                </div>
                const result = await this.metaAction.modal('warning', {
                    content: content,
                    okText: '确定'
                })
            } else {

                this.metaAction.sf('data.customerLoading', false);

                this.metaAction.toast('success', '批量生成往来科目成功')
            }
        }

    }

    //批量生成供应商往来科目
    handleBatchGetSupplierCurrentAccount = async () => {

        let loading = this.metaAction.gf('data.supplierLoading');
        if (loading) {
            this.metaAction.toast('error', '请等待数据加载完成');
            return
        }

        let doc = this.metaAction.gf('data.other.supplier').toJS();//档案列表
        let selectList = this.metaAction.gf('data.form.supplierList').toJS().filter(o => o.selected)
        let isAux = this.metaAction.gf('data.other.isAux').toJS();
        const { supplierIds } = this.ids;

        let account = {
            value: this.metaAction.gf('data.other.account').toJS()
        };
        if (selectList.length === 0) {
            this.metaAction.toast('error', '请选择数据');
            return
        }

        if (isAux.supplier) {
            let flag = true;
            selectList.forEach(o => {
                let isMapCode = doc.find(p => p.code == o.mappingCode);
                if (isMapCode) {
                    flag = false;
                }
            })
            if (flag) {
                this.metaAction.toast('error', '请先修改供应商档案')
                return;
            }
        }

        const linkConfig = this.metaAction.context.get('linkConfig');
        const baseUrl = `${document.location.protocol}//${linkConfig.foreseeClientHost}`;

        const ret = await this.metaAction.modal('show', {
            title: '批量生成往来科目',
            width: 450,
            children: this.metaAction.loadApp(
                'ttk-tplus-batch-get-current-account', {
                    store: this.component.props.store,
                    baseUrl,
                    docName: '供应商'
                }
            )
        })
        if (ret) {

            let { code: parentCode, name, isCalcQuantity, accountName } = ret;
            let year = moment(this.metaAction.context.get('currentOrg').periodDate).format('YYYY');
            let failItems = []
            let needUpdateList = [], needAddList = [];
            let endClassAccount = account.value.filter((a) => {
                return new RegExp(`^${parentCode}`).test(a.code)
            });//下级科目
            selectList.forEach(
                o => {
                    if (isAux.supplier) {
                        //是否匹配了档案
                        let isMapCode = doc.find(p => p.code == o.mappingCode);
                        if (isMapCode) {

                            //是否映射当前下级科目 是否名称相同
                            let isMapAccoutCode = endClassAccount.find(p => p.code == o.accountCode);

                            if (!isMapAccoutCode) {
                                needUpdateList.push(o);
                            } else if (isMapAccoutCode.name != isMapCode.name) {
                                needUpdateList.push(o);
                            }
                            //是否匹配T+name
                            let isMapName = endClassAccount.find(b => b.name == isMapCode.name);
                            if (!isMapName) {
                                //需要新增的往来科目
                                needAddList.push({
                                    name: isMapCode.name,//名称(档案名称)
                                    parentCode,//上级编码
                                    year,
                                    aux: {
                                        isCalcQuantity,
                                        unitDto: {
                                            // id: "1",
                                            // code: "001",
                                            // name: "个"
                                        },
                                        isCalcMulti: false
                                    }
                                })
                            }
                        }
                    } else {
                        //是否映射当前下级科目 是否名称相同
                        let isMapAccoutCode = endClassAccount.find(p => p.code == o.accountCode);
                        if (!isMapAccoutCode) {
                            needUpdateList.push(o);
                        } else if (isMapAccoutCode.name != o.archiveName) {
                            needUpdateList.push(o);
                        }
                        //是否匹配T+name
                        let isMapName = endClassAccount.find(b => b.name == o.archiveName);
                        if (!isMapName) {
                            //需要新增的往来科目
                            needAddList.push({
                                name: o.archiveName,//名称(档案名称)
                                parentCode,//上级编码
                                year,
                                aux: {
                                    isCalcQuantity,
                                    unitDto: {
                                        // id: "1",
                                        // code: "001",
                                        // name: "个"
                                    },
                                    isCalcMulti: false
                                }
                            })
                        }
                    }
                }
            )

            this.metaAction.sf('data.supplierLoading', true)

            //批量新增往来科目
            if (needAddList.length > 0) {
                const res = await this.webapi.tplus.common(`${baseUrl}/common/account/createBatch`, needAddList, this.getOrgId());
                if (res && res.error) {
                    //this.metaAction.sf('data.customerLoading', false);
                    // this.metaAction.toast('error', `${res.error.message}`);
                } else if (res && res.result) {
                    //重新获取T+往来科目
                    //successItems
                    account = await this.webapi.tplus.common(`${baseUrl}/common/account/query`, { year }, this.getOrgId())
                    account.value ? account.value.forEach(
                        (o) => {
                            o.codeAndName = o.code + " " + o.name;
                        }
                    ) : account.value = [];
                    this.metaAction.sf('data.other.account', fromJS(account.value))
                } else {
                    //this.metaAction.sf('data.customerLoading', false);
                    this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
                }
                if (res.failItems) {
                    failItems = res.failItems//批量新增失败
                }
            }

            //批量修改往来科目
            if (needUpdateList.length > 0) {
                const setList = [];
                let endClassAccount = account.value.filter((a) => {
                    return new RegExp(`^${parentCode}`).test(a.code)
                });//
                if (isAux.supplier) {
                    needUpdateList.forEach(o => {
                        let isMapCode = doc.find(p => p.code == o.mappingCode);
                        if (isMapCode) {

                            let item = endClassAccount.find(p => p.name == isMapCode.name);

                            if (item) {
                                setList.push({
                                    ...o,
                                    accountCode: item.code
                                })
                            }
                        }
                    })
                } else {
                    needUpdateList.forEach(o => {

                        let item = endClassAccount.find(p => p.name == o.archiveName);

                        if (item) {
                            setList.push({
                                ...o,
                                accountCode: item.code
                            })
                        }

                    })
                }

                if (setList.length > 0) {
                    //更新供应商
                    const ret = await this.webapi.tplus.supplierSet(setList);
                    //重新获取列表数据
                    let res = await this.webapi.tplus.supplier({ idList: supplierIds });
                    let supplierList = res.list || [];
                    this.handlefilterDoc(supplierList, {
                        account: account.value
                    });
                    this.metaAction.sf('data.form.supplierList', fromJS(supplierList))
                }
            }

            if (failItems.length) {
                const content = <div>
                    {
                        response.failItems.map((item, index) => {
                            return <div>{`${item.key} ${item.msg}`}</div>
                        })
                    }
                </div>
                const result = await this.metaAction.modal('warning', {
                    content: content,
                    okText: '确定'
                })
            } else {
                this.metaAction.sf('data.supplierLoading', false);
                this.metaAction.toast('success', '批量生成往来科目成功')
            }
        }

    }


    // 存货批量生成收入科目、批量生成存货科目
    handleBatchCreateInventoryAccount = async () => {
        let selectedArr = this.extendAction.gridAction.getSelected('dataGridInventory');
        const { baseUrl, vatOrEntry } = this.component.props;

        if (selectedArr.length === 0) {
            this.metaAction.toast('error', '请选择数据');
            return
        }

        const { dataGridInventory } = this.option
        let selectList = this.metaAction.gf(`${dataGridInventory.path}`).toJS().filter(o => o.selected)
        let isAux = this.metaAction.gf('data.other.isAux').toJS();
        if (isAux.inventory) {
            let flag = true;
            const inventory = this.metaAction.gf('data.other.inventory').toJS()
            selectList.forEach(o => {
                let isMapCode = inventory.find(p => p.code == o.mappingCode);
                if (isMapCode) {
                    flag = false;
                }
            })

            if (flag) {
                this.metaAction.toast('error', '请先修改存货档案')
                return;
            }
        }

        if (vatOrEntry == 0) {
            const ret = await this.metaAction.modal('show', {
                title: '批量生成收入科目',
                width: 450,
                wrapClassName: 'tplus-batch-update-account',
                children: this.metaAction.loadApp(
                    'ttk-tplus-batch-get-current-account', {
                        store: this.component.props.store,
                        baseUrl: baseUrl,
                        type: 'incomeAccount'
                    }
                )
            })

            if (ret) {
                this.handleBatchCreateAccount(ret)
            }
        } else {
            const ret = await this.metaAction.modal('show', {
                title: '批量生成存货科目',
                width: 450,
                children: this.metaAction.loadApp(
                    'ttk-tplus-batch-get-current-account', {
                        store: this.component.props.store,
                        baseUrl: baseUrl,
                        type: 'inventoryAccount'
                    }
                )
            })
            if (ret) {
                this.handleBatchCreateAccount(ret, 'inventory')
            }
        }

    }

    handleAccountCode = (rowData, successList, name, type) => {
        let valueList = []
        valueList = this.metaAction.gf('data.other.inventory').toJS()

        // console.log(rowData, 'rowData')
        let accountCode = null, accountName = null, unitName = rowData.unit ? rowData.unit.name : ''
        const isAux = this.metaAction.gf('data.other.isAux').toJS()

        if (isAux.inventory) {
            rowData = valueList.find(o => o.code == rowData.mappingCode)

            if (type == 'inventory') {
                successList.forEach(obj => {
                    if (rowData.name == obj.name.trim()) {
                        accountCode = obj.code
                        accountName = obj.name
                    }
                })
            } else {
                successList.forEach(obj => {
                    let names = name == 'accountNameModel' ? (rowData.unit ? `${rowData.name} ${rowData.unit.name}` : `${rowData.name} `) : rowData.name

                    if (names == obj.name) {
                        accountCode = obj.code
                        accountName = obj.name
                    }
                })

                if (type == 'accountName') {
                    return accountName
                }
            }
        } else {
            if (type == 'inventory') {
                successList.forEach(obj => {
                    if (rowData.inventoryName == obj.name.trim()) {
                        accountCode = obj.code
                        accountName = obj.name
                    }
                })
            } else {
                successList.forEach(obj => {
                    let names = name == 'accountNameModel' ? (rowData.unit ? `${rowData.inventoryName} ${rowData.unit.name}` : `${rowData.name} `) : rowData.inventoryName

                    if (names == obj.name) {
                        accountCode = obj.code
                        accountName = obj.name
                    }
                })

                if (type == 'accountName') {
                    return accountName
                }
            }
        }

        return accountCode
    }

    handleCrateUpdate = async (selectList, type, only) => {
        this.metaAction.sf('data.inventoryLoading', true)
        const { baseUrl } = this.component.props;
        let year = moment(this.metaAction.context.get('currentOrg').periodDate).format('YYYY');
        if (type == 'inventory') {
            // if (only == 'onlyUpdate') {
            //     selectList.map((item, index) => {
            //         let obj = {
            //             archiveId: item.archiveId,
            //             mappingCode: item.mappingCode,
            //             mappingName: item.mappingName,
            //             accountCode: item.accountCode,
            //             rate: item.rate,
            //             revenueType: item.revenueType
            //         }
            //         return obj
            //     })
            // }
            const result = await this.webapi.tplus.inventorySet(selectList)
            const inventoryNew = await this.webapi.tplus.common(`${baseUrl}/common/account/query`, { 'year': year }, this.getOrgId())

            let sfsObj = {}

            if (result === null) {
                let inventoryList = this.metaAction.gf('data.form.inventoryList').toJS()
                inventoryList = inventoryList.map(item => {
                    selectList.forEach(obj => {
                        if (item.archiveId == obj.archiveId) {
                            if (type == 'inventory') {
                                item.accountCode = obj.accountCode
                            }
                        }
                    })
                    return item
                })

                this.handlefilterDoc(inventoryList, {
                    account: inventoryNew.value
                });

                sfsObj['data.form.inventoryList'] = fromJS(inventoryList)

                if (inventoryNew && inventoryNew.result) {
                    let account = this.metaAction.gf('data.other.account').toJS()
                    account = inventoryNew.value
                    account.forEach(
                        o => o.codeAndName = o.code + " " + o.name
                    )

                    sfsObj['data.other.account'] = fromJS(account)
                }

                sfsObj['data.inventoryLoading'] = false

                this.metaAction.sfs(sfsObj);
                this.metaAction.toast('success', '保存成功');

            } else {
                this.metaAction.sf('data.inventoryLoading', false)
            }

        } else {
            selectList = selectList.map((item, index) => {
                let obj = {
                    archiveId: item.archiveId,
                    accountCode: item.accountCode,
                    accountName: item.accountName
                }
                return obj
            })

            const result = await this.webapi.tplus.saveRevenueAccount(selectList)
            const revenueTypeNew = await this.webapi.tplus.businessType({ parentId: "2001003", includeDisable: "false" })
            let accountRes = await this.webapi.tplus.common(`${baseUrl}/common/account/query`, { year: moment(this.metaAction.context.get('currentOrg').periodDate).format('YYYY') }, this.getOrgId());
            let account = accountRes.value;
            account.forEach(
                o => o.codeAndName = o.code + " " + o.name
            )

            let sfsObj = {}

            if (result) {
                let inventoryList = this.metaAction.gf('data.form.inventoryList').toJS()
                inventoryList = inventoryList.map(item => {
                    result.forEach(obj => {
                        if (obj.archiveId == item.archiveId) {
                            item.accountCode = obj.accountCode
                            item.accountName = obj.accountName
                            item.revenueType = obj.revenueType
                            item.revenueTypeName = obj.revenueTypeName
                        }
                    })
                    return item
                })

                this.handlefilterDoc(inventoryList, {
                    revenueTypeList: revenueTypeNew
                });
                sfsObj['data.other.account'] = fromJS(account)
                sfsObj['data.form.inventoryList'] = fromJS(inventoryList)

                if (revenueTypeNew) {
                    let revenueType = this.metaAction.gf('data.form.revenueTypeList').toJS()
                    sfsObj['data.form.revenueTypeList'] = fromJS(revenueTypeNew)
                }

                sfsObj['data.inventoryLoading'] = false
                this.metaAction.sfs(sfsObj)
                this.metaAction.toast('success', '保存成功');
            } else {
                this.metaAction.sf('data.inventoryLoading', false)
            }

        }
    }

    handleBatchCreateAccount = async (ret, type) => {
        let { code, name, isCalcQuantity, accountName } = ret
        const { baseUrl } = this.component.props;
        let year = moment(this.metaAction.context.get('currentOrg').periodDate).format('YYYY');
        const { dataGridInventory } = this.option

        let selectList = this.metaAction.gf(`${dataGridInventory.path}`).toJS().filter(o => o.selected)
        const inventory = this.metaAction.gf('data.other.inventory').toJS() || []
        const isAux = this.metaAction.gf('data.other.isAux').toJS()
        let parmasList = [], needUpdateList = [], needAddList = [], inventoryRow = {}

        selectList = selectList.map(item => {
            let accountList = [], endClassAccount = [], isMapName = null

            if (type == 'inventory') {
                //批量生成存货科目
                accountList = this.metaAction.gf('data.other.account').toJS()
                endClassAccount = accountList.filter((a) => {
                    return new RegExp(`^${code}`).test(a.code)
                });

                if (isAux.inventory) {
                    //启用了存货辅助核算
                    inventoryRow = inventory.find(o => o.code == item.mappingCode)
                    if (inventoryRow) {
                        isMapName = endClassAccount.find(o => o.name == inventoryRow.name)
                    }
                } else {
                    inventoryRow.name = item.inventoryName;
                    isMapName = endClassAccount.find(o => o.name == item.inventoryName)
                }

                if (isMapName) {
                    //有相同的名称
                    const isMapCode = endClassAccount.find(o => o.code == item.accountCode)
                    if (!isMapCode) {
                        item.accountCode = isMapName.code
                        needUpdateList.push(item)
                    } else {
                        if (isMapCode.name != inventoryRow.name) {
                            item.accountCode = isMapName.code
                            needUpdateList.push(item)
                        }
                    }
                }


            } else {
                accountList = this.metaAction.gf('data.form.revenueTypeList').toJS()
                endClassAccount = accountList.filter((a) => {
                    return a.accountCode && new RegExp(`^${code}`).test(a.accountCode)
                });
                let inventoryName = ''
                if (isAux.inventory) {
                    inventoryRow = inventory.find(o => o.code == item.mappingCode)
                    if (inventoryRow) {
                        inventoryName = accountName == 'accountNameModel' ? inventoryRow.name + ' ' + (inventoryRow.unit ? inventoryRow.unit.name : '') : inventoryRow.name
                        isMapName = endClassAccount.find(o => o.name == inventoryName)
                    }
                } else {
                    inventoryName = item.inventoryName
                    isMapName = endClassAccount.find(o => o.name == item.inventoryName)
                }

                if (isMapName) {
                    item.accountCode = isMapName.accountCode
                    item.accountName = inventoryName
                    needUpdateList.push(item)
                }
            }

            if (!isMapName) {
                const inventoryRowName = accountName == 'accountNameModel' && type != 'inventory' ? inventoryRow.name + ' ' + (inventoryRow.unit ? inventoryRow.unit.name : '') : inventoryRow.name
                const params = {
                    parentCode: code,
                    name: isAux.inventory ? inventoryRowName : item.inventoryName,
                    year,
                    aux: {
                        isCalcQuantity,
                        isCalcMulti: false
                    }
                }
                if (isCalcQuantity) {
                    params.aux.unitDto = item.unit
                } else {
                    params.aux.unitDto = {}
                }

                parmasList.push(params)
                needAddList.push(item)
            }



            // const inventoryRow = inventory.find(o => o.code == item.mappingCode)
            // if (inventoryRow) {
            //     if (type == 'inventory') {
            //         accountList = this.metaAction.gf('data.other.account').toJS()
            //         endClassAccount = accountList.filter((a) => {
            //             return new RegExp(`^${code}`).test(a.code)
            //         });

            //         isMapName = endClassAccount.find(o => o.name == inventoryRow.name)
            //         if (isMapName) {

            //             const isMapCode = endClassAccount.find(o => o.code == item.accountCode)
            //             if (!isMapCode) {
            //                 item.accountCode = isMapName.code
            //                 needUpdateList.push(item)
            //             } else {
            //                 if (isMapCode.name != inventoryRow.name) {
            //                     item.accountCode = isMapName.code
            //                     needUpdateList.push(item)
            //                 }
            //             }
            //         }

            //     } else {
            //         let inventoryName = accountName == 'accountNameModel' ? inventoryRow.name + ' ' + (inventoryRow.unit ? inventoryRow.unit.name : '') : inventoryRow.name

            //         accountList = this.metaAction.gf('data.form.revenueTypeList').toJS()
            //         endClassAccount = accountList.filter((a) => {
            //             return a.accountCode && new RegExp(`^${code}`).test(a.accountCode)
            //         });
            //         isMapName = endClassAccount.find(o => o.name == inventoryName)

            //         if (isMapName) {
            //             item.accountCode = isMapName.accountCode
            //             item.accountName = inventoryName
            //             needUpdateList.push(item)
            //         }
            //     }

            //     if (!isMapName) {
            //         const params = {
            //             parentCode: code,
            //             // name: inventoryRow.name,
            //             name: accountName == 'accountNameModel' && type != 'inventory' ? inventoryRow.name + ' ' + (inventoryRow.unit ? inventoryRow.unit.name : '') : inventoryRow.name,
            //             year,
            //             aux: {
            //                 isCalcQuantity,
            //                 isCalcMulti: false
            //             }
            //         }
            //         if (isCalcQuantity) {
            //             params.aux.unitDto = item.unit
            //         } else {
            //             params.aux.unitDto = {}
            //         }

            //         parmasList.push(params)
            //         needAddList.push(item)
            //     }
            // }

            return item
        })

        // console.log(needUpdateList, parmasList, needAddList, selectList, code, '+++++++++++++')
        //重新获取下科目
        if (parmasList.length) {
            const res = await this.webapi.tplus.common(`${baseUrl}/common/account/createBatch`, parmasList, this.getOrgId());
            if (res.error && res.error.message) {
                this.metaAction.toast('error', res.error.message)
                if (needUpdateList.length) {
                    this.handleCrateUpdate(needUpdateList, type, 'onlyUpdate', name)
                }
            } else if (res.result) {
                const response = res.value || {}
                if (response.successItems && response.successItems.length) {
                    if (type == 'inventory') {
                        let needAddListUpdate = needAddList.map((item, index) => {
                            let obj = {
                                archiveId: item.archiveId,
                                mappingCode: item.mappingCode,
                                mappingName: item.mappingName,
                                accountCode: this.handleAccountCode(item, response.successItems, accountName, 'inventory'),
                                rate: item.rate,
                                revenueType: item.revenueType
                            }
                            return obj
                        })
                        if (needUpdateList.length) needAddListUpdate = needAddListUpdate.concat(needUpdateList)
                        this.handleCrateUpdate(needAddListUpdate, type, null, name)

                    } else {
                        let needAddListUpdate = needAddList.map((item, index) => {
                            let obj = {
                                archiveId: item.archiveId,
                                accountCode: this.handleAccountCode(item, response.successItems, accountName),
                                accountName: this.handleAccountCode(item, response.successItems, accountName, 'accountName')
                            }
                            return obj
                        })
                        if (needUpdateList.length) needAddListUpdate = needAddListUpdate.concat(needUpdateList)
                        this.handleCrateUpdate(needAddListUpdate, type, null, name)
                    }
                }
                if (response.failItems && response.failItems.length) {
                    const content = <div>
                        {
                            response.failItems.map((item, index) => {
                                return <div>{`${item.key} ${item.msg}`}</div>
                            })
                        }
                    </div>
                    const result = await this.metaAction.modal('warning', {
                        content: content,
                        okText: '确定'
                    })
                }

                if (!response.successItems && needUpdateList.length) {
                    this.handleCrateUpdate(needUpdateList, type, 'onlyUpdate', name)
                }
            } else {
                this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
            }
        } else {
            if (needUpdateList.length) {
                this.handleCrateUpdate(needUpdateList, type, 'onlyUpdate', name)
            } else {
                this.metaAction.toast('success', '保存成功');
            }
        }

    }

    addAccountNew = async () => {
        const { baseUrl, softAppName } = this.component.props;
        let year = moment(this.metaAction.context.get('currentOrg').periodDate).format('YYYY');
        let inventory = this.metaAction.gf('data.other.account').toJS();

        const ret = await this.metaAction.modal('show', {
            title: '新增存货科目',
            width: 400,
            children: this.metaAction.loadApp(
                'ttk-tplus-account-card', {
                    store: this.component.props.store,
                    baseUrl,
                    softAppName,
                    inventory
                }
            )
        })

        if (ret) {
            // console.log(ret, 'ret***********')
            let res = await this.webapi.tplus.common(`${baseUrl}/common/account/query`, { 'year': year }, this.getOrgId())
            if (res && res.result) {
                // console.log(res.value, 'res.value')
                let account = res.value
                account.forEach(
                    o => o.codeAndName = o.code + " " + o.name
                )
                this.metaAction.sf('data.other.account', fromJS(account))
                this.metaAction.toast('success', '保存成功');
                return { addItem: ret[0], account: account }
            } else {
                this.metaAction.toast('error', '保存失败');
            }

        }
    }

    //存货批量修改收入类型、批量修改存货科目
    handleBatchUpdateInventoryAccount = async () => {
        let selectedArr = this.extendAction.gridAction.getSelected('dataGridInventory');
        if (selectedArr.length === 0) {
            this.metaAction.toast('error', '请选择数据');
            return
        }
        const revenueTypeList = this.metaAction.gf('data.form.revenueTypeList').toJS();
        const vatOrEntry = this.metaAction.gf('data.other.vatOrEntry');
        if (vatOrEntry == 0) {
            const ret = await this.metaAction.modal('show', {
                title: '批量修改收入类型',
                width: 400,
                wrapClassName: 'tplus-batch-update-account',
                children: <BatchUpdateModal
                    dataList={revenueTypeList}
                />
            })

            if (ret) {
                this.handleEditInventoryList(ret)
            }
        } else {
            const { baseUrl } = this.component.props;
            const account = this.metaAction.gf('data.other.account').toJS()
            const ret = await this.metaAction.modal('show', {
                title: '批量修改存货科目',
                width: 400,
                wrapClassName: 'batchUpdateModal',
                children: <BatchUpdateModal
                    dataList={account}
                    type='inventory'
                    addAccount={this.addAccountNew}
                />
            })
            if (ret) {
                this.handleEditInventoryList(ret, 'inventory')
            }
        }
    }

    handleEditInventoryList = async (ret, type) => {
        const { dataGridInventory } = this.option
        let selectList = this.metaAction.gf(`${dataGridInventory.path}`).toJS()
        selectList = selectList.filter(o => o.selected)

        selectList = selectList.map(item => {

            if (type == 'inventory') {
                let obj = {
                    archiveId: item.archiveId,
                    accountCode: ret,
                    mappingCode: item.mappingCode,
                    mappingName: item.mappingName,
                    revenueType: item.revenueType,
                    rate: item.rate,
                }
                // item.accountCode = ret
                // return item
                return obj
            } else {
                let obj = {
                    archiveId: item.archiveId,
                    accountCode: item.accountCode,
                    mappingCode: item.mappingCode,
                    mappingName: item.mappingName,
                    revenueType: ret,
                    rate: item.rate,
                }
                return obj
                // item.revenueType = ret
                // return item
            }
        })
        // console.log(selectList,this.option, `${dataGridInventory.path}`,'selectList')

        const res = await this.webapi.tplus.inventorySet(selectList)
        if (res === null) {
            let inventoryList = this.metaAction.gf('data.form.inventoryList').toJS()
            inventoryList = inventoryList.map(item => {
                selectList.forEach(obj => {
                    if (item.archiveId == obj.archiveId) {
                        if (type == 'inventory') {
                            item.accountCode = obj.accountCode
                        } else {
                            item.revenueType = obj.revenueType
                        }
                    }
                })
                return item
            })
            // console.log(inventoryList, 'inventoryList')
            this.metaAction.sf('data.form.inventoryList', fromJS(inventoryList))
            this.metaAction.toast('success', '保存成功');
        }
    }

    renderRate = (rowData, index) => {
        // console.log(rowData, 'rowData')
        if (!rowData.unitName || !rowData.unit || !rowData.unit.name) {
            return null
        }
        return <div>
            1{rowData.unitName}:
            <Input.Number
                style={{ width: 70, margin: '0 8px', fontSize: '12px', textAlign: 'right', height: '26px' }}
                value={rowData.rate}
                onChange={(v) => this.onFieldChange('inventoryList', v, index, 'rate')}
                className={!isNaN(Number(rowData.rate)) && Number(rowData.rate) > 0 ? '' : 'has-error'}
                minValue={0}
            />
            {rowData.unit.name}
            {/* {rowData.unitName} */}
        </div>
    }

    renderInventoryUnitName = (rowData, index) => {
        // const inventory = this.metaAction.gf('data.form.inventoryList').toJS()
        // const { mappingCode } = rowData
        // const unit= inventory.find(o => o.mappingCode == mappingCode)

        // return unit ? unit.name : ''
        const inventorys = this.metaAction.gf('data.other.inventory').toJS()
        const { mappingCode } = rowData
        const { unit } = inventorys.find(o => o.code == mappingCode)

        return unit ? unit.name : ''
    }
    openAutomaticGenerationSetting = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '发票自动生成档案设置',
            width: 800,
            footer: '',
            bodyStyle: { padding: '12px 12px' },
            closeModal: this.close2,
            closeBack: (back) => { this.closeTip2 = back },
            children: this.metaAction.loadApp('ttk-scm-automatic-generation-setting', {
                store: this.component.props.store,
            }),
        })
    }

    close2 = (ret) => {
        this.closeTip2()
        if (ret) { }
    }


}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
