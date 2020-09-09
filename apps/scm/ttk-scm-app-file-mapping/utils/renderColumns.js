import React from 'react'
import { DataGrid, Select, Button, Checkbox, Input} from 'edf-component'
const { Column, Cell, TextCell } = DataGrid;

export default function renderColumns(columns, list, other, _this, activeKey) {
    let { supplier = [], account = [], consumer = [], inventory = [], department = [], person = [], item = [] } = other;
    let cols = [

    ];
    activeKey = Number(activeKey);
    let doc, docName;
    switch (activeKey) {
        case 0:
            doc = supplier;
            docName = 'supplier';
            // cols.push(
            //     <Column name='select' columnKey='select' width={34}
            //         header={<Cell name='cb'>
            //             <Checkbox
            //                 checked={_this.extendAction.gridAction.isSelectAll("dataGridSupplier")}
            //                 onChange={_this.extendAction.gridAction.selectAll("dataGridSupplier")}
            //             />
            //         </Cell>}
            //         cell={(ps) => {
            //             return <Cell name='cell'>
            //                 <Checkbox
            //                     onChange={_this.selectRow(ps.rowIndex, activeKey)}
            //                     checked={list[ps.rowIndex].selected}
            //                 />
            //             </Cell>
            //         }}
            //     />);
            break;
        case 1:
            doc = consumer;
            docName = 'consumer';
            // cols.push(<Column name='select' columnKey='select' width={34}
            //     header={<Cell name='cb'>
            //         <Checkbox
            //             checked={_this.extendAction.gridAction.isSelectAll("dataGridCustomer")}
            //             onChange={_this.extendAction.gridAction.selectAll("dataGridCustomer")}
            //         />
            //     </Cell>}
            //     cell={(ps) => {
            //         return <Cell name='cell'>
            //             <Checkbox
            //                 onChange={_this.selectRow(ps.rowIndex, activeKey)}
            //                 checked={list[ps.rowIndex].selected}
            //             />
            //         </Cell>
            //     }}
            // />);
            break;
        case 2:
            doc = inventory;
            docName = 'inventory';
            // cols.push(<Column name='select' columnKey='select' width={34}
            //     header={<Cell name='cb'>
            //         <Checkbox
            //             checked={_this.extendAction.gridAction.isSelectAll("dataGridInventory")}
            //             onChange={_this.extendAction.gridAction.selectAll("dataGridInventory")}
            //         />
            //     </Cell>}
            //     cell={(ps) => {
            //         return <Cell name='cell'>
            //             <Checkbox
            //                 onChange={_this.selectRow(ps.rowIndex, activeKey)}
            //                 checked={list[ps.rowIndex].selected}
            //             />
            //         </Cell>
            //     }}
            // />);
            break;
        case 3:
            doc = department;
            docName = 'department';
            break;
        case 4:
            doc = person;
            docName = 'person';
            break;
        case 5:
            doc = item;
            docName = 'item';
            break;
        default:
            doc = supplier;
            docName = 'supplier';
            // cols.push(<Column name='select' columnKey='select' width={34}
            //     header={<Cell name='cb'>
            //         <Checkbox
            //             checked={_this.extendAction.gridAction.isSelectAll("dataGridSupplier")}
            //             onChange={_this.extendAction.gridAction.selectAll("dataGridSupplier")}
            //         />

            //     </Cell>}
            //     cell={(ps) => {
            //         return <Cell name='cell'>
            //             <Checkbox
            //                 onChange={_this.selectRow(ps.rowIndex, activeKey)}
            //                 checked={list[ps.rowIndex].selected}
            //             />
            //         </Cell>
            //     }}
            // />);
    }

    columns.forEach(op => {
        let col = <Column
        name={op.fieldName}
        columnKey={op.fieldName}
        isResizable={false}
        width={op.width}
        flexGrow={1}
        header={<Cell name='header'>{op.caption}</Cell>}
        cell={(ps) => {
            let cell;
            // console.log(list[ps.rowIndex].unitName, list[ps.rowIndex], op.fieldName)
                switch (op.fieldName) {
                    case 'mappingCode':
                        cell = <Select
                            value={list[ps.rowIndex][op.fieldName]}
                            onChange={(v) => _this.onFieldChange(v, ps.rowIndex, docName, activeKey)}
                            showSearch={true}
                            allowClear={list[ps.rowIndex][op.fieldName] ? true : false}
                            dropdownClassName='celldropdown'
                            filterOption={_this.filterOption}
                            name='cell'
                            dropdownFooter={
                                <Button name='add' type='primary' style={{ width: '100%', borderRadius: '0' }} onClick={() => _this.addDoc(ps.rowIndex, doc, docName, activeKey, op.caption)}>新增</Button>
                            }
                        >
                            {
                                doc.map((o, index) => {
                                    return (<Select.Option key={index} value={o.code}>{o.name}</Select.Option>)
                                })
                            }
                        </Select>;
                        break;
                    case 'accountCode':
                        cell = <Select
                            value={list[ps.rowIndex][op.fieldName]}
                            onChange={(v) => _this.onFieldChange(v, ps.rowIndex, 'account', activeKey)}
                            showSearch={true}
                            allowClear={list[ps.rowIndex][op.fieldName] ? true : false}
                            dropdownClassName='celldropdown'
                            filterOption={_this.filterOptionArchives}
                            name='cell'
                            dropdownFooter={
                                <Button name='add' type='primary' style={{ width: '100%', borderRadius: '0' }} onClick={() => _this.addAccount(ps.rowIndex, doc, docName, activeKey, op.caption)}>新增</Button>
                            }
                        >
                            {
                                account.map((o, index) => {
                                    return (<Select.Option key={index} value={o.code}>{o.name}</Select.Option>)
                                })
                            }
                        </Select>;
                        break;
                        case 'unit':
                        cell = <TextCell title={list[ps.rowIndex].unit ? list[ps.rowIndex].unit.name : ''} 
                        value={list[ps.rowIndex].unit ? list[ps.rowIndex].unit.name: ''} />;
                        break;
                    case 'rate':
                        cell = 
                        list[ps.rowIndex].unit ?
                        (!list[ps.rowIndex].unitName || !list[ps.rowIndex].unit.name) ? 
                        null
                        :
                        <div className='rate'>
                        1{list[ps.rowIndex].unitName}:
                            <Input.Number
                                style={{ width: 70, margin: '4px 8px', fontSize: '12px', textAlign: 'right', height: '28px' }}
                                value={list[ps.rowIndex][op.fieldName]}
                                onChange={(v) => _this.handleChangeRate(v,ps.rowIndex)}
                                className={!isNaN(Number(list[ps.rowIndex][op.fieldName])) && Number(list[ps.rowIndex][op.fieldName]) > 0 ? '' : 'has-error'}
                                minValue={0}
                            />
                            {/* {list[ps.rowIndex].unitName} */}
                            {list[ps.rowIndex].unit.name}
                        </div>
                        : null
                        break;
                    default:
                        cell = <TextCell className='cellLeft' title={list[ps.rowIndex][op.fieldName]} value={list[ps.rowIndex][op.fieldName]} />;
                }
                return cell;
            }}
        />
        cols.push(col)

    });
    return cols
}


