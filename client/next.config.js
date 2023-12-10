/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				hostname: 'cryptocurrencyjobs.co',
			},
		],
	},
};

module.exports = nextConfig;
