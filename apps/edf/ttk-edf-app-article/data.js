export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-edf-app-article',
		children: [{
			name: 'header',
			component: '::div',
			className: 'ttk-edf-app-article-header',
			children: [{
				name: 'left',
				component: '::span',
				className: 'ttk-edf-app-article-header-title',
				children: '视频课程'
			}, {
				name: 'right',
				component: '::div',
				className: 'ttk-edf-app-article-header-bar',
				children: [{
					name: 'more',
					component: '::span',
					className: 'more',
					onClick: "{{function() {$handleClick('more', 0)}}}",
					children: '更多'
				}, {
					name: 'button',
					component: '::span',
					className: 'refresh',
					children: {
						name: 'icon',
						component: 'Icon',
						showStyle: 'showy',
						fontFamily: 'edficon',
						style: {fontSize: '30px'},
						title: '刷新',
						type: 'shuaxin',
					}
				}]
			}]
		}, {
			name: 'body',
			component: '::div',
			_visible: '{{data.newslist != null}}',
			className: 'ttk-edf-app-article-body',
			children: [{
				name: 'ad',
				component: '::div',
				className: 'ttk-edf-app-article-body-ad',
				children: '{{data.newslist != null && $getCarouselData(data.newslist)}}'
			}, {
				name: 'list',
				component: '::ul',
				className: 'ttk-edf-app-article-body-list',
				children: [{
					name: 'listItem',
					component: '::li',
					key: "{{data.newslist[_rowIndex].id + ''}}",
					_visible: '{{_rowIndex > 2}}',
					_power: 'for in data.newslist',
					children: [{
						name: 'news',
						component: '::span',
						onClick: "{{function() {$handleClick(data.newslist[_rowIndex].videoUrl, 0)}}}",
						className: 'ttk-edf-app-article-title',
						style: {right: '{{data.newslist[_rowIndex].isHot ? "110px" : "80px"}}'},
						children: "{{data.newslist[_rowIndex].name}}"
					}, {
						name: 'ishot',
						component: 'Icon',
						className: 'ttk-edf-app-article-hot',
						_visible: "{{!!data.newslist[_rowIndex].isHot}}",
						fontFamily: 'edficon',
						type: 'new'
					}, {
						name: 'newsdate',
						component: '::span',
						className: 'ttk-edf-app-article-newsdate',
						children: "{{$parseTime(data.newslist[_rowIndex].addtime,'YYYY-MM-DD')}}"
					}]
				}]	
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			newslist: []
		}
	}
}