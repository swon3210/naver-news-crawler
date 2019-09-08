const naver = require("./naver.js");

const categories = {
  politics: "main/main.nhn?mode=LSD&mid=shm&sid1=100",
  economics: "main/main.nhn?mode=LSD&mid=shm&sid1=101",
  social: "main/main.nhn?mode=LSD&mid=shm&sid1=102",
  culture: "main/main.nhn?mode=LSD&mid=shm&sid1=103",
  world: "main/main.nhn?mode=LSD&mid=shm&sid1=104",
  science: "main/main.nhn?mode=LSD&mid=shm&sid1=105"
};

const press = {
  kyeonghyang: "main/list.nhn?mode=LPOD&mid=sec&oid=032",
  kukmin: "main/list.nhn?mode=LPOD&mid=sec&oid=005",
  donga: "main/list.nhn?mode=LPOD&mid=sec&oid=020",
  munwha: "main/list.nhn?mode=LPOD&mid=sec&oid=021",
  seoul: "main/list.nhn?mode=LPOD&mid=sec&oid=081",
  segye: "main/list.nhn?mode=LPOD&mid=sec&oid=022",
  josheon: "main/list.nhn?mode=LPOD&mid=sec&oid=023",
  joongang: "main/list.nhn?mode=LPOD&mid=sec&oid=025",
  hangyere: "main/list.nhn?mode=LPOD&mid=sec&oid=028",
  hankuk: "main/list.nhn?mode=LPOD&mid=sec&oid=469"
};

(async () => {

  await naver.initialize();

  // for (let i in categories) {
  //   await naver.startCrawling(i, categories[i], 5);
  // }

  await naver.startCrawling('politics', categories.politics, 5);

})();