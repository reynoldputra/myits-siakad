import pptr from "puppeteer-core";
import * as c from "cheerio";
import * as querystring from "querystring";
import { exit } from "process";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let prevCount = 0;
let first = true;
while (true) {
  const browser = await pptr.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
  });

  console.log("Login to myits ....");

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36"
  );

  const name = process.argv[2];
  const username = process.argv[3];
  const password = process.argv[4];
  const jumlahMatkul = parseInt(process.argv[5]);

  console.log(name, username, password, jumlahMatkul);
  await page.goto("https://akademik.its.ac.id/");
  await page.waitForSelector("#username");

  if (!name || !username || !password || !jumlahMatkul) {
    console.log("error argument");
    exit(1);
  }

  await page.$eval("#username", (el, value) => (el.value = value), username);
  await page.$eval("#password", (el, value) => (el.value = value), password);

  await Promise.all([page.$eval("#login", (el) => el.click()), page.waitForNavigation()]);

  console.log("Success login");

  console.log("Redirect to data nilai per sem page ... ");
  await page.goto("https://akademik.its.ac.id/data_nilaipersem.php");
  console.log("Success redirect");
  const $ = c.load(await page.content());

  const today = new Date();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getMinutes();
  const table = $("tr");
  const sem4 = table.slice(-(jumlahMatkul + 2), -2);
  let res = "\n";
  res = res + name + "\n";
  res = res + "time : " + time + "\n";
  let count = 0;
  sem4.each((_, el) => {
    const matkul = $(el).find("td:eq(1)").text();
    const nilai = $(el).find("td:eq(3)").text();
    if (nilai != "_ ") {
      count++;
    }
    const row = `${nilai} | ${matkul}`;
    res = res + row + "\n";
  });

  let notifDisbale = true;
  console.log(count);
  if (count > prevCount) {
    if(!first) {
      notifDisbale = false;
    }
    prevCount = count;
  }
  first = false;

  console.log(notifDisbale);
  console.log(res);
  const token = "Iwua4nwAOKIAzbV345XaPE22zRoENbA9HuhLlL9poIj";
  const url = "https://notify-api.line.me/api/notify";
  const message = res;

  const bodyJson = {
    message,
    notificationDisabled: notifDisbale,
  };

  try {
    await fetch(url, {
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

  console.log("Cooldown 60 seccond");
  await sleep(60000 * 5);
  console.log("Refreshing page .... ");
  await page.reload();
  await browser.close();
}
