const puppeteer = require("puppeteer");
const fs = require("fs");
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:3001");

  const resultsSelector = ".icon-twrap";

  await page.waitForSelector(resultsSelector);
  // Get the "viewport" of the page, as reported by the page.
  const dimensions = await page.evaluate(resultsSelector => {
    const anchors = Array.from(document.querySelectorAll(resultsSelector));
    //const icons =document.getElementsByClassName("icon-twrap");

    return anchors.map(item => {
      return { svg: item.innerHTML, name: item.parentNode.innerText };
    });
  }, resultsSelector);

  for (let i = 0; i < dimensions.length; i++) {
    fs.writeFile(
      `./icon/${dimensions[i].name}.svg`,
      dimensions[i].svg,
      () => {}
    );
  }

  console.log("Dimensions:", dimensions);

  await browser.close();
})();

