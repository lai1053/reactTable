import React, {useState, useEffect, memo, Fragment} from 'react';
import {Button} from 'edf-component'
import moment from 'moment'
// import { moment as momentUtil, fetch } from 'edf-utils'
// import Spin from './Spin'
// import {debounce} from './js/util'

export default memo((props) => {

    function onDownload () {
        let date = moment().format('YYYYMMDD')
        let a = document.createElement('a')
        a.download = `${date}file.pdf`
        a.href = props.url
        a.click()
    }

    function onPrint () {
        const iframe = document.getElementsByClassName('stock-print-previw-iframe')[0]
        iframe.contentWindow.print()
    }

    function onCancel () {
        props.closeModal()
    }
    

    return (
        <Fragment>
            <div className='stock-print-previw-wrapper'>
                <iframe src={props.url + '#toolbar=0'} className='stock-print-previw-iframe'></iframe>
                <div className='stock-print-previw-footer'>
                    <Button type='primary' onClick={onDownload}>下载</Button>
                    <Button type='primary' onClick={onPrint}>打印</Button>
                    <Button onClick={onCancel}>取消</Button>
                </div>
            </div>
        </Fragment>
    )
})