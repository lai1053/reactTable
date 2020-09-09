export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-gl-app-auxiliary-setting', 
        children:[{
            name: 'spin',
            component: 'Spin', 
            tip: '数据处理中...',           
            spinning: '{{data.other.loading}}',
            children:[{
                name: 'content',
                component: '::div',
                className: 'ttk-gl-app-auxiliary-setting-content',               
                children: [{
                    name: 'tip',
                    component: '::div',
                    className: 'ttk-gl-app-auxiliary-setting-content-header',
                    children: '注：多核算项目的科目请按照原表的展示先后顺序进行选择'
                }, {
                    name: 'body',
                    component: '::div',
                    className: 'ttk-gl-app-auxiliary-setting-content-title',
                    children: '{{$getAccountContent()}}'
                }, {
                    name: 'assistform',
                    component: '::div',
                    children: '{{$renderAux()}}',                   
                    className: 'ttk-gl-app-auxiliary-setting-content-assistForm',
                }
                ]
            }]
        }] 
    }
}

export function getInitState() {
    return {
        data: {
            form: {
                title: '1001 库存现金',
                assistFormOption: []
            },
            other: {
                loading: false
            }
        }
    }
}

export function sortBaseArchives(data) {
    const sortData = ['客户', '供应商', '项目', '部门', '人员', '存货']
    const constant = {
        '供应商': 'supplierId',
        '存货': 'inventoryId',
        '客户': 'customerId',
        '部门': 'departmentId',
        '项目': 'projectId',
        '人员': 'personId',
        '自定义档案': true,
    }
    const arr = []
    sortData.forEach((key) => {
        if (data[key]) {
            const value = data[key]
            const arr2 = []
            value.forEach(item => {
                arr2.push({
                    label: item.name,
                    value: item.id
                })
            })
            let item = {
                name: key,
                key: constant[key],
                children: arr2
            }
            arr.push(item)
        }
    })
    for (const [key, value] of Object.entries(data)) {
        if (constant[key] == true) {
            const zidingyiArr = value
            for (const value of zidingyiArr.values()) {
                const childrenArr = []
                if (value.userDefineArchiveDataList) {
                    for (const item of value.userDefineArchiveDataList.values()) {
                        childrenArr.push({
                            label: item.name,
                            value: item.id
                        })
                    }
                }
                arr.push({
                    name: value.name,
                    key: value.calcName,
                    children: childrenArr
                })
            }
        }
    }
    return arr
}
