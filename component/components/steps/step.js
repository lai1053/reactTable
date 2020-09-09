import React, { Component, PureComponent } from 'react'
import Icon from '../icon'
export default class Step extends PureComponent {
    constructor(props) {
        super(props)
    }
    static defaultProps = {
        data: [],
        current: 1
    }
    render() {
        const { data, current = 1, isCustomStep, ...others } = this.props;
        return <div className='step-box' {
            ...others
        }>
            {
                !isCustomStep ? //由业务自定义补数，存在某一步多个分支的情况 例如:导账
                    data.map((obj, index) => {
                        return <div className={current > index ? 'step active' : 'step'} key={obj.title}>
                            {
                                current > index + 1 ? <Icon type='duigou' style={{ fontSize: '20px' }} fontFamily='edficon' /> : <div className="step-number">{index + 1}</div>
                            }
                            {
                                obj.title
                            }
                        </div>
                    })
                    :
                    data.map((obj, index) => {
                        return <div className={current >= obj.step ? 'step active' : 'step'} key={obj.title}>
                            {
                                current >= obj.step ? <Icon type='duigou' style={{ fontSize: '20px' }} fontFamily='edficon' /> : <div className="step-number">{index + 1}</div>
                            }
                            {
                                obj.title
                            }
                        </div>
                    })
            }
        </div>
    }
}