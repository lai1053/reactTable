import React from 'react'

class AddDeleteIcon extends React.Component{
    constructor(props){
        super(props)
        this.callback = props.callback
    }

    handleClick(icon){
        this.callback && this.callback(icon)
    }
    
    render(){
        return<div class="add-delect-icons">
            <i className="add-delete-Icon icon-addRow"
                onClick={()=>{this.handleClick('add')}}> 
            </i>
            <i className="add-delete-Icon icon-deleteRow"
                onClick={()=>{this.handleClick('delete')}}>
            </i>
        </div>
    }
}

export default AddDeleteIcon