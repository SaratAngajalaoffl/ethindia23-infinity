import conf from './config/config.json';
import { Chain } from './services/chain';

const main = async () => {
	Object.keys(conf).forEach((key) => {
		const chain = new Chain(key as any);
		chain.init();
	});
};

main().catch((err) => console.error(err));
