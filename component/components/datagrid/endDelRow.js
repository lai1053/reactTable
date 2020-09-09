import React from 'react'
import { Table, Column, Cell } from 'fixed-data-table-2'
import Icon from '../icon'

export default function EndDelRow(props) {
	const {
		enableEndDelRow, //启用行 末尾删除功能
		onDelrow, //删除行事件
		width
	} = props

	const getContent = (ps) => {
		return <div className='mk-datagrid-upDownRow-cell' style={{position: 'relative', left: width}}>
			{enableEndDelRow ? <Icon title="删除" type="close" className='mk-datagrid-editable-up-row' onClick={() => onDelrow ? onDelrow(ps) : undefined} /> : null}
		</div>
	}
	return (
		<Column
			key="_sequence"
			width={0}
			cell={ps => getContent(ps)}
			fixed={true}
			header={
				<Cell style={{position: 'relative', left: width, background: '#fff', width: '24px'}}></Cell>
			}
			footer={
				<Cell style={{position: 'relative', left: width, background: '#fff', width: '24px'}}></Cell>
			}
		/>
	)
}



