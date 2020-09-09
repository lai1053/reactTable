import React from 'react';
import { Table, Radio, Checkbox } from 'edf-component';

// 模块列
function renderText2(text, record, index, _this, list, jsbz, filedName) {
    let disabled = false
    // let disabled = jsbz == '003' ? true : (record.name == '首页' ? true : false)
    if(jsbz == '003' || record.name == '首页' || record.name == '岗位管理' || record.name == '岗位权限'){
        disabled = true
    }

    let rowChecked = record.isCheck
    if(jsbz == '003' && (record.name == '岗位管理' || record.name == '岗位权限')){
        rowChecked = true
    }else if(jsbz != '003' && (record.name == '岗位管理' || record.name == '岗位权限')){
        rowChecked = false
    }else if(jsbz != '003' && record.name == '首页'){
        rowChecked = true
    }else{
        rowChecked = record.isCheck
    }

    if (filedName === "content1") {
        //有子节点 需要合并行

        let rowSpan = calRowspan(list, record, index, 1);

        return {
            children: <div>
                <Checkbox
                    disabled={disabled}
                    checked={rowChecked}
                    // checked={jsbz != '003' && record.name == '首页' ? true : record.isCheck}
                    onChange={(e) => _this.handleCheckChange(e, record, index, filedName, 1)}>
                    {record.name}
                </Checkbox>
            </div>,
            props: {
                rowSpan
            }
        }
    } else if (filedName === "content2") {
        //第二列
        let rowSpan = calRowspan(list, record, index, 2);

        return {
            children: <div>
                {String(record.id).length > 3 ? <Checkbox
                    disabled={disabled}
                    checked={rowChecked}
                    // checked={jsbz != '003' && record.name == '首页' ? true : record.isCheck}
                    onChange={(e) => _this.handleCheckChange(e, record, index, filedName, 2)}>
                    {record.name}
                </Checkbox> : ''}
            </div>,
            props: {
                rowSpan
            }
        }
    } else if (filedName == "content3") {
        //第三列
        let rowSpan = calRowspan(list, record, index, 3);
        return {
            children: <div>
                {String(record.id).length > 5 ? <Checkbox
                    disabled={disabled}
                    checked={rowChecked}
                    // checked={jsbz != '003' && record.name == '首页' ? true : record.isCheck}
                    onChange={(e) => _this.handleCheckChange(e, record, index, filedName, 3)}>
                    {record.name}
                </Checkbox> : ''}
            </div>,
            props: {
                rowSpan
            }
        }
    } else {
        //操作列
        let rowSpan = calRowspan(list, record, index, 3);
        let disabled = jsbz == '003' ? true : record.name == '首页' ? true : false

        if (record.parentId == 0) {
            if (!record.isCheck) disabled = true //若父级取消勾选 则置灰
            const arr = list.filter(item => item.parentId == record.id)
            if (arr.length) {
                let obj = {
                    children: <span></span>,
                    props: {
                        //colSpan: 0,
                        rowSpan: 0
                    }
                }
                return obj
            }
        }

        let value = null
        if (record.parentId == 0) {
            if (record.isCheck) {
                value = record.isWrite
            } else {
                value = 100
            }
        } else {

            list.forEach(item => {
                if (item.parentId != record.id) {
                    if (record.isCheck) {
                        value = item.isWrite
                    } else {
                        value = 100
                    }
                }
            })

            if (list[index].id == record.id) {
                if (record.isCheck) {
                    value = list[index].isWrite
                } else {
                    value = 100
                }
            }
        }
        return {
            children: <div>
                <Radio.Group
                    value={jsbz != '003' && record.name == '首页' ? 200 : value}
                    onChange={(e) => _this.handleChange(e, record, index)}>
                    <Radio
                        value={200}
                        disabled={disabled || (value === null || !record.isCheck)}
                    >查看</Radio>
                    <Radio
                        value={300}
                        disabled={disabled || (value === null || !record.isCheck)}
                    >操作</Radio>
                </Radio.Group>
            </div>,
            props: {
                rowSpan
            }
        }
    }

}



function calRowspan(list, record, index, colIndex) {
    if (String(record.id).length < 3) {
        return 1
    }
    let rowSpan = 0;
    let list1 = list.filter(o => o.parentId === record.id);
    if (list1.length) {
        rowSpan++;
        list1.forEach(item => {
            let len = list.filter(o => o.parentId === item.id).length;
            if (len) {
                len++//有下级
            } else {
                len = 1
            }
            rowSpan += len;
        })
    } else {
        rowSpan = 1
    }
    
    if (String(record.id).length !== 8 && String(record.id).length > colIndex * 2 + 1) {
        //合并行
        rowSpan = 0
    }

    if (String(record.id).length === 8 && colIndex !== 3) {
        rowSpan = 0
    }

    if (String(record.id).length < colIndex * 2 + 1 && list1.length) {
        //过滤头部
        rowSpan = 0
    }

    return rowSpan;
}
export default function renderColumns(_this, columns, list, jsbz, activeKey) {
    const resArr = []
    columns.forEach(element => {
        if (!element.filedParentName) {
            let data = {
                'name': element.filedName,
                'title': element.filedTitle,
                'dataIndex': element.filedName,
                'key': element.filedName
            }

            if (element.filedName == 'permissions') {
                data.render = (text, record, index) => { return renderText2(text, record, index, _this, list, jsbz, element.filedName) }
            }
            resArr.push(data)
        }
    });

    resArr.forEach(item => {
        const arr = []
        columns.forEach(obj => {
            if (obj.filedParentName && obj.filedParentName == item.name) {
                let data = {
                    'name': obj.filedName,
                    'dataIndex': obj.filedName,
                    'key': obj.filedName,
                    'render': (text, record, index) => { return renderText2(text, record, index, _this, list, jsbz, obj.filedName) }
                }
                arr.push(data)
            }
        })
        if (arr && arr.length) item.children = arr
    })

    return resArr
}