export default {
	name: "inv-app-yunmeng-home",
	version: "1.0.0",
	moduleName: "票据",
	description: "云盟单户首页",
	meta: null,
	components: [],
	config: null,
	load: cb => {
		require.ensure(
			[],
			require => {
				cb(
					require("./component"),
					require("./action"),
					require("./reducer"),
					require("./data"),
					require("./config")
				)
			},
			"inv-app-yunmeng-home"
		)
	}
}
