import React, { Fragment } from 'react'
import VirtualTable from './virtualTable'
import ResizeVirtualTable from './resizeVirtualTable'

function VirtualTableComponent(props) {
    if (props.allowColResize) {
        return <Fragment><ResizeVirtualTable {...props}></ResizeVirtualTable></Fragment>
    }
    return <Fragment><VirtualTable {...props}></VirtualTable></Fragment>
}


export default VirtualTableComponent