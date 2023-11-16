import express from "express";
import path from "path";
import bodyParser from "body-parser";
import scrapeAmazon from "./scrape.js";
import validator from "validator";

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", function (req, res, next) {
	res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.get("/api/scrape", async function (req, res, next) {
	const keyword = validator.escape("" + req.query.keyword).trim(); //cleaning input
	const asin = validator.escape("" + req.query.asin).trim(); //cleaning input
	if (!keyword || !asin)
		return res
			.status(400)
			.json(
				"keyword query string required, example query: /api/scrape?keyword=hat"
			);

  const data = await scrapeAmazon(keyword,asin,5);
    

		if (!data)
			//ajax to amazon went wrong= falsy
			return res
				.status(400)
				.json(
					"something went wrong when scraping Amazon, contact the developer."
				);

		res.json({
			keyword,
			data,
		});

});

app.use((req, res) => {
	res.status(404).send("404 Not Found");
});

app.listen(PORT, () => {
	console.log(`Server running at http://127.0.0.1:${PORT}/`);
});
