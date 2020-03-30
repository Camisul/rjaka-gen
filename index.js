const axios = require('axios');
const cheerio = require('cheerio');
const URI = require('uri-js');

const last = (a) => a[a.length - 1];

const queue = [
  {
    href: 'http://green-willow.ru',
    text: 'index'
  },
];

const results = [];

async function scraper(url) {
  let data;
  try {
    const { data: date, headers } = await axios.get(url);
    // Only accept html
    if (!/text\/html/g.test(headers['content-type']))
      throw 'Bad Content-type'
    data = date;
  } catch (e) {
    return { sponsors: { top: '', bottom: '' }, title: e }
  }
  const $ = cheerio.load(data);
  const links = [];
  // Simple spider logick
  $('a').map((idx, el) => {
    if (!el)
      return;

    let href = $(el).attr('href');
    // Allow urls only going to this site
    if (/http/g.test(href)) {
      if (!(/green-willow/g.test(href)))
        return;
    } else {
      href = 'http://green-willow.ru' + href;
    }
    // Ignore anchors
    href = href.split('#')[0];
    const unit = {
      href: URI.serialize(URI.parse(href)),
      text: $(el).text().trim()
    };
    links.push(unit)
  });

  // Add only uniqie links to queue
  // But if we have additional link info 
  // Add it
  links.forEach((el) => {

    const hrefs = queue.map(e => e.href);
    if (hrefs.indexOf(el.href) < 0) {
      queue.push(el);
    }
    if (hrefs.indexOf(el.href) > 0) {
      const x = hrefs.indexOf(el.href);
      if (!queue[x].text) {
        queue[x] = el;
      }
    }
  });

  return {
    sponsors: {
      top: $('.moduletablesape').html(),
      bottom: $('.sponbottom').html(),
    },
    title: $('title').text(),
  };
}

function runner(idx = 0) {
  console.log(`${idx}/${queue.length} -- ${queue[idx].href}`)
  scraper(queue[idx].href).then((r) => {
    results.push({ origin: queue[idx], result: r });
    if (idx < queue.length - 1) {
      runner(++idx);
    } else {
      const { writeFileSync } = require('fs');
      
      // Such sanitization
      // TODO: Make use of dom purify
      writeFileSync('result.json', JSON.stringify(results).replace(/script/g, 'pre'));
    }
  });
}

runner();

