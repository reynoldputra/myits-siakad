import pptr from "puppeteer-core";
import * as c from "cheerio";
import * as querystring from "querystring";
import { exit } from "process";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let oldval = []
while (true) {
  const browser = await pptr.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
  });

  const ids = [
      "TK234307",
      "TK234505",
      "TK234504",
      "TK234602",
  ]

  let notifDisbale = true;

  console.log("Login to myits ....");

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36"
  );

  const name = process.argv[2];
  const username = process.argv[3];
  const password = process.argv[4];
  const cd = process.argv[5] ?? 10

  console.log(name, username, password );
  await page.goto("https://akademik.its.ac.id/");
  await page.waitForSelector("#username");

  if (!name || !username || !password ) {
    console.log("error argument");
    exit(1);
  }

  await page.$eval("#username", (el, value) => (el.value = value), username);
  await page.$eval("#password", (el, value) => (el.value = value), password);

  await Promise.all([page.$eval("#login", (el) => el.click()), page.waitForNavigation()]);

  console.log("Success login");

  console.log("Redirect to frs page ... ");
  await page.goto("https://akademik.its.ac.id/list_frs.php");
  console.log("Success redirect");
  const $ = c.load(await page.content());

  const table1 = $("#kelasjur")
  const rows = table1.children()
  console.log("===============")
  console.log(new Date().toLocaleTimeString())
  let idx = 0;
  let res = ""
  rows.each((_ , e) => {
      const row = $(e).text()
      const id = row.split(" ")[0]
      if(ids.includes(id)) {
          console.log(row)
          if(oldval[idx] && oldval[idx] != row){
            notifDisbale = false
            oldval[idx] = row
            res += "Ada perubahan" + "\n"
            res += row
          }
        idx ++
      }
  })

  const token = "Iwua4nwAOKIAzbV345XaPE22zRoENbA9HuhLlL9poIj";
  const lineurl = "https://notify-api.line.me/api/notify";
  const message = res;

  const bodyJson = {
    message,
    notificationDisabled: notifDisbale,
  };

  try {
    await fetch(lineurl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
      body: querystring.stringify(bodyJson),
    });
  } catch (err) {
    console.log(err);
  }

  console.log(`Cooldown ${cd} s`);
  await sleep(1000 * cd);
  console.log("Refreshing page .... ");
  await page.reload();
  await browser.close();
}
