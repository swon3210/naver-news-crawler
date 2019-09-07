const puppeteer = require("puppeteer");

const BASE_URL = "https://news.naver.com/";

let target_url = (url) => `https://news.naver.com/${url}`;

const naver = {
  browser: null,
  page: null,

  initialize: async () => {
    naver.browser = await puppeteer.launch({ headless: false });
    naver.page = await naver.browser.newPage();
    await naver.page.goto(BASE_URL);
  },
  end: async () => {
    await naver.page.close();
  },
  startCrawling: async (url) => {

    if (url) {
      await naver.page.goto(target_url(url));
    }  else {
      console.log('wrong url!');
      return false;
    }

    await naver.page.waitFor('#section_body > ul');
    await naver.page.waitFor(1000);

    const result_thumnail_list = [];

    const news_thumnails = await naver.page.$$('#section_body > ul')
    
    for (let thumnail of news_thumnails) {
            
      const thumnail_headers = await thumnail.$$('dt');
      const thumnail_info = await thumnail.$('dd');

      const obj = {
        thumnail_img_src: await thumnail_headers[0].$eval('img', element => element.src),
        thumnail_title: await thumnail_headers[1].$eval('a', element => element.innerText),
        thumnail_meta: {
          thumnail_short_text: await thumnail_info.$eval('span[class="lede"]', element => element.innerText),
          thumnail_press: await thumnail_info.$eval('span[class="writing"]', element => element.innerText),
          thumnail_date: await thumnail_info.$eval('span[class="date is_new"]', element => element.innerText)
        }
      }
      
      result_thumnail_list.push(obj);

    }
    console.log(result_thumnail_list);

    debugger;


  }
}

module.exports = naver;