import express from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
const PORT = 3001;

app.use(cors());

const cache: {
  articles: any;
  events: { tallinn: any; tartu: any };
  premieres: any;
} = {
  articles: null,
  events: { tallinn: null, tartu: null },
  premieres: null,
};

async function scrapeArticles() {
  const archivePage = await axios.get("https://www.sirp.ee/veebiarhiiv/");
  const $ = cheerio.load(archivePage.data);

  const issueLinks: Array<{ url: string; date: string }> = [];
  $("a.issue-link").each((_i, el) => {
    const url = $(el).attr("href") || "";
    const date = $(el).text().trim();
    if (url) issueLinks.push({ url, date });
  });

  const latest3 = issueLinks.slice(0, 3);

  return Promise.all(
    latest3.map(async (issue) => {
      const issuePage = await axios.get(issue.url);
      const $issue = cheerio.load(issuePage.data);

      const articles: Array<{
        category: string;
        title: string;
        url: string;
        author: string;
        image: string;
      }> = [];

      $issue(".article-post").each((_i, el) => {
        const block = $issue(el);
        const category = block.find("a[rel=tag]").first().text().trim();
        const titleEl = block.find("h2 a[target=_self]");
        const title = titleEl.text().trim();
        const url = titleEl.attr("href") || "";
        const author = block.find(".author-name a").first().text().trim();
        const image = block.find("figure img").attr("src") || "";
        if (title) {
          articles.push({ category, title, url, author, image });
        }
      });

      return { date: issue.date, articles };
    }),
  );
}

async function scrapeEvents(city: string) {
  const url = `https://www.kultuurikava.ee/api/?do=events&lang=nat&city=${city}&order=starta&start=0&limit=30&format=json&showall=false&alltimes=true&ignoremuuseums=true`;
  const { data } = await axios.get(url);
  return data.data.events.map((e: any) => ({
    title: e.name,
    url: e.url,
    location: e.place_name,
    city: e.city,
    image: e.hasimage ? e.image : "",
    excerpt: e.excerpt,
    startTime: e.start_time,
    endTime: e.end_time,
    categories: e.categories,
    isFree: e.isfree,
  }));
}

const PREMIERES_URL =
  "https://teater.ee/teatriinfo/mangukava/?f%5Bname_or_tag%5D=&f%5Bperformance_time_start%5D=&f%5Bperformance_time_end%5D=&f%5Btheaters%5D=&f%5Bvenue_id%5D=&f%5Baccessibility%5D=&f%5Bpremiere%5D=1";

async function scrapePremieres() {
  const { data } = await axios.get(PREMIERES_URL);
  const $ = cheerio.load(data);

  const premieres: Array<{
    date: string;
    time: string;
    title: string;
    location: string;
    image: string;
    url: string;
  }> = [];

  let currentDate = "";
  $(".post-etendus__heading, .block-etendus").each((_i, el) => {
    const e = $(el);
    if (e.hasClass("post-etendus__heading")) {
      currentDate = e.text().trim();
      return;
    }
    const time = e.find(".block-etendus__time").text().trim();
    const title = e.find(".block-etendus__paragraph-big").text().trim();
    const smalls = e
      .find(".block-etendus__paragraph-small")
      .not(".hashtags-wrapper");
    const location = smalls.eq(1).text().trim();
    const image = e.find("img").attr("src") || "";
    const href = e.find(".block-set__cage-text a").attr("href") || "";

    if (title) {
      premieres.push({
        date: currentDate,
        time,
        title,
        location,
        image,
        url: href.startsWith("/") ? "https://teater.ee" + href : href,
      });
    }
  });

  return premieres;
}

async function refreshCache() {
  console.log("Scraping all sources...");
  const results = await Promise.allSettled([
    scrapeArticles(),
    scrapeEvents("tallinn"),
    scrapeEvents("tartu"),
    scrapePremieres(),
  ]);

  if (results[0].status === "fulfilled") cache.articles = results[0].value;
  if (results[1].status === "fulfilled") cache.events.tallinn = results[1].value;
  if (results[2].status === "fulfilled") cache.events.tartu = results[2].value;
  if (results[3].status === "fulfilled") cache.premieres = results[3].value;

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error(`${failed.length} source(s) failed to scrape`);
  }
  console.log("Cache updated");
}

app.get("/api/articles", (req, res) => {
  if (!cache.articles) {
    return res.status(503).json({ error: "Andmed pole veel laetud" });
  }
  res.json(cache.articles);
});

app.get("/api/events", (req, res) => {
  const city = (req.query.city as string) || "tallinn";
  const data = city === "tartu" ? cache.events.tartu : cache.events.tallinn;
  if (!data) {
    return res.status(503).json({ error: "Andmed pole veel laetud" });
  }
  res.json(data);
});

app.get("/api/premieres", (req, res) => {
  if (!cache.premieres) {
    return res.status(503).json({ error: "Andmed pole veel laetud" });
  }
  res.json(cache.premieres);
});

app.listen(PORT, async () => {
  console.log("Server running on http://localhost:" + PORT);
  await refreshCache();
  setInterval(refreshCache, 15 * 60 * 1000);
});
