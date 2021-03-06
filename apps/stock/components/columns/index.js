import React from 'react'
import { DataGrid, Dropdown, Checkbox, Menu, Icon, Radio } from 'edf-component'
const ColumnGroup = DataGrid.ColumnGroup,
      Column = DataGrid.Column,
      Cell = DataGrid.Cell
const computeProps = (props) => {
    let {
        dataSource,
        dataIndex,
        title,
        render,
        detailListName,
        columnType,
        onMenuClick,
        onSelectChange,
        selectedRowKeys,
        getCheckboxProps,
    } = props
    if (!Array.isArray(dataSource))
        dataSource = []
    if (!Array.isArray(selectedRowKeys))
        selectedRowKeys = []
    if (!(title && title.type && title.type.name)) {
        // console.log(title, 'title')
        title = <Cell key={props.key} name="header">{title || ''}</Cell>
    }
        
    if (!detailListName)
        detailListName = 'detailList'
    switch (columnType) {
        case 'check':
            const allcheck = dataSource.every(o => selectedRowKeys.some(s => s === o[dataIndex]));
            title = (
                <Cell>
                    <Checkbox
                        indeterminate= {!allcheck && selectedRowKeys.length>0}
                        checked={allcheck} 
                        onChange={e=>{
                            if(e.target.checked){
                                selectedRowKeys=dataSource.map(m=>m[dataIndex]);
                            }else{
                                selectedRowKeys=[];
                            }
                            onSelectChange && onSelectChange(selectedRowKeys);
                        }}
                    ></Checkbox>
                </Cell>
            )
            render = (text, record, index) => (
                <Checkbox 
                    disabled={getCheckboxProps && getCheckboxProps(text,record,index)}
                    checked={(selectedRowKeys).some(s=>s===Number(text))} 
                    onChange={e=>{
                        if(e.target.checked){
                            selectedRowKeys.push(Number(text))
                        }else{
                            selectedRowKeys=selectedRowKeys.filter(f=>f!==Number(text))
                        }
                        onSelectChange && onSelectChange(selectedRowKeys)
                    }}
                ></Checkbox>
            )
            break;
        case 'allcheck':
            const moreMenu = (
                <Menu onClick={onMenuClick}>
                    <Menu.Item key="selectPage">选择本页</Menu.Item>
                    <Menu.Item key="selectAll">选择全部</Menu.Item>
                    <Menu.Item key="cancelSelect">取消选择</Menu.Item>
                </Menu>
            )
            title = <Cell>
                        <Dropdown overlay={moreMenu}>
                            <a>选择 <Icon type="down" /></a>
                        </Dropdown>
                    </Cell>
            render = (text, record, index) => (
                <Checkbox 
                    disabled={getCheckboxProps && getCheckboxProps(text,record,index)}
                    checked={selectedRowKeys.some(s=>s===Number(text))} 
                    onChange={e=>{
                        if(e.target.checked){
                            selectedRowKeys.push(Number(text))
                        }else{
                            selectedRowKeys=selectedRowKeys.filter(f=>f!==Number(text))
                        }
                        onSelectChange && onSelectChange(selectedRowKeys)
                    }}
                ></Checkbox>
            )
            break;
        case 'radio':
            title = <Cell>选择</Cell>
            render = (text, record, index) => (
                <Radio 
                    disabled={getCheckboxProps && getCheckboxProps(text,record,index)}
                    checked={selectedRowKeys.some(s=>s===Number(text))} 
                    onChange={e=>{
                        if (e.target.checked) {
                            selectedRowKeys[Number(text)]
                        } else {
                            selectedRowKeys=[]
                        }
                        onSelectChange && onSelectChange(selectedRowKeys)
                    }}
                ></Radio>
            )
            break;
    }
    return {
        ...props,
        dataSource,
        selectedRowKeys,
        header: title,
        renderCell: render,
        detailListName,
    }
}
/*
    dataSource, //表格数据源，必传
    dataIndex, //列字段名，必传
    title, //列头，选传
    render, //单元格渲染方法。选传时，值为：单元格文本
    width, //列宽，选传
    fixed, //列固定，选传。'left'：左侧固定，'right'：右侧固定
    align, //列对齐，选传。默认值：'center'；可传：'left','center','right'
    className, //单元格样式，选传。默认值：''
    flexGrow, //列自适应，选传。默认值：0
    lineHeight, //单元格行高，选传，默认值：37
    isResizable, //列是否允许改变大小，选传，默认值：false
    detailListName, //数据行中 明细行的key，选填
    columnType, //列类型，选填。可传：'check','allcheck','radio'
    onMenuClick, //列类型为allcheck时，菜单选择事件，选填
    onSelectChange, //列类型为'check','allcheck','radio'时，列选择事件，选填,可传入selectedRowKeys
    selectedRowKeys, //指定选中项的 key 数组
    getCheckboxProps, //选择框的默认属性配置
 */
