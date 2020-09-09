function initColumn(column, _this) {
    let resColumns = []
    column.map((item, index) => {
        item.render = _this.getOtherContent
        // if(index==0){
        //     item.render = _this.getHeaderContent
        // }else{
        //     item.render = _this.getOtherContent
        // }
        
        resColumns.push(item)
    })
    return resColumns
}

export default function renderColumns(tableList, _this) {
    let columns = [
        { fieldName: '1', title: '9月申报概要', dataIndex: '1', key: '1'},
        { fieldName: '2', title: '9月申报概要', dataIndex: '2', key: '2'},
        { fieldName: '3', title: '9月申报概要', dataIndex: '3', key: '3'},
    ]
    if (tableList) return initColumn(columns, _this)
}
