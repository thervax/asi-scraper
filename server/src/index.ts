import express from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
const PORT = 3001;

app.use(cors());

app.get("/api/articles", async (req, res) => {
  try {
    const archivePage = await axios.get("https://www.sirp.ee/veebiarhiiv/");
    const $ = cheerio.load(archivePage.data);

    const issueLinks: Array<{ url: string; date: string }> = [];
    $("a.issue-link").each((_i, el) => {
      const url = $(el).attr("href") || "";
      const date = $(el).text().trim();
      if (url) issueLinks.push({ url, date });
    });

    const latest3 = issueLinks.slice(0, 3);

    const issues = await Promise.all(
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

    res.json(issues);
  } catch (err) {
    console.error("Failed to fetch articles:", err);
    res.status(500).json({ error: "Artiklite laadimine ebaõnnestus" });
  }
});

app.get("/api/events", async (req, res) => {
  const city = (req.query.city as string) || "tallinn";
  const url = `https://www.kultuurikava.ee/api/?do=events&lang=nat&city=${city}&order=starta&start=0&limit=30&format=json&showall=false&alltimes=true&ignoremuuseums=true`;

  try {
    const { data } = await axios.get(url);
    const rawEvents = data.data.events;

    const events = rawEvents.map((e: any) => ({
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

    res.json(events);
  } catch (err) {
    console.error("Failed to fetch events:", err);
    res.status(500).json({ error: "Ürituste laadimine ebaõnnestus" });
  }
});

const PREMIERES_URL =
  "https://teater.ee/teatriinfo/mangukava/?f%5Bname_or_tag%5D=&f%5Bperformance_time_start%5D=&f%5Bperformance_time_end%5D=&f%5Btheaters%5D=&f%5Bvenue_id%5D=&f%5Baccessibility%5D=&f%5Bpremiere%5D=1";

app.get("/api/premieres", async (req, res) => {
  try {
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

    res.json(premieres);
  } catch (err) {
    console.error("Failed to fetch premieres:", err);
    res.status(500).json({ error: "Esietenduste laadimine ebaõnnestus" });
  }
});

app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});
