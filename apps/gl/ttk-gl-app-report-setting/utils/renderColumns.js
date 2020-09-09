import React from 'react';
import { Select } from 'edf-component';

function renderText (name, rowData, index, tableList, aboutAccount, accountList) {
    // console.log(name, rowData, index, tableList)
    let obj = null
    if (rowData) {
        if (!rowData.origName) {
            // if (name == 'origCode') {
            //     obj = {
            //         children: <span>合计</span>,
            //         props: {
            //             colSpan: 1
            //         }
            //     }
            // } else if (name == 'origName'){
            //     obj = {
            //         children: <div style={{display: 'flex', flexDirection: 'row'}} className='totalStyle'>
            //             <div>科目数：<span>{aboutAccount.origAccountCount || 0}</span></div>
            //             <div>已匹配数：<span>{aboutAccount.yesMappingCount || 0}</span></div>
            //             <div>未匹配数：<span>{aboutAccount.noMappingCount || 0}</span></div>
            //         </div>,
            //         props: {
            //             colSpan: 2
            //         }
            //     }
            // } else {
            //     obj = {
            //         children: <span></span>,
            //         props: {
            //             colSpan: 0
            //         }
            //     }
            // }
        } else {
            if (name == 'systemCodeAndName') {
                obj = {
                    children: <Select 
                    dropdownStyle={{ width: '259px' }}
                     
                    value={rowData.systemCode}>
                        {
                           accountList && accountList.map((item, index) => {
                                return <Select.Option key={item.code}>{item.codeBlankSpaceName}</Select.Option>
                           })
                        }
                    </Select>,
                    props: {
                        colSpan: 1
                    }
                }
            } else {
                obj = {
                    children: <div className='nameStyle' title={rowData[name]} 
                    style={name == 'origCode'? {textAlign: 'center'}: {}}>{rowData[name]}</div>,
                    props: {
                        colSpan: 1
                    }
                }
            }

        }
    }

    return obj
}

export default function renderColumns(tableList, aboutAccount, accountList) {

    let columnArray = [
        {fieldName: 'origCode', fieldTitle: '原科目编码'},
        {fieldName: 'origName', fieldTitle: '原科目名称'},
        {fieldName: 'systemCodeAndName', fieldTitle: '标准科目'}
    ]
    const columns = columnArray.map((item, index) => {
        return {
            name: item.fieldName,
            title: item.fieldTitle,
            dataIndex: item.fieldName,
            key: item.fieldName,
            width: item.fieldName == 'origCode' ? '80px': '259px',
            render:(_rowIndex, v, index)=>{ return renderText(item.fieldName, v, index, tableList, aboutAccount, accountList)}
        }
    })

    return columns
}