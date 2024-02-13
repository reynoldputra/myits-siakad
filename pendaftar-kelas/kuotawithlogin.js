import pptr from "puppeteer-core";
import * as c from "cheerio";
import * as querystring from "querystring";
import { exit } from "process";
import 'dotenv/config'

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let oldval = []

while (true) {
  try {

    const browser = await pptr.launch({
      headless: true,
      executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
    });

    const ids = [
      "TK234708",
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

    console.log(name, username, password);
    await page.goto("https://akademik.its.ac.id/");
    await page.waitForSelector("#username");

    if (!name || !username || !password) {
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
    let res = "\nKuota\n"
    rows.each((_, e) => {
      let row = $(e).text()
      const id = row.split(" ")[0]
      if (ids.includes(id)) {
        console.log(row)
        if (oldval[idx] && oldval[idx] != row) {
          notifDisbale = false
          oldval[idx] = row
          res += "Ada perubahan" + "VVVV\n"
        }
        row = row.replace('              ', " ")
        res += row.split(" ").slice(1).join(" ") + "\n"
        idx++
      }
    })

    const token = process.env.TOKEN;
    const lineurl = "https://notify-api.line.me/api/notify";
    const message = res;

    const bodyJson = {
      message,
      notificationDisabled: notifDisbale,
    };

    const body = querystring.stringify(bodyJson)

    await fetch(lineurl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
      body,
    }).then((res) => res.json());

    console.log(`Cooldown ${cd} s`);
    await sleep(1000 * cd);
    console.log("Refreshing page .... ");
    await page.reload();
    await browser.close();
  } catch (err) {
    console.log(err)
  }
}
