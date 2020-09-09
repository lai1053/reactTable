import React from 'react'
import moment from 'moment'
import ReactDOM from 'react-dom'
import { Select, Button, Checkbox, Radio } from 'edf-component'
const RadioGroup = Radio.Group
const Option = Select.Option

class ResizablePanels extends React.Component {
  eventHandler = null

  constructor(props) {
    super(props)
    this.state = {
      isDragging: false,
      panels: [300, props.showTree ? this.props.initData ? Number(this.props.initData) : 250 : 30, 0]
    }
  }
  componentWillReceiveProps(props) {
    if (props.initData) {
      this.setState({
        panels: [300, props.showTree ? props.initData ? Number(props.initData) : 250 : 30, 0]
      })
    }
  }
  componentDidMount() {
    if (this.props.initData) {
      this.setState({
        panels: [300, this.props.showTree ? this.props.initData ? Number(this.props.initData) : 250 : 30, 0]
      })
    }
    // ReactDOM.findDOMNode(this).addEventListener('mousemove', this.resizePanel)
    // ReactDOM.findDOMNode(this).addEventListener('mouseup', this.stopResize)
    // ReactDOM.findDOMNode(this).addEventListener('mouseleave', this.stopResize)

    let panelContainer = document.querySelector('.panel-container')
    if (panelContainer) {
      if (window.addEventListener) {
        panelContainer.addEventListener('mousemove', this.resizePanel, false)
        panelContainer.addEventListener('mouseup', this.stopResize, false)
        panelContainer.addEventListener('mouseleave', this.stopResize, false)
      } else if (window.attachEvent) {
        panelContainer.attachEvent('onmousemove', this.resizePanel)
        panelContainer.attachEvent('onmouseup', this.stopResize)
        panelContainer.attachEvent('onmouseleave', this.stopResize)
      }
    }

  }

  componentWillUnmount () {
    let panelContainer = document.querySelector('.panel-container');
    if (panelContainer) {
      if (window.removeEventListener) {
        panelContainer.removeEventListener('mousemove', this.resizePanel, false)
        panelContainer.removeEventListener('mouseup', this.stopResize, false)
        panelContainer.removeEventListener('mouseleave', this.stopResize, false)
      } else if (window.detachEvent) {
        panelContainer.detachEvent('onmousemove', this.resizePanel)
        panelContainer.detachEvent('onmouseup', this.stopResize)
        panelContainer.detachEvent('onmouseleave', this.stopResize)
      }
    }
  }

  startResize = (event, index) => {
    this.setState({
      isDragging: true,
      currentPanel: index,
      initialPos: event.clientX
    })
  }

  stopResize = async () => {
    if (this.state.isDragging) {
      this.setState(({ panels, currentPanel, delta }) => ({
        isDragging: false,
        panels: {
          ...panels,
          [currentPanel]: (panels[currentPanel] || 0) - delta,
          [currentPanel - 1]: (panels[currentPanel - 1] || 0) + delta
        },
        delta: 0,
        currentPanel: null
      }))
      await this.props.callBack(this.state.panels[1])
    }
  }

  resizePanel = (event) => {
    if (this.state.isDragging) {
      const delta = event.clientX - this.state.initialPos
      this.setState({
        delta: delta
      })
    }
  }

  render() {
    const rest = this.props.children.slice(1)
    return (
      <div className="panel-container" onMouseUp={() => this.stopResize()}>
        <div className="panel" style={{ width: `calc(100% - ${this.state.panels[1]}px - ${this.state.panels[2]}px)`, position: 'relative' }}>
          {this.props.children[0]}
        </div>
        {[].concat(...rest.map((child, i) => {
          return this.props.showTree == true ? [
            <div onMouseDown={(e) => this.startResize(e, i + 1)}
              key={"resizer_" + i}
              style={this.state.currentPanel === i + 1 ? { left: this.state.delta } : {}}
              className="resizer"></div>,
            <div key={"panel_" + i} className="panel" style={{ width: this.state.panels[i + 1] }}>
              {child}
            </div>
          ] :
            [
              <div key={"panel_" + i} className="panel" style={{ width: this.state.panels[i + 1] }}>
                {child}
              </div>
            ]
        }))}
      </div>
    )
  }
}
export default ResizablePanels