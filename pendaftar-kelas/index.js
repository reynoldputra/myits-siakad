import axios from "axios";
import * as querystring from "querystring";
import * as cheerio from "cheerio";

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


const scrap = async () => {
  let res = "";
  res += new Date().toLocaleTimeString() + "\n";
  console.log(new Date().toLocaleTimeString());
  let notifDisbale = true;
  for (let idx in urls) {
    const url = urls[idx];
    var config = {
      method: "get",
      url: url.link,
      headers: {
        Cookie: "PHPSESSID=" + sess,
      },
    };
    await axios(config)
      .then(async function(response) {
        const markup = response.data;
        const $ = cheerio.load(markup);
        const table1 = $(".AlternateBG");
        const table2 = $(".NormalBG");
        const total = table1.length + table2.length;
        console.log(`${total}/${url.max}`, url.nama);

        res += `${total}/${url.max}` + " " + url.nama + "\n";

        if (total != url.max) {
          res += "Ada perubahan"
          notifDisbale = false;
        }
      })
      .catch(function(error) {
        console.log(error);
      });
    sleep(500);
  }
  console.log(notifDisbale)
  const token = process.env.TOKEN;
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
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

scrap();
setInterval(scrap, 5000);
