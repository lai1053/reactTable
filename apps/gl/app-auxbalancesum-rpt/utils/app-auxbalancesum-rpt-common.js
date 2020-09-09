function sortBaseArchives(data){
    const sortData = ['客户','供应商', '项目', '部门', '人员', '存货']
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
        if( data[key] ){
            const value = data[key]
            const arr2 = []
            value.forEach(item => {
                arr2.push({
                    label: item.name,
                    value: item.id,
                    helpCode: item.helpCode,
                    helpCodeFull: item.helpCodeFull,
                    code: item.code,
                    codeAndName: item.codeAndName,
                    name: item.name
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
    for( const [key, value] of Object.entries(data) ) {
        if( constant[key]  ==  true && value.length > 0) {
            const zidingyiArr = value
            for( const value of zidingyiArr.values() ){
                const childrenArr = []
                if( value.userDefineArchiveDataList ) {
                    for( const item of value.userDefineArchiveDataList.values() ) {
                        childrenArr.push({
                            label: item.name,
                            value: item.id,
                            helpCode: item.helpCode,
                            helpCodeFull: item.helpCodeFull,
                            code: item.code,
                            codeAndName: item.codeAndName,
                            name: item.name
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

function changeToOption(data, label = 'label', key = 'value') {
    return data.map(item => {
        return {
            label: item[label],
            value: item[key].toString()
        }
    })
} 


function sortSearchOption(data, mode, delKey) {
    if (mode) {
        for (const [key, value] of Object.entries(mode)) {
            let val = data[key]
            if (typeof value == 'string') {
                data[value] = val
            } else if (typeof value == 'object') {
                for (const [index, item] of Object.entries(value)) {
                    data[index] = item(val)
                }
            }
            delete data[key]
        }
    }
    if (delKey) {
        delKey.forEach(item => {
            try {
                delete data[item]
            } catch (err) {
                console.log(err)
            }
        })
    }
    return data
}

export { sortBaseArchives, changeToOption, sortSearchOption } 