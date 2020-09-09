import React, {memo} from 'react'
import {Spin} from 'antd'

export default memo((props) => {
    return (
        <React.Fragment>
            {   props.loading &&
                <div className='ttk-stock-app-common-spin'>
                    <Spin size='large' delay={10} tip={props.tip || '数据加载中......'}></Spin>
                </div>
            }
        </React.Fragment>
    )
})