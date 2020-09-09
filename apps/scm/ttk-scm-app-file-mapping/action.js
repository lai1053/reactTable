import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Icon, Tree, Form, Select, Switch } from 'edf-component'
import config from './config'
import moment from 'moment'
import { fromJS } from 'immutable'
import renderColumns from './utils/renderColumns'
import extend from './extend'
const Option = Select.Option
const FormItem = Form.Item
const checkList = []
//起始编码格式化
const formatStarCode = (s) => {
    //aaa001
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

        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
            //  addEventListener('enlargeClick', () => this.onResize({}))
        }
        injections.reduce('init');
        this.load();
    }

    getOrgId = () => {
        const org = this.getCurrentOrg()
        if (org) {
            return org.id;
        }
        return ""
    }

    load = async () => {

        this.request('0');

        this.loadOther()
    }

    onTabFocus = async () => {
        let activeKey = this.metaAction.gf('data.other.activeKey');
        this.request(activeKey);

        this.loadOther()

    }

    loadOther = async () => {
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

        const options = {
            headers: {
                token: this.getOrgId()
            }
        };
        const linkConfig = this.metaAction.context.get('linkConfig');
        const baseUrl = `${document.location.protocol}//${linkConfig.foreseeClientHost}`;

        let sfsObj = {}

        let res = await Promise.all([
            this.webapi.ruleGet(),
             this.webapi.common(`${baseUrl}/common/account/queryIsAux`, {}, options)
        ])

        let ruleRes = res[0]
        if (ruleRes) {
            ruleDto = ruleRes;
        }

        let isAux = res[1]
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
            sfsObj['data.other.isAux'] = fromJS(AuxEnableDto)
        }
        // this.metaAction.sf('data.other.ruleDto', fromJS(ruleDto));
        sfsObj['data.other.ruleDto'] = fromJS(ruleDto)

        this.metaAction.sfs(sfsObj)
    }


    onTabChange = (activeKey) => {
        this.injections.reduce('onTabChange', activeKey);
        this.request(activeKey);
    }
    getCurrentOrg = () => this.metaAction.context.get('currentOrg') || {}


    changeCondition = async (activeKey, e) => {
        let value = e.target.value || '';
        value = value.trim();
        this.metaAction.sf(`data.table.${activeKey}.filter.simpleCondition`, value);
        // this.request(activeKey, null, value);
    }
    refresh = (activeKey) => {
        this.request(activeKey)
    }
    request = async (activeKey, page = null, simpleCondition = null) => {
        activeKey = Number(activeKey);
        let loading = this.metaAction.gf(`data.table.${activeKey}.loading`);
        if (loading) return;

        if (!simpleCondition) {
            simpleCondition = this.metaAction.gf(`data.table.${activeKey}.filter.simpleCondition`);
        }

        if (!page) {
            const { currentPage, pageSize } = this.metaAction.gf(`data.table.${activeKey}.page`).toJS();
            page = {
                currentPage,
                pageSize
            }
        }
        const linkConfig = this.metaAction.context.get('linkConfig');
        const baseUrl = `${document.location.protocol}//${linkConfig.foreseeClientHost}`;
        const softAppName = linkConfig.appName;
        const options = {
            headers: {
                token: this.getOrgId()
            }
        };
        const periodDate = this.metaAction.context.get("currentOrg").periodDate
        const newPeriodDate = periodDate.slice(0, 4)
        const newOptions = { 'year': newPeriodDate }

        let params = {
            page,
            entity: {
                fuzzyCondition: simpleCondition || '',
                isEnable: 1
            }
        }

        this.metaAction.sf(`data.table.${activeKey}.loading`, true);
        let activeName;

        switch (activeKey) {
            case 0:
                activeName = 'supplier';

                break;
            case 1:
                activeName = 'consumer';

                break;
            case 2:
                activeName = 'inventory';

                break;
            case 3:
                activeName = 'department';

                break;
            case 4:
                activeName = 'person';

                break;
            case 5:
                activeName = 'item';

                break;
            default:
                activeName = 'supplier';

        }
        let newList = await this.webapi[`${activeName}QueryMappingList`](params);
        let { list } = newList;
        const doc = await this.webapi.common(`${baseUrl}/common/${activeName}/query`, {}, options);
        let account;
        if (activeKey <= 2) {
            account = await this.webapi.common(`${baseUrl}/common/account/query`, newOptions, options);
        }
        this.metaAction.sf(`data.table.${activeKey}.loading`, false);

        if (doc && doc.error) {
            this.metaAction.toast('error', `${doc.error.message}`)
        } else if (doc && doc.result) {
            doc.value.forEach(
                (o) => {
                    o.name = o.code + " " + o.name
                }
            )
        } else {
            this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
        }
        if (activeKey <= 2) {
            if (account && account.error) {
                this.metaAction.toast('error', `${account.error.message}`)
            } else if (account && account.result) {
                account.value.forEach(
                    (o) => {
                        o.names = o.name
                        o.name = o.code + " " + o.name
                    }
                )
            } else {
                this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
            }
        }

        list.forEach((item) => {
            if (!doc.value.find(q => q.code == item.mappingCode)) {
                item.mappingCode = null;
            }
            if (activeKey <= 1 && !account.value.find(q => q.code == item.accountCode)) {
                item.accountCode = null;
            }

        });
        // console.log(list, 'list')
        if (activeKey == 2) {
            // console.log(doc, 'doc')
            list = list.map(item => {
                const obj = doc.value.find((o) => o.code == item.mappingCode)
                if (obj) item.unit = obj.unit
                return item
            })
        }

        let arr = {
            [`data.table.${activeKey}.list`]: fromJS(list),
            [`data.table.${activeKey}.page`]: fromJS(newList.page),
            [`data.other.${activeName}`]: fromJS(doc.value)
        };
        if (activeKey <= 2) {
            arr['data.other.account'] = fromJS(account.value)
        }
        this.metaAction.sfs(arr);
        this.metaAction.sf(`data.table.${activeKey}.tableKey`, Math.floor(Math.random() * 1000));
    }

    //分页修改
    pageChanged = async (currentPage, pageSize, activeKey) => {
        activeKey = Number(activeKey);
        let page = this.metaAction.gf(`data.table.${activeKey}.page`).toJS()
        page.currentPage = currentPage;
        if (pageSize) {
            page.pageSize = pageSize;
        }
        this.request(activeKey, {
            currentPage: page.currentPage,
            pageSize: page.pageSize
        });
    }

    onFieldChange = async (value, index, name, activeKey) => {
        const { archiveCode = null, accountCode = null, mappingCode = null, archiveId = null, mappingName = null, rate = null } = this.metaAction.gf(`data.table.${activeKey}.list.${index}`).toJS()
        let params = {
            // archiveCode,
            archiveId,
            mappingCode,
        }
        if (activeKey <= 1) {
            params = {
                ...params,
                accountCode,
                archiveCode,
            }
        }

        if (activeKey == 2) {
            params = {
                ...params,
                accountCode,
                mappingName,
                rate,
            }
        }

        if (name == 'account') {
            params['accountCode'] = value;
            // let newName = activeKey === 0 ? 'supplierSetMapping' : 'consumerSetMapping';
            let newName = ''
            switch (activeKey) {
                case 0: newName = 'supplierSetMapping'; break;
                case 1: newName = 'consumerSetMapping'; break;
                case 2: newName = 'inventorySetMapping'; break;
            }
            const setMappingRes = await this.webapi[newName]([params]);
            this.metaAction.toast('success', '保存成功')
            this.metaAction.sf(`data.table.${activeKey}.list.${index}.accountCode`, value);
        } else {
            params['mappingCode'] = value;

            const setMappingRes = await this.webapi[`${name}SetMapping`]([params]);
            this.metaAction.toast('success', '保存成功');

            // this.metaAction.sf(`data.table.${activeKey}.list.${index}.mappingCode`, value);

            if (activeKey == 2) {
                const inventory = this.metaAction.gf('data.other.inventory').toJS()
                const inventoryItem = inventory.find(o => o.code == value)
                // console.log(inventory, unit, '****************')
                this.metaAction.sfs({
                    [`data.table.${activeKey}.list.${index}.mappingCode`]: value,
                    [`data.table.${activeKey}.list.${index}.unit`]: inventoryItem ? (inventoryItem.unit ? inventoryItem.unit : {}) : {}
                })
            } else {
                this.metaAction.sf(`data.table.${activeKey}.list.${index}.mappingCode`, value);
            }
        }
    }

    filterOption = (input, option) => {
        return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }

    filterOptionArchives = (inputValue, option) => {
        inputValue = inputValue.replace(/\\/g, "\\\\")
        if (!option || !option.props || !option.props.children) {
            return false
        }

        let account = this.metaAction.gf('data.other.account')

        let value
        if (option.props.value) {
            value = option.props.value
        } else if (option.props.children) {
            value = option.props.children
        }

        let paramsValue = account.find(item => item.get('code') == option.props.value)
        if (!paramsValue) {
            return false
        }
        let regExp = new RegExp(inputValue, 'i')
        if (paramsValue.get('shorthand')) {
            return paramsValue.get('name').search(regExp) != -1
                || paramsValue.get('shorthand').search(regExp) != -1
        }
        return paramsValue.get('name').search(regExp) != -1
    }

    //新增供应商
    addDoc = async (index, doc, docName, activeKey, caption) => {
        const linkConfig = this.metaAction.context.get('linkConfig');
        const baseUrl = `${document.location.protocol}//${linkConfig.foreseeClientHost}`;
        const softAppName = linkConfig.appName;

        // console.log( docName, '*************')
        let {
            supplierCodeRule,
            supplierStarCode,
            customerCodeRule,
            customerStarCode,
            inventoryCodeRule,
            inventoryStarCode
        } = this.metaAction.gf('data.other.ruleDto').toJS()

        let starCode = null, codeRule = null
        switch (docName) {
            case 'supplier':
                // if (supplierCodeRule === 1) {
                //     starCode = formatStarCode(supplierStarCode);//
                // };
                starCode = supplierStarCode;
                codeRule = supplierCodeRule;
                break;
            case 'consumer':
                // if (customerCodeRule === 1) {
                //     starCode = formatStarCode(customerStarCode);//
                // };
                starCode = customerStarCode;
                codeRule = customerCodeRule;
                break;
            case 'inventory':
                // if (inventoryCodeRule === 1) {
                //     starCode = formatStarCode(inventoryStarCode);//
                // };
                starCode = inventoryStarCode;
                codeRule = inventoryCodeRule;
                break;
            default:
            case 'supplier':
                // if (supplierCodeRule === 1) {
                //     starCode = formatStarCode(supplierStarCode);//
                // };
                starCode = supplierStarCode;
                codeRule = supplierCodeRule;
        }

        const ret = await this.metaAction.modal('show', {
            title: `新增${caption}`,
            width: 400,
            children: this.metaAction.loadApp(
                `ttk-tplus-${docName}-card`, {
                    store: this.component.props.store,
                    baseUrl,
                    [docName]: doc,
                    softAppName,
                    options: {
                        headers: {
                            token: this.getOrgId()
                        }
                    },
                    // starCode: codeRule === 1 ? starCode : ''
                }
            )
        })

        if (ret.result) {
            // if (codeRule === 1 && activeKey <= 2) {
            //     starCode = formatStarCode(ret.result.code);
            //     this.metaAction.sf(`data.other.ruleDto.${starCode}`, starCode);
            //     await this.webapi.tplus.updateStarCode({ starCode })
            // }
            ret.value.names = ret.value.name
            ret.value.name = ret.value.code + " " + ret.value.name;
            doc.push(ret.value)
            this.metaAction.sf(`data.other.${docName}`, fromJS(doc));
            let { archiveId = null, accountCode = null } = this.metaAction.gf(`data.table.${activeKey}.list.${index}`).toJS();
            let params = {
                archiveId,
                mappingCode: ret.value.code
            }
            if (activeKey <= 1) {
                params = {
                    ...params,
                    accountCode
                }
            }
            // console.log(ret.value, params)
            const setMapping = await this.webapi[`${docName}SetMapping`]([params]);
            let sfsObj = {}
            if (activeKey == 2) {
                sfsObj[`data.table.${activeKey}.list.${index}.unit`] = ret.value.unit ? ret.value.unit : {}
            }
            // this.metaAction.sf(`data.table.${activeKey}.list.${index}.mappingCode`, ret.value.code);
            sfsObj[`data.table.${activeKey}.list.${index}.mappingCode`] = ret.value.code
            this.metaAction.sfs(sfsObj)
        }
    }

    //渲染列
    getColumns = (activeKey) => {
        activeKey = Number(activeKey);
        const linkConfig = this.metaAction.context.get('linkConfig');
        const softAppName = linkConfig.appName;
        const columnDto = [
            [
                { "id": 1, "fieldName": "archiveCode", "caption": "编号", "width": 100, },
                { "id": 2, "fieldName": "archiveName", "caption": "供应商名称", "width": 100, },
                { "id": 3, "fieldName": "mappingCode", "caption": `${softAppName}供应商`, "width": 140, },
                { "id": 4, "fieldName": "accountCode", "caption": '应付科目', "width": 140, },
            ],
            [
                { "id": 1, "fieldName": "archiveCode", "caption": "编号", "width": 100, },
                { "id": 2, "fieldName": "archiveName", "caption": "客户名称", "width": 100, },
                { "id": 3, "fieldName": "mappingCode", "caption": `${softAppName}客户`, "width": 140, },
                { "id": 4, "fieldName": "accountCode", "caption": '应收科目', "width": 140, },
            ],
            [
                { "id": 1, "fieldName": "archiveCode", "caption": "编码", "width": 60, },
                { "id": 2, "fieldName": "archiveName", "caption": "存货名称", "width": 110, },
                { "id": 3, "fieldName": "mappingCode", "caption": `${softAppName}存货`, "width": 180, },
                { "id": 4, "fieldName": "unit", "caption": `计量单位`, "width": 50, },
                { "id": 5, "fieldName": "rate", "caption": `转换关系(发票单位：核算单位)`, "width": 140, },
                { "id": 6, "fieldName": "accountCode", "caption": `存货科目`, "width": 180, },
            ],
            [
                { "id": 1, "fieldName": "archiveCode", "caption": "编号", "width": 100, },
                { "id": 2, "fieldName": "archiveName", "caption": "部门名称", "width": 100, },
                { "id": 3, "fieldName": "mappingCode", "caption": `${softAppName}部门`, "width": 140, },
            ],
            [
                { "id": 1, "fieldName": "archiveCode", "caption": "编号", "width": 100, },
                { "id": 2, "fieldName": "archiveName", "caption": "人员名称", "width": 100, },
                { "id": 3, "fieldName": "mappingCode", "caption": `${softAppName}人员`, "width": 140, },
            ], [
                { "id": 1, "fieldName": "archiveCode", "caption": "编号", "width": 100, },
                { "id": 2, "fieldName": "archiveName", "caption": "项目名称", "width": 100, },
                { "id": 3, "fieldName": "mappingCode", "caption": `${softAppName}项目`, "width": 140, },
            ]
        ]
        // this.metaAction.sfs({
        //     'data.table.0.columnDto': fromJS(columnDto[0]),
        //     'data.table.1.columnDto': fromJS(columnDto[1]),
        //     'data.table.2.columnDto': fromJS(columnDto[2]),
        //     'data.table.3.columnDto': fromJS(columnDto[3]),
        //     'data.table.4.columnDto': fromJS(columnDto[4]),
        //     'data.table.5.columnDto': fromJS(columnDto[5]),
        // })
        let columns = columnDto[activeKey],
            list = this.metaAction.gf(`data.table.${activeKey}.list`).toJS(),
            other = this.metaAction.gf('data.other').toJS()
        return renderColumns(columns, list, other, this, activeKey)
    }

    getName = (name, activeKey) => {
        return `${name}-${activeKey}`
    }

    selectRow = (rowIndex, activeKey) => (e) => {
        console.log(rowIndex, activeKey, e, '--------')
        let single = this.metaAction.gf(`data.table.${activeKey}.list`).toJS()[rowIndex]
        if (e.target.checked) {
            checkList.push(single)
        } else {
            for (var i = 0; i < checkList.length; i++) {
                if (checkList[i].archiveId == single.archiveId) {
                    checkList.splice(i, 1);
                }
            }
        }
        this.injections.reduce('selectRow', rowIndex, `data.table.${activeKey}.list`, e.target.checked)
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

    handleBatch = async (activeKey) => {
        activeKey = Number(activeKey);
        let docName, doc, tipName;
        switch (activeKey) {
            case 0:
                docName = 'dataGridSupplier';
                doc = 'supplier';
                tipName = '供应商';
                break;
            case 1:
                docName = 'dataGridCustomer';
                doc = 'consumer';
                tipName = '客户';
                break;
            case 2:
                docName = 'dataGridInventory';
                doc = 'inventory';
                tipName = '存货';
                break;
            default:
                docName = 'dataGridSupplier';
                doc = 'supplier';
                tipName = '供应商';
        }
        let selectedArr = this.extendAction.gridAction.getSelected(docName);
        if (selectedArr.length === 0) {
            this.metaAction.toast('error', '请选择数据');
            return;
        }

        let selectObj = this.option[docName]
        let selectList = this.metaAction.gf(`${selectObj.path}`).toJS().filter(o => o.selected)

        let flag = true;
        doc = this.metaAction.gf(`data.other.${doc}`).toJS()
        selectList.forEach(o => {
            let isMapCode = doc.find(p => p.code == o.mappingCode);
            if (isMapCode) {
                flag = false;
            }
        })

        if (flag) {
            this.metaAction.toast('error', `请先修改${tipName}档案`)
            return;
        }

        const linkConfig = this.metaAction.context.get('linkConfig');
        const baseUrl = `${document.location.protocol}//${linkConfig.foreseeClientHost}`;

        if (activeKey == 0 || activeKey == 1) {
            const ret = await this.metaAction.modal('show', {
                title: '批量生成往来科目',
                width: 450,
                children: this.metaAction.loadApp(
                    'ttk-tplus-batch-get-current-account', {
                        store: this.component.props.store,
                        baseUrl: baseUrl,
                    }
                )
            })

            if (ret) {
                this.handleBatchCreateAccount(ret, docName, activeKey, baseUrl)
            }
        } else if (activeKey == 2) {
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
                this.handleBatchCreateAccount(ret, docName, activeKey, baseUrl, 'inventory')
            }
        }
    }

    handleAccountCode = (rowData, activeKey, successList) => {
        let valueList = [], doc
        switch (activeKey) {
            case 0: valueList = this.metaAction.gf('data.other.supplier').toJS(); doc = 'supplier'; break;
            case 1: valueList = this.metaAction.gf('data.other.consumer').toJS(); doc = 'consumer'; break;
            case 2: valueList = this.metaAction.gf('data.other.inventory').toJS(); doc = 'inventory'; break;
            default: valueList = this.metaAction.gf('data.other.inventory').toJS(); doc = 'supplier';
        }
        const isAux = this.metaAction.gf('data.other.isAux').toJS()

        let accountCode = null
        if (isAux[doc]) {
            rowData = valueList.find(o => o.code == rowData.mappingCode)

            successList.forEach(obj => {
                if (rowData.name.split(' ')[1] == obj.name) {
                    accountCode = obj.code
                }
            })
        } else {
            let name = activeKey == 2 ? rowData.inventoryName : rowData.archiveName

            successList.forEach(obj => {
                if (name == obj.name) {
                    accountCode = obj.code
                }
            })
        }

        return accountCode
    }

    handleCreateUpdate = async (activeKey, selectList, baseUrl) => {
        // console.log(selectList, 'selectList 3333')
        this.metaAction.sf(`data.table.${activeKey}.loading`, true)
        let year = moment(this.metaAction.context.get('currentOrg').periodDate).format('YYYY');
        const options = {
            headers: {
                token: this.getOrgId()
            }
        };

        let newName = 'supplierSetMapping'
        switch (activeKey) {
            case 0: newName = 'supplierSetMapping'; break;
            case 1: newName = 'consumerSetMapping'; break;
            case 2: newName = 'inventorySetMapping'; break;
            default: newName = 'supplierSetMapping';
        }
        const setMappingRes = await this.webapi[newName](selectList);
        const inventoryNew = await this.webapi.common(`${baseUrl}/common/account/query`, { 'year': year }, options)

        let list = this.metaAction.gf(`data.table.${activeKey}.list`).toJS()
        list = list.map(item => {
            selectList.forEach(obj => {
                if (item.archiveId == obj.archiveId) {
                    item.accountCode = obj.accountCode
                }
            })
            return item
        })

        let sfsObj = {}

        // this.metaAction.sf(`data.table.${activeKey}.list`, fromJS(list))
        this.handlefilterDoc(list, {
            account: inventoryNew.value
        });
        sfsObj[`data.table.${activeKey}.list`] = fromJS(list)

        if (inventoryNew && inventoryNew.result) {
            let account = this.metaAction.gf('data.other.account').toJS()
            account = inventoryNew.value
            account.forEach(
                (o) => {
                    o.names = o.name
                    o.name = o.code + " " + o.name
                }
            )

            // this.metaAction.sf('data.other.account', fromJS(account))
            sfsObj[`data.other.account`] = fromJS(account)

        }
        this.metaAction.toast('success', '保存成功')
        sfsObj[`data.table.${activeKey}.loading`] = false
        this.metaAction.sfs(sfsObj)
    }

    handleBatchCreateAccount = async (ret, docName, activeKey, baseUrl, type) => {
        let { code, name, isCalcQuantity, accountName } = ret

        let selectObj = this.option[docName]
        let selectList = this.metaAction.gf(`${selectObj.path}`).toJS().filter(o => o.selected);
        let year = moment(this.metaAction.context.get('currentOrg').periodDate).format('YYYY');

        let valueList = [], doc;
        switch (activeKey) {
            case 0: valueList = this.metaAction.gf('data.other.supplier').toJS(); doc = 'supplier'; break;
            case 1: valueList = this.metaAction.gf('data.other.consumer').toJS(); doc = 'consumer'; break;
            case 2: valueList = this.metaAction.gf('data.other.inventory').toJS(); doc = 'inventory'; break;
            default: valueList = this.metaAction.gf('data.other.supplier').toJS(); doc = 'supplier';
        }

        let accountList = this.metaAction.gf('data.other.account').toJS() || []
        const isAux = this.metaAction.gf('data.other.isAux').toJS()
        let parmasList = [], needUpdateList = [], needAddList = []

        selectList = selectList.map(item => {
            let endClassAccount = [], isMapName = null

            endClassAccount = accountList.filter((a) => {
                return new RegExp(`^${code}`).test(a.code)
            });

            let inventoryRow = {}
            if (isAux[doc]) {
                inventoryRow = valueList.find(o => o.code == item.mappingCode)
                if (inventoryRow) {
                    isMapName = endClassAccount.find(o => o.names == inventoryRow.name.split(' ')[1])
                }
            } else {
                isMapName = endClassAccount.find(o => o.names == item.archiveName)
            }

            if (isMapName) {
                const isMapCode = endClassAccount.find(o => o.code == item.accountCode)
                if (!isMapCode) {
                    item.accountCode = isMapName.code
                    needUpdateList.push(item)
                } else {
                    const name = isAux[doc] ? inventoryRow.name.split(' ')[1] : (activeKey == 2 ? item.inventoryName : item.archiveName)
                    // if (isMapCode.names != inventoryRow.name.split(' ')[1]) {
                    if (isMapCode.names != name) {
                        item.accountCode = isMapName.code
                        needUpdateList.push(item)
                    }
                }
            }
            if (!isMapName) {
                const name = isAux[doc] ? inventoryRow.name.split(' ')[1] : (activeKey == 2 ? item.inventoryName : item.archiveName)
                const params = {
                    parentCode: code,
                    name: name,
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


            // const inventoryRow = valueList.find(o => o.code == item.mappingCode)

            // if (inventoryRow) {
            //     endClassAccount = accountList.filter((a) => {
            //         return new RegExp(`^${code}`).test(a.code)
            //     });
            //     isMapName = endClassAccount.find(o=> o.names == inventoryRow.name.split(' ')[1])
            //     if (isMapName) {
            //         const isMapCode = endClassAccount.find(o=> o.code == item.accountCode)
            //         if (!isMapCode) {
            //             item.accountCode = isMapName.code
            //             needUpdateList.push(item)
            //         } else {
            //             if (isMapCode.names != inventoryRow.name.split(' ')[1]) {
            //                 item.accountCode = isMapName.code
            //                 needUpdateList.push(item)
            //             } 
            //         }
            //     }
            //     if (!isMapName) {
            //         const params = {
            //             parentCode: code,
            //             name: inventoryRow.name.split(' ')[1],
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

        const options = {
            headers: {
                token: this.getOrgId()
            }
        };

        // console.log(needUpdateList,parmasList,needAddList, selectList, 'ssssssssss')
        if (parmasList.length) {
            const res = await this.webapi.common(`${baseUrl}/common/account/createBatch`, parmasList, options);
            if (res.error && res.error.message) {
                this.metaAction.toast('error', res.error.message)
                if (needUpdateList.length) {
                    this.handleCreateUpdate(activeKey, needUpdateList, baseUrl)
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
                                accountCode: this.handleAccountCode(item, activeKey, response.successItems),
                                rate: item.rate,
                                revenueType: item.revenueType
                            }
                            return obj
                        })
                        if (needUpdateList.length) needAddListUpdate = needAddListUpdate.concat(needUpdateList)
                        this.handleCreateUpdate(activeKey, needAddListUpdate, baseUrl)
                    } else {
                        let needAddListUpdate = needAddList.map((item, index) => {
                            item.accountCode = this.handleAccountCode(item, activeKey, response.successItems)
                            return item
                        })
                        if (needUpdateList.length) needAddListUpdate = needAddListUpdate.concat(needUpdateList)
                        this.handleCreateUpdate(activeKey, needAddListUpdate, baseUrl)
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
                    if (needUpdateList.length) {
                        this.handleCreateUpdate(activeKey, needUpdateList, baseUrl)
                    }
                }

                if (!response.successItems && needUpdateList.length) {
                    this.handleCreateUpdate(activeKey, needUpdateList, baseUrl)
                }
            } else {
                this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
            }
        } else {
            if (needUpdateList.length) {
                this.handleCreateUpdate(activeKey, needUpdateList, baseUrl)
            } else {
                this.metaAction.toast('success', '保存成功')
            }
        }
    }

    //新增科目
    addAccount = async (rowIndex, doc, docName, activeKey, caption) => {
        // console.log(rowIndex, doc, docName, activeKey, caption, '11111111111111')

        const linkConfig = this.metaAction.context.get('linkConfig');
        const baseUrl = `${document.location.protocol}//${linkConfig.foreseeClientHost}`;
        const softAppName = linkConfig.appName;

        let year = moment(this.metaAction.context.get('currentOrg').periodDate).format('YYYY');
        let inventory = this.metaAction.gf('data.other.account').toJS()
        // console.log(inventory, 'inventory')
        const ret = await this.metaAction.modal('show', {
            title: '新增科目',
            width: 400,
            children: this.metaAction.loadApp(
                'ttk-tplus-account-card', {
                    store: this.component.props.store,
                    baseUrl,
                    softAppName,
                    inventory,
                    isDangan: true
                }
            )
        })

        // console.log(ret, 'ret')

        if (ret) {
            const list = this.metaAction.gf(`data.table.${activeKey}.list`).toJS()
            const addObj = ret[0]
            let rowData = list[rowIndex]
            rowData = {
                ...rowData,
                accountCode: addObj.code
            }

            // this.handleCreateUpdate(activeKey, [rowData], baseUrl)

            let newName = 'supplierSetMapping'
            switch (activeKey) {
                case 0: newName = 'supplierSetMapping'; break;
                case 1: newName = 'consumerSetMapping'; break;
                case 2: newName = 'inventorySetMapping'; break;
                default: newName = 'supplierSetMapping';
            }

            const options = {
                headers: {
                    token: this.getOrgId()
                }
            };

            let res = await Promise.all([
                this.webapi[newName]([rowData]),
                this.webapi.common(`${baseUrl}/common/account/query`, { 'year': year }, options)
            ])

            if (res[0] === null) {
                this.metaAction.sf(`data.table.${activeKey}.list.${rowIndex}.accountCode`, addObj.code)
                this.metaAction.toast('success', '保存成功');
            } else {
                this.metaAction.toast('error', `${res[0].error.message}`);
            }

            if (res[1] && res[1].result) {
                let account = res[1].value
                account.forEach(
                    (o) => {
                        o.names = o.name
                        o.name = o.code + " " + o.name
                    }
                )
                this.metaAction.sf('data.other.account', fromJS(account))
            }

        }
    }

    handleChangeRate = async (value, index) => {
        // console.log(value, index)
        let newName = 'supplierSetMapping', activeKey = this.metaAction.gf('data.other.activeKey');
        const { archiveCode = null, accountCode = null, mappingCode = null, archiveId = null, mappingName = null, rate = null } = this.metaAction.gf(`data.table.${activeKey}.list.${index}`).toJS()
        // console.log(activeKey, 'activeKey')
        switch (activeKey) {
            case '0': newName = 'supplierSetMapping'; break;
            case '1': newName = 'consumerSetMapping'; break;
            case '2': newName = 'inventorySetMapping'; break;
        }
        let params = {
            archiveCode,
            accountCode,
            archiveId,
            mappingCode,
            mappingName,
            rate: Number(value)
        }
        const setMappingRes = await this.webapi[newName]([params]);
        this.metaAction.toast('success', '保存成功')
        this.metaAction.sf(`data.table.${activeKey}.list.${index}.rate`, value);
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