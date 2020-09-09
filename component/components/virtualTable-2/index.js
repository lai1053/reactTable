import React, { Fragment } from 'react'
import VirtualTable from './virtualTable'
import ResizeVirtualTable from './resizeVirtualTable'

function VirtualTableComponent(props) {
    if (props.allowColResize) {
        return <ResizeVirtualTable {...props}></ResizeVirtualTable>
    }
    return <Fragment><VirtualTable {...props}></VirtualTable></Fragment>
}


export default VirtualTableComponent