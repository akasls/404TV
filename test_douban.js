import { getDoubanRecommends } from './src/lib/douban.client.ts';

async function run() {
  const result = await getDoubanRecommends({
    kind: 'movie',
    pageLimit: 24,
    pageStart: 0,
    category: '',
    format: '',
    region: '',
    year: '',
    platform: '',
    sort: '',
    label: ''
  });
  console.log("Returned valid list length:", result.list.length);
  console.log("Next start:", result.nextStart);
}

// Since getDoubanRecommends uses fetch, we need to mock it or just run the raw fetch
async function raw() {
  const url = 'https://m.douban.com/rexxar/api/v2/movie/recommend?refresh=0&start=0&count=50&selected_categories=%7B%7D&uncollect=false&score_range=0%2C10&tags=';
  const res = await fetch(url);
  const data = await res.json();
  console.log("Raw API returns items count:", data.items ? data.items.length : 0);
}
raw();
