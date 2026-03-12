import { getConfig, getAvailableApiSites } from './src/lib/config.ts';
import { searchFromApi } from './src/lib/downstream.ts';

async function run() {
  const config = await getConfig();
  console.log('Total sources:', config.SourceConfig.length);
  console.log('Admin user config:', config.UserConfig.Users.find(u => u.username === 'admin'));
  const sites = await getAvailableApiSites('admin', false);
  console.log('Available sites:', sites.map(s => s.name));
  
  if (sites.length > 0) {
    const results = await searchFromApi(sites[0], '阿凡达'); // Avatar
    console.log('Results size:', results.length);
    if (results.length > 0) console.log('First result title:', results[0].title);
  }
}

run().catch(console.error);
