import express from "express";
import path from "path";
import bodyParser from "body-parser";
import scrapeAmazon from "./scrape.js";
import  validator from "validator";
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", function (req, res, next) {
	res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.get("/api/scrape", async function (req, res, next) {
  const keyword = sanitize(req.query.keyword || ""); //cleaning input
	const asin = validator.escape((req.query.asin || "").trim()); //cleaning input
	if (keyword == "" || asin == "")
		// handling empty inputs
		return res
			.status(400)
			.json(
				"keyword & asin query string are both required, example query: /api/scrape?keyword=hat&asin=1324657fsd"
    );
  
	const data = await scrapeAmazon(keyword, asin, 5);

	if (!data)
		//ajax to amazon went wrong = falsy
		return res
			.status(400)
			.json(
				"something went wrong when scraping Amazon, contact the developer."
			);

	res.json({
		keyword,
		results: data,
	});
});

app.use((req, res) => {
	res.status(404).send("404 Not Found");
});

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}/`);
});

function sanitize(word) {
	let input = decodeURIComponent(word).trim();
	// input = encodeURIComponent(input);
  // input = input.replaceAll("%20", "+").replaceAll("'", "%27");
	return input;
}
