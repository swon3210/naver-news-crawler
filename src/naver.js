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
  startCrawling: async (url, limit) => {

    console.log('limit is : ', limit)

    if (url) {
      await naver.page.goto(target_url(url));
    } else {
      console.log('wrong url!');
      return false;
    }

    const result_thumnail_list = [];

    async function crawling () {

      await naver.page.waitFor('#section_body > ul');
      await naver.page.waitFor(4000);

      const news_thumnail_blocks = await naver.page.$$('#section_body > ul')
      
      for (let thumnail_block of news_thumnail_blocks) {

        const thumnails = await thumnail_block.$$('li');

        for (let thumnail of thumnails) {
          const thumnail_headers = await thumnail.$$('dt');
          const thumnail_info = await thumnail.$('dd');

          const obj = {
            thumnail_img_src: await thumnail_headers[0].$eval('img', element => element.src).catch(() => null),
            thumnail_title: await thumnail_headers[1].$eval('a', element => element.innerText),
            thumnail_meta: {
              thumnail_short_text: await thumnail_info.$eval('span[class="lede"]', element => element.innerText),
              thumnail_press: await thumnail_info.$eval('span[class="writing"]', element => element.innerText),
              thumnail_date: await thumnail_info.$eval('span[class*="date"]', element => element.innerText)
            }
          }
          result_thumnail_list.push(obj);
        }

        // 이제 strong 숫자 보고 거기에 1 더해서 클릭하는걸로 하면 되겠지
      }

      let current_page = await naver.page.$eval('#paging strong', element => {
        return element.innerText
      });

      console.log(current_page)

      if (Number(current_page) < limit) {
        
        await naver.page.$eval('#paging strong', element => {
          element.nextElementSibling.click();
        });

        await crawling();

      } else {
        return
      }

    }

    await crawling().catch(err => {console.log(err)});

    console.log(result_thumnail_list);

    debugger;

  }
}

module.exports = naver;