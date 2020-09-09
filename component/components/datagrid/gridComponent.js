import React, { Fragment, useState, PureComponent } from "react"
import ReactDOM from "react-dom"
import { Table } from "fixed-data-table-2"
import SequenceColumn from "./sequenceColumn"
import AddDelRow from "./addDelRow"
import UpDownRow from "./upDownRow"
import EndDelRow from "./endDelRow"
import NoData from "../nodata"
// import Spin from '../spin'
import { Spin } from "antd"
// import renderDataGridCol from './dataGridCol'
function TableComponent(props) {
	let {
		columns,
		onColumnResizeEnd,
		onColumnResizeEndCallback,
		allowResizeColumn, //是否伸缩列
		...other
	} = props
	const [tableColumns, setTableColumns] = useState(null)
	onColumnResizeEndCallback = (newColumnWidth, columnKey) => {
		if (newColumnWidth < 41) newColumnWidth = 41
		if (allowResizeColumn) {
			setTableColumns(
				(tableColumns || columns).map(m => {
					if (!m) return m
					const _props = m.props || {}
					if (_props.columnKey === columnKey) {
						_props.width = newColumnWidth
					}
					return m
				})
			)
		} else {
			onColumnResizeEnd && onColumnResizeEnd(newColumnWidth, columnKey)
		}
	}
	const cols = tableColumns
		? columns.map(m => {
				if (m && m.props && m.props.columnKey) {
					const item = tableColumns.find(
						f => f && f.props && f.props.columnKey === m.props.columnKey
					)
					if (item && item.props.width) {
						m.props.width = item.props.width
					}
				}
				return m
		  })
		: columns
	return (
		<Table {...other} onColumnResizeEndCallback={onColumnResizeEndCallback}>
			{cols}
		</Table>
	)
}
export default function GridComponent(props) {
	let {
		key,
		rowsCount,
		headerHeight,
		rowHeight,
		groupHeaderHeight,
		footerHeight,
		width,
		height,
		heightFromRowsCount,
		readonly,
		enableSequence,
		enableSequenceAddDelrow,
		startSequence,
		enableAddDelrow,
		enableUpDownrow,
		enableEndDelRow,
		sequenceFooter,
		onAddrow,
		onDelrow,
		onUprow,
		onDownrow,
		onRowClick,
		onRowDoubleClick,
		onRowMouseEnter,
		onRowMouseLeave,
		onScrollEnd,
		scrollToRow,
		isAutoCalcScrollToRow,
		scrollToColumn,
		columns,
		isColumnSort,
		isColumnResizing,
		onColumnResizeEnd,
		onSortChange,
		scrollTop,
		sequencePostion = 0, //用于调整序号列的位置，默认在第1列
		sequenceFixed = true, //序号列默认fixed
		...other
	} = props

	//高度根据行数计算
	if (heightFromRowsCount) {
		height = headerHeight + 2 + rowHeight * rowsCount + footerHeight
	}
	columns = [...columns]
	if (props.allowResizeColumn) {
		columns.forEach(m => {
			if (m && m.props) {
				m.props.isResizable = m.props.isResizable !== undefined ? m.props.isResizable : true
			}
		})
	}
	if (enableSequence) {
		if (columns.length > 0 && columns[0] && columns[0].props && columns[0].props.children) {
			columns[0].props.children.splice(
				sequencePostion,
				0,
				SequenceColumn({
					startSequence,
					enableSequenceAddDelrow: readonly === false ? enableSequenceAddDelrow : false,
					footer: sequenceFooter,
					onAddrow,
					onDelrow,
					sequenceFixed,
				})
			)
		} else {
			columns.splice(
				sequencePostion,
				0,
				SequenceColumn({
					startSequence,
					enableSequenceAddDelrow: readonly === false ? enableSequenceAddDelrow : false,
					footer: sequenceFooter,
					onAddrow,
					onDelrow,
					sequenceFixed,
				})
			)
		}
	}
	/**
	 * 行插入、删除
	 */
	if (enableAddDelrow) {
		columns.splice(
			0,
			0,
			AddDelRow({
				enableAddDelrow: readonly === false ? enableAddDelrow : false,
				onAddrow,
				onDelrow,
			})
		)
	}

	/**
	 * 行上移、下移
	 */
	if (enableUpDownrow) {
		columns.splice(
			0,
			0,
			UpDownRow({
				enableUpDownrow: readonly === false ? enableUpDownrow : false,
				onUprow,
				onDownrow,
				width,
			})
		)
	}

	/**
	 * 行 末尾删除
	 */
	if (enableEndDelRow) {
		columns.splice(
			0,
			0,
			EndDelRow({
				enableEndDelRow: readonly === false ? enableEndDelRow : false,
				onDelrow,
				width,
			})
		)
	}

	/**
	 * 允许表格拖宽
	 */
	if (isColumnResizing) {
		isColumnResizing = !isColumnResizing
	}
	const onColumnResizeEndCallback = (newColumnWidth, columnKey) => {
		if (newColumnWidth < 41) newColumnWidth = 41
		props.onColumnResizeEnd && props.onColumnResizeEnd(newColumnWidth, columnKey)
	}
	onSortChange = (columnKey, sortDir) => {}

	//排序类型
	let SortTypes = {
		ASC: "ASC",
		DESC: "DESC",
	}

	//计算scroll值 (凭证在编辑状态下，然后切换页签就会出现白屏，所以此段代码不能注释掉)
	if (isAutoCalcScrollToRow) {
		let scrollOffsetHeight = (props.oldRowsCount - rowsCount) * rowHeight
		scrollOffsetHeight = scrollOffsetHeight > 0 ? 0 : scrollOffsetHeight
		let scrollTop = props.scrollTop || 0
		scrollTop += scrollOffsetHeight

		scrollTop = scrollTop < 0 ? 0 : scrollTop
		scrollToRow = parseInt(scrollTop / rowHeight)
	}

	props.loading = !props.loading ? { spinning: false } : props.loading

	if (!props.loading) {
		props.loading = { spinning: false }
	} else if (props.loading == true) {
		props.loading = { spinning: props.loading }
	}

	let size = props.loading && props.loading.size ? props.loading.size : "large",
		tip = props.loading && props.loading.tip ? props.loading.tip : "数据加载中...",
		delay = props.loading && props.loading.delay ? props.loading.delay : 2000
	const tableProps = {
		...other,
		key,
		rowsCount: height == 0 || width == 0 ? 0 : rowsCount,
		headerHeight: headerHeight || 0,
		rowHeight: rowHeight,
		groupHeaderHeight: groupHeaderHeight || 0,
		footerHeight: footerHeight || 0,
		width: width,
		height: (height || 0) + 2,
		isColumnResizing: false,
		scrollToRow: scrollToRow,
		scrollToColumn: height != 0 && width != 0 ? scrollToColumn : undefined,
		onRowDoubleClick: readonly === false ? undefined : onRowDoubleClick,
		onRowClick: readonly === false ? undefined : onRowClick,
		onRowMouseEnter: readonly === true ? undefined : onRowMouseEnter,
		onRowMouseLeave: readonly === false ? undefined : onRowMouseLeave,
		onScrollEnd: onScrollEnd,
		scrollTop: scrollTop,
	}
	return (
		<Fragment>
			<Spin delay={delay} size={size} tip={tip} {...props.loading}>
				<div style={{ position: "relative" }}>
					{props.allowResizeColumn ? (
						<TableComponent {...tableProps} columns={columns} />
					) : (
						<Table
							{...tableProps}
							onColumnResizeEndCallback={onColumnResizeEndCallback}>
							{columns}
						</Table>
					)}

					{rowsCount == 0 || height == 0 || width == 0 ? (
						<NoData
							style={{
								position: "absolute",
								height: "220px",
								top: "50%",
								marginTop: "-110px",
							}}>
							暂无数据
						</NoData>
					) : (
						""
					)}
				</div>
			</Spin>
		</Fragment>
	)
}
