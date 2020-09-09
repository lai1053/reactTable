import React from 'react'
import { Icon, Tooltip, Table, Button } from 'edf-component'

export const IconWidthTips = (tipsText, status, iconType)=>{
    return (
        <Tooltip
            arrowPointAtCenter={true}
            placement='top'
            overlayClassName={status !== 'error' ? 'inv-tool-tip-normal' : 'inv-tool-tip-warning'}
            title={tipsText}>
            <Icon type={iconType} className={iconType} />
        </Tooltip> 
    )
}

