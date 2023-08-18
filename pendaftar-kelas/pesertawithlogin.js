import pptr from "puppeteer-core";
import * as c from "cheerio";
import * as querystring from "querystring";
import { exit } from "process";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const urls = [
  {
    nama: "PLI A",
    link: "https://akademik.its.ac.id/lv_peserta.php?mkJur=23100&mkID=TK4505&mkSem=1&mkThn=2023&mkKelas=A&mkThnKurikulum=2023",
    max: 38,
  },
  {
    nama: "PLI B",
    link: "https://akademik.its.ac.id/lv_peserta.php?mkJur=23100&mkID=TK4505&mkSem=1&mkThn=2023&mkKelas=B&mkThnKurikulum=2023",
    max: 38,
  },
  {
    nama: "KPK A",
    link: "https://akademik.its.ac.id/lv_peserta.php?mkJur=23100&mkID=TK4504&mkSem=1&mkThn=2023&mkKelas=A&mkThnKurikulum=2023",
    max: 35,
  },
  {
    nama: "KPK B",
    link: "https://akademik.its.ac.id/lv_peserta.php?mkJur=23100&mkID=TK4504&mkSem=1&mkThn=2023&mkKelas=B&mkThnKurikulum=2023",
    max: 35,
  },
  {
    nama: "SUP A",
    link: "https://akademik.its.ac.id/lv_peserta.php?mkJur=23100&mkID=TK4307&mkSem=1&mkThn=2023&mkKelas=A&mkThnKurikulum=2023",
    max: 38,
  },
  {
    nama: "EKOTEK B",
    link: "https://akademik.its.ac.id/lv_peserta.php?mkJur=23100&mkID=TK4602&mkSem=1&mkThn=2023&mkKelas=C&mkThnKurikulum=2023",
    max: 35,
  },
  {
    nama: "EKOTEK C",
    link: "https://akademik.its.ac.id/lv_peserta.php?mkJur=23100&mkID=TK4602&mkSem=1&mkThn=2023&mkKelas=B&mkThnKurikulum=2023",
    max: 35,
  },
];

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
  const cd = process.argv[5] ?? 10;

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

  let res = "";
  res += new Date().toLocaleTimeString() + "\n";
  console.log(new Date().toLocaleTimeString());
  let notifDisbale = true;
  for (let idx in urls) {
    const url = urls[idx];
    await page.goto(url.link);
    const $ = c.load(await page.content());
    const table1 = $(".AlternateBG");
    const table2 = $(".NormalBG");
    const total = table1.length + table2.length;
    console.log(`${total}/${url.max}`, url.nama);

    res += `${total}/${url.max}` + " " + url.nama + "\n";

    if (total != url.max) {
      res += "Ada perubahan";
      notifDisbale = false;
    }
    sleep(500);
  }
  console.log(notifDisbale);
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
