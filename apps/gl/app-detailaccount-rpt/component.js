import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { wrapper } from 'edf-meta-engine'
import appInfo from './index'
import keydown, { Keys } from 'react-keydown'

@keydown
@wrapper(appInfo)
export default class C extends Component {
	render() {
		return this.props.monkeyKing({ ...this.props, path: 'root' })
	}
}