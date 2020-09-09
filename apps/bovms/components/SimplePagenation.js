import React from 'react'
import { DatePicker, Form, Table } from 'edf-component'
import { Map, fromJS } from 'immutable'
import { Icon, Button, Select } from 'antd'
const { Option } = Select;



//简单分页
class SimplePagination extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount() {

    }

    prev() {
        let { current } = this.props
        if(current === 1){
            return 
        }
        this.props.onChange(current - 1)
    }
    next() {
        let { current,total,pageSize } = this.props
        const allPages = Math.floor((total - 1) / pageSize) + 1;
        if(allPages === 0  || current === allPages){
            return 
        }
        this.props.onChange(current + 1)
    }
    render() {
        const { showTotal, current, total, pageSize, style, pageSizeOptions, onShowSizeChange } = this.props
        const allPages = Math.floor((total - 1) / pageSize) + 1;

        return (
            <ul className="simple-pagination ant-pagination" style={style}>
                {showTotal && <li className='ant-pagination-total-text'>
                    {showTotal(total)}
                </li>}
                <li title="上一页" className={current == 1 ? "ant-pagination-disabled ant-pagination-prev" : ' ant-pagination-prev'} onClick={this.prev.bind(this)}>
                    <a class="ant-pagination-item-link">
                        {/* <Icon type="right" className='anticon anticon-left' /> */}
                    </a>
                </li>
                <li className='ant-pagination-simple-pager' style={{ display: 'inline-block', marginRight: '6px' }}>
                    {current}<span class="ant-pagination-slash" style={{margin:'0 5px 0 5px'}}>／</span>{allPages}
                </li>
                <li title="下一页" className={allPages === 0 || current == allPages ? "ant-pagination-disabled ant-pagination-next" : "ant-pagination-next"} onClick={this.next.bind(this)}>
                    <a class="ant-pagination-item-link">
                        {/* <Icon type="left" className='anticon anticon-right' /> */}
                    </a>
                </li>
                <li class="ant-pagination-options">
                    <div class="ant-pagination-options-size-changer ant-select ant-select-enabled">
                        <Select defaultValue={`${pageSize}条/页`} onChange={(value) => { onShowSizeChange(current, parseInt(value)) }}>
                            {pageSizeOptions.map(e => <Option value={e} title={`${e}条/页`}>{`${e}条/页`}</Option>)}
                        </Select>
                    </div>
                </li>
            </ul>
        )
    }
}

export default SimplePagination