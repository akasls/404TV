const https = require('https');

const url = 'https://m.douban.cmliussss.net/rexxar/api/v2/movie/recommend?refresh=0&start=0&count=100&selected_categories=%7B%7D&uncollect=false&score_range=0%2C10&tags=';

https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Returned items count:', parsed.items ? parsed.items.length : 0);
      let valid = 0;
      for (const i of parsed.items || []) {
        if (i.type === 'movie' || i.type === 'tv') valid++;
      }
      console.log('Valid movies:', valid);
    } catch (e) { console.error(e); }
  });
});
