module.exports = {
	apps: [
		{
			name: 'elec3644-server',
			script: 'dist/index.js',
			watch: ['dist'],
			ignore_watch: ['node_modules'],
			max_memory_restart: '300M',
			env: {
				NODE_ENV: process.env.NODE_ENV || 'production',
			},
		},
	],
};