/**
 * [renderDataGridCol DataGrid Column render]
 * @Author   weiyang.qiu
 * @DateTime 2019-11-20T09:40:22+0800
 * @param    {object}                 props col props
 * @return   {[type]}                        fixed-data-table-2 column
 */
export default function renderDataGridCol(props) {
    const {
        dataSource, //表格数据源，必传
        dataIndex, //列字段名，必传
        header, //列头，选传
        renderCell, //单元格渲染方法。选传时，值为：单元格文本
        width, //列宽，选传
        fixed, //列固定，选传。'left'：左侧固定，'right'：右侧固定
        align, //列对齐，选传。默认值：'center'；可传：'left','center','right'
        className, //单元格样式，选传。默认值：''
        flexGrow, //列自适应，选传。默认值：0
        lineHeight, //单元格行高，选传，默认值：37
        isResizable, //列是否允许改变大小，选传，默认值：false
        detailListName, //数据行中 明细行的key，选填
        children, //分组列，选填
    } = computeProps(props)
    // ColumnGroup 1.0.1 只有：align,fixed,header属性
    // antd table colum group 是通过children属性来配置
    if (children) {
        return (
            <ColumnGroup 
                fixed={fixed==='left'?true:false}
                fixedRight={fixed==='right'?true:false}
                header={header}
            >
               {
                 Array.isArray(children)?
                 children.map(child=>renderDataGridCol({...child}))
                 :renderDataGridCol({...children})
               } 
            </ColumnGroup>
        )
    }
    return (
        <Column
            key={dataIndex}
            columnKey={dataIndex}
            header={header}
            width={width || 100}
            // fixed={fixed==='left'?true:false}
            // fixedRight={fixed==='right'?true:false}
            // flexGrow={flexGrow || 0}
            align={align || 'center'}
            // isResizable={!!isResizable}
            cell={({rowIndex,...props}) => {
                const record=dataSource[rowIndex] || {[detailListName]:[]},
                    text=record[dataIndex],
                    rowDetailList=record[detailListName] || [{}],
                    lh=(lineHeight || 37) * (rowDetailList.length >= 4 ? 4 : rowDetailList.length);
                    // console.log(renderCell, 'uuuuuuu')
                return (
                    <Cell {...props}
                        className={className || ''}
                        // style={{lineHeight:lh+'px'}}
                        title={!renderCell && text || ''}>
                        {renderCell ? renderCell(text, record, rowIndex) : text || ''}
                    </Cell>
                )
            }}
        ></Column>
    )
}
/*
const groupColumns = [
    {
        fixed: 'left',
        title: '',
        children: [
            {
                title: 'Second Name',
                dataIndex: 'secondName',
                fixed: 'left',
                width: 100
            }
        ]
    }, 
    {
        fixed: 'left',
        title: 'Name',
        children: [
            {
                dataIndex: 'firstName',
                fixed: 'left',
                title: 'First Name',
                width: 150,
            }, 
            {
                dataIndex: 'lastName',
                fixed: 'left',
                title: 'Last Name',
                width: 150,
            }
        ]
    },
    {
        title: '',
        children: {
            title: 'Name3',
            dataIndex: 'name3',
            width: 100,
        }
    },
    {
        title: 'About',
        children: [
            {
                dataIndex: 'companyName',
                title: 'Company',
                width: 150,
                flexGrow: 1,
            }, 
            {
                dataIndex: 'sentence',
                title: 'Sentence',
                width: 150,
                flexGrow: 1,
            }
        ]
    }
]
*/