import React, { useState, useEffect, useRef, cloneElement } from "react"
import { Button, Form, Icon } from "antd"
import VirtualTable from "../VirtualTable/index"
import { EditableFormRow, EditableCell } from "./EditableCell"
import {
    addEvent,
    removeEvent,
    getFullScreenElement,
    getFullScreenChangeName,
    exitFullscreen,
    openFullscreen,
} from "../../utils/index"
import editingFactory from "./editingFactory"
import moment from "moment"
const EditableCellTable = props => {
    // fluctuateCell 无增减列
    const {
        dataSource,
        columns,
        count,
        onChange,
        width,
        height,
        headerHeight,
        scroll,
        fluctuateCell,
        isFullScreen,
        isFullClient,
        showFullClient,
        showFullScreen,
        scrollTop,
        minWidth,
        className,
        addRowProps,
        deleteRowProps,
        ...restProps
    } = props
    const tableContainerRef = useRef(null)
    const tableRef = useRef(null)
    const [cacheProps] = useState({
        width: props.width,
        height: props.height,
        scroll: props.scroll,
    })
    // const [editingRowKey, setEditingRowKey] = useState(null)
    const components = {
        body: {
            row: EditableFormRow,
            cell: EditableCell,
        },
    }

    const onAddrow = index => {
        const newData = {
            key: String(count),
        }
        // const ds = [].concat(dataSource)
        dataSource.splice(index + 1, 0, newData)
        onChange(dataSource, count + 1, {
            scrollTop: tableRef.current.bodyRef.current.scrollTop,
        })
    }
    const onDelrow = (key, index) => {
        onChange(
            dataSource.filter(item => item.key !== key),
            count,
            { scrollTop: tableRef.current.bodyRef.current.scrollTop }
        )
    }

    const handleFullScreenChange = e => {
        if (!getFullScreenElement()) handleExitFullView()
    }
    const handleFullView = () => {
        const viewType = showFullClient !== undefined ? "client" : "screen"
        const [width, height] = getViewSize(viewType)

        const tableOptions = {
            width,
            height,
            scroll: { x: width, y: height - (headerHeight || 37) },
        }
        if (viewType === "client") tableOptions.isFullClient = true
        else tableOptions.isFullScreen = true
        onChange(dataSource, count, tableOptions)

        if (!getFullScreenElement() && viewType === "screen")
            openFullscreen(tableContainerRef.current)
    }
    const handleExitFullView = () => {
        const viewType = showFullClient !== undefined ? "client" : "screen"
        const tableOptions = { ...cacheProps }
        if (viewType === "client") tableOptions.isFullClient = false
        else tableOptions.isFullScreen = false
        onChange(dataSource, count, tableOptions)
        if (viewType !== "client") exitFullscreen()
    }
    const verticalScrollUnAvail = () => editingFactory.getEditingTable(className)
    const _columns = getEditingTableColumns(
        className,
        columns,
        fluctuateCell,
        addRowProps,
        deleteRowProps,
        onAddrow,
        onDelrow
    )
    useEffect(() => {
        addEvent(document.body, getFullScreenChangeName(), handleFullScreenChange)
        return () => {
            removeEvent(document.body, getFullScreenChangeName(), handleFullScreenChange)
        }
    }, [])
    return (
        <div
            ref={tableContainerRef}
            className={`table-container ${isFullScreen ? "full-screen" : ""} ${
                isFullClient ? "full-client" : ""
            }`}
            style={{ minWidth }}>
            <VirtualTable
                {...restProps}
                ref={tableRef}
                className={className}
                components={components}
                rowClass={() => "editable-row"}
                bordered
                width={width}
                height={height}
                scroll={scroll}
                dataSource={dataSource}
                columns={_columns}
                scrollTop={scrollTop}
                verticalScrollUnAvail={verticalScrollUnAvail}
            />
            {showFullScreen || showFullClient ? (
                <span
                    className="full-view-btn"
                    onClick={handleFullView}
                    style={{ top: headerHeight || "37px" }}>
                    {showFullScreen ? "全屏查看" : "放大表格"}
                </span>
            ) : null}
            {isFullScreen || isFullClient ? (
                <span
                    className="exit-full-view-btn"
                    onClick={handleExitFullView}
                    style={{ top: headerHeight || "37px" }}>
                    {isFullScreen ? "退出全屏" : "还原表格"}
                </span>
            ) : null}
        </div>
    )
}
// 获取表格列
const getEditingTableColumns = (
    className,
    columns,
    fluctuateCell,
    addRowProps,
    deleteRowProps,
    onAddrow,
    onDelrow
) => {
    const sequenceCell = fluctuateCell
        ? {
              title: "序号",
              dataIndex: "orderNumber",
              align: fluctuateCell.align || "center",
              width: fluctuateCell.width || 60,
              flexGrow: fluctuateCell.flexGrow || undefined,
              className: fluctuateCell.className || "",
              render: (text, record, index) =>
                  renderFluctuateCell(
                      record,
                      index,
                      addRowProps,
                      deleteRowProps,
                      onAddrow,
                      onDelrow
                  ),
          }
        : {}

    return [sequenceCell, ...columns].map(col => {
        if (!col.editable) {
            return col
        }
        return {
            ...col,
            onCell: record => ({
                editEdCell: col.editEdCell,
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                required: col.required,
                dateFormat: col.dateFormat,
                // handleSave,
                setEditing: editing => {
                    editingFactory.setEditingTable(className, editing)
                },
            }),
        }
    })
}

const getViewSize = viewType => {
    let width = 0,
        height = 0
    if (viewType === "screen") {
        width = window.screen.availWidth
        height = window.screen.height
    } else {
        width = document.body.clientWidth
        height = document.body.clientHeight
    }
    return [width - 50, height - 50]
}

// 渲染带增减按钮的序号列
const renderFluctuateCell = (record, index, addRowProps, deleteRowProps, onAddrow, onDelrow) => {
    const addProps = (addRowProps && addRowProps(record)) || {
        disabled: false,
        hide: false,
    }
    const deleteProps = (deleteRowProps && deleteRowProps(record)) || {
        disabled: false,
        hide: false,
    }
    const addBtn =
        (!addProps.hide && (
            <Icon
                title="増行"
                type="plus-circle-o"
                className="btn"
                disabled={addProps.disabled}
                onClick={() => (addProps.disabled ? undefined : onAddrow(index))}
            />
        )) ||
        null
    const delBtn =
        (!deleteProps.hide && (
            <Icon
                title="删行"
                type="minus-circle-o"
                className="btn"
                disabled={deleteProps.disabled}
                onClick={() => (deleteProps.disabled ? undefined : onDelrow(record.key, index))}
            />
        )) ||
        null
    if (addProps.hide && deleteProps.hide) {
        return index + 1
    }
    return (
        <div className="add-del-row-cell">
            {addBtn}
            {delBtn}
            {<span className="index">{index + 1}</span>}
        </div>
    )
}
export default EditableCellTable
