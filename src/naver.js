const puppeteer = require("puppeteer");
const fs = require("fs");
const converter = require("./json-to-csv-converter.js");

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
  startCrawling: async (name, url, limit) => {

    console.log('limit is : ', limit)

    if (url) {
      await naver.page.goto(target_url(url)).catch(err => {
        console.log(err);
      });
    } else {
      console.log('wrong url!');
      return false;
    }

    const result_thumnail_list = [];
    const result_posts_list = [];

    // 섬네일 크롤링

    async function thumnailCrawling () {

      await naver.page.waitFor('#section_body > ul');
      await naver.page.waitFor(1000);

      const news_thumnail_blocks = await naver.page.$$('#section_body > ul')
      
      for (let thumnail_block of news_thumnail_blocks) {

        const thumnails = await thumnail_block.$$('li');

        for (let thumnail of thumnails) {
          const thumnail_headers = await thumnail.$$('dt');
          const thumnail_info = await thumnail.$('dd');

          let thumnail_img_src = null;
          let thumnail_title = null;
          let post_link = null

          if (thumnail_headers.length < 2) {
            thumnail_title = await thumnail_headers[0].$eval('a', element => element.innerText).catch(err => {
              return null;
            });

            post_link = await thumnail_headers[0].$eval('a', element => element.href).catch(err => {
              return null
            });
          } else {
            thumnail_img_src = await thumnail_headers[0].$eval('img', element => element.src).catch(err => {
              return null;
            });

            thumnail_title = await thumnail_headers[1].$eval('a', element => element.innerText).catch(err => {
              return null;
            });

            post_link = await thumnail_headers[1].$eval('a', element => element.href).catch(err => {
              return null
            });
          }

          const thumnail_meta = {
            thumnail_short_text: await thumnail_info.$eval('span[class="lede"]', element => element.innerText).catch(err => {
              return null;
            }),
            thumnail_press: await thumnail_info.$eval('span[class="writing"]', element => element.innerText).catch(err => {
              return null;
            }),
            thumnail_date: await thumnail_info.$eval('span[class*="date"]', element => element.innerText).catch(err => {
              return null;
            })
          };

          

          const obj = {
            thumnail_img_src,
            thumnail_title,
            thumnail_meta,
            post_link
          }
          result_thumnail_list.push(obj);
        }
      }

      // 이 위라는 건데

      let current_page = await naver.page.$eval('#paging strong', element => {
        return element.innerText
      }).catch(err => {
        console.log(err);
      });

      

      console.log('현재 페이지 넘버 : ', current_page);

      if (Number(current_page) < limit) {

        await naver.page.$eval('#paging strong', element => {
          element.nextElementSibling.click();
        }).catch(err => {
          console.log(err);
        });

        await thumnailCrawling().catch(err => {
          console.log(err);
        });

      } else {
        return
      }

    }

    // 포스트 크롤링
    async function postCrawling (post_link) {
      await naver.page.goto(post_link);
      // 아 이미지가 아니라 비디오일 수도 있구나

      await naver.page.waitFor('#spiLayer li[class="u_likeit_list good"] span[class="u_likeit_list_count _count"]');
      await naver.page.waitFor(1000);

      const content = await naver.page.$('#articleBodyContents');

      const content_text = await naver.page.$eval('#articleBodyContents', element => element.innerText).catch(() => {
        return null;
      });
      
      const content_img_src = await content.$eval('span[class="end_photo_org"] img', element => element.src).catch(() => {
        return null;
      });

      const content_img_desc = await content.$eval('span[class="end_photo_org"] .img_desc', element => element.innerText).catch(() => {
        return null;
      });;

      const content_video_src = await content.$eval('div[class="vod_area"] iframe', element => {
        return element.contentWindow.document.body.querySelector('video > source').src;
      }).catch(() => {
        return null;
      });

      const content_video_desc = await content.$eval('div[class="vod_area"] iframe', element => {
        return element.contentWindow.document.body.querySelector('div[class="u_rmcplayer_video"] strong[class="u_rmc_tit"] > a').innerText;
      }).catch(() => {
        return null;
      });

      const content_reaction = {
        good: await naver.page.$eval('#spiLayer li[class="u_likeit_list good"] span[class="u_likeit_list_count _count"]', element => element.innerText).catch(() => {
          return null;
        }),
        warm: await naver.page.$eval('#spiLayer li[class="u_likeit_list warm"] span[class="u_likeit_list_count _count"]', element => element.innerText).catch(() => {
          return null;
        }),
        sad: await naver.page.$eval('#spiLayer li[class="u_likeit_list sad"] span[class="u_likeit_list_count _count"]', element => element.innerText).catch(() => {
          return null;
        }),
        angry: await naver.page.$eval('#spiLayer li[class="u_likeit_list angry"] span[class="u_likeit_list_count _count"]', element => element.innerText).catch(() => {
          return null;
        }),
        want: await naver.page.$eval('#spiLayer li[class="u_likeit_list want"] span[class="u_likeit_list_count _count"]', element => element.innerText).catch(() => {
          return null;
        })
      }

      const obj = {
        content_text,
        content_img_src,
        content_img_desc,
        content_video_src,
        content_video_desc,
        content_reaction
      };

      result_posts_list.push(obj)
    }


    await thumnailCrawling().catch(err => {console.log(err)});

    console.log('thumnails: ', result_thumnail_list);

    for (let result_thumnail of result_thumnail_list) {
      await postCrawling(result_thumnail.post_link);
    }

    console.log('posts: ', result_posts_list);

    const thumnail_list_json = JSON.stringify(result_thumnail_list);
    const posts_list_json = JSON.stringify(result_posts_list);

    fs.writeFileSync('./result/' + name + '-thumnails.json', thumnail_list_json);
    fs.writeFileSync('./result/' + name + '-posts.json', posts_list_json);

    const thumnail_fields = [
      'thumnail_img_src',
      'thumnail_title',
      'thumnail_meta',
      'post_link'
    ];

    const posts_fields = [
      'content_text',
      'content_img_src',
      'content_img_desc',
      'content_video_src',
      'content_video_desc',
      'content_reaction'
    ]

    const thumnail_csv = converter.convert('./result/' + name + '-thumnail.json', thumnail_fields);
    const post_csv = converter.convert('./result/' + name + '-post.json', posts_fields);
    
    fs.writeFileSync('./result/' + name + '-thumnail.csv', thumnail_csv);
    fs.writeFileSync('./result/' + name + '-post.csv', post_csv);
  }
}

module.exports = naver;