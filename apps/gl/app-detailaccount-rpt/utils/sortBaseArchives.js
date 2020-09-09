export default function sortBaseArchives(data){
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
        if( constant[key]  ==  true ) {
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