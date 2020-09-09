import React from 'react'
import { Progress } from 'edf-component'


class UpdateStatus extends React.Component {
    constructor(props){
        super(props)
        this.state ={
            total: 12,
            current: 8
        }
    }


    render() {
        let {total, current} = this.state
        return <div className='wrapUpdate'>
            <div style={{textAlign: 'right'}}>{`${current}/${total}`}</div>
            <Progress className='Progress' percent={(current/total)*100} showInfo={false}/>
            <div className='content'>
            
            </div>
        </div>
    }
}

export default UpdateStatus