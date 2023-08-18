import axios from 'axios';
import * as cheerio from 'cheerio'

const url = 'https://akademik.its.ac.id/list_frs.php'
const sess = "hputevlhlfjkpi9ps0lggpdse3";
const ids = [
    "TK234307",
    "TK234505",
    "TK234504",
    "TK234602",
]

var config = {
  method: 'get',
  url,
  headers: { 
    'Cookie': 'PHPSESSID=' + sess
  }
};


const scrap = async () => {
    await axios(config)
    .then(function (response) {
        const markup = response.data
        const $ = cheerio.load(markup)
        const table1 = $("#kelasjur")
        const rows = table1.children()
        console.log("===============")
        console.log(new Date().toLocaleTimeString())
        rows.each((_ , e) => {
            const row = $(e).text()
            const id = row.split(" ")[0]
            if(ids.includes(id)) {
                console.log(row)
            }
        })
    })
    .catch(function (error) {
    console.log(error);
    });
}

scrap()
setInterval(scrap, 3 * 1000)
