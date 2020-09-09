import SuperSelect from "../../invoices/component/SuperSelect"
export default {
	name: "purchase-ru-ku-add-alert",
	version: "1.0.0",
	description: "purchase-ru-ku-add-alert",
	meta: null,
	components: [
		{
			name: "SuperSelect",
			component: SuperSelect,
		},
	],
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
			"purchase-ru-ku-add-alert"
		)
	},
}
