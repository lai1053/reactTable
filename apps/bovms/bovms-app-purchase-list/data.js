export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'bovms-app-purchase-list',
        children: '{{$renderChildren()}}',
    }
}

export function getInitState() {
    return {
        data: {
            loading: false,
            accountInfo: {
                vatTaxpayer: null,
                yearPeriod: null,
                stock: null,
                sobCheck: null,
            },
            tableAllList: [],
            tableData: {
                tableSource: [],
                selectedRowKeys: [],
                sortOptin: {},
                editingKey: '',
                isStock: null, //会计期间是否启用存货，1启用，0未启用，2关闭
                tableSettingData: [],
                isCheckDisabled: false,
            },
            filterData: {
                yearPeriod: undefined,
                custName: undefined,
                invKindCode: 'null',
                rzzt: 'null',
                goodsName: undefined,
                minAmount: undefined,
                maxAmount: undefined,
                vchStateCode: 'null',
                accountMatchState: 'null',
                kprq:[],
                endData:undefined,
                startData:undefined
            },
            defaultTableData: {
                tableSource: [],
                selectedRowKeys: [],
                sortOptin: {
                    rzzt_for_sort: null, //认证状态
                    inv_no: null, //发票号码
                    inv_kind_code_for_sort: null, //发票类型
                    vch_num: null, //凭证号
                },
                editingKey: '',
                module: 'purchase',
            },
            defaultFilterData: {
                yearPeriod: undefined,
                custName: undefined,
                invKindCode: null,
                rzzt: null,
                goodsName: undefined,
                minAmount: undefined,
                maxAmount: undefined,
                vchStateCode: null,
                accountMatchState: null,
            },
            pagination: {
                currentPage: 1, //-- 当前页
                pageSize: 50, //-- 页大小
                totalCount: 0,
                totalPage: 0
            },
            totalData: {
                totalFpNum: 0,
            },
        }
    }
}