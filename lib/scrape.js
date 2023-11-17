import axios from "axios/dist/node/axios.cjs"; 
import cheerio from "cheerio";
const TARGET_URL = "https://www.amazon.com/";
const QUERY_URL = "https://www.amazon.com/s?k=";

const PRODUCTION_HEADERS = {
	headers: {
		"User-Agent":
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
		Accept: "text/html",
		Referer: "https://www.amazon.com/",
		"Accept-Encoding": "gzip, deflate",
		"X-Requested-With": "XMLHttpRequest",
		"Cache-Control": "no-cache",
	},
};

const LOCAL_HEADERS = {
	headers: {
		"User-Agent":
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
		Referer: "http://www.amazon.com",
		Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
		"Accept-Language": "en-US,en;q=0.5",
		"Accept-Encoding": "gzip,deflate",

		Connection: "keep-alive",
		Cookie: "PHPSESSID=123456789098764546879879498",
		Authorization: "Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==",
	},
};

const SELECTORS = {
	//after inspecting the page
	products: "[data-component-type=s-search-result]",
	title:
		"a.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal span.a-color-base.a-text-normal",
	rating: "span.a-icon-alt",
	reviews: "span.a-size-base.s-underline-text",
	image: "img.s-image",
	link: "a:first",
};

const HEADERS =
	process.env.APP_ENV == "prod" ? PRODUCTION_HEADERS : LOCAL_HEADERS;
async function fetchAmazonPage(keyword, page = 1) {
	try {
		const full_url = `${QUERY_URL + keyword}&page=${page}&ref=sr_pg_${page}`;
		let res = await axios.get(full_url, HEADERS);
		return res; //return false to test amazon error response
	} catch (err) {
		console.log(err);
		return false;
	}
}

function constructProducts($, productDivs) {
	const products = [];
	productDivs.each((index, productDiv) => {
		let position = index + 1;
		products[index] = {
			page_position: position,

			asin: $(productDiv).attr("data-asin"),

			title: $(productDiv).find(SELECTORS.title).text(),

			rating: $(productDiv).find(SELECTORS.rating).text(),

			reviews: $(productDiv).find(SELECTORS.reviews).text(),

			image: $(productDiv).find(SELECTORS.image).attr("src"),

			link: TARGET_URL + $(productDiv).find(SELECTORS.link).attr("href"),
		};
	});
	return products;
}

function searchTarget(asin, page) {
	let targetProduct;
	for (const [index, product] of Object.entries(page)) {
		process.stdout.write(".");
		for (const [key, value] of Object.entries(product)) {
			if (value == asin && key == "asin") {
				targetProduct = product;
			}
		}
	}
	if (targetProduct) return targetProduct;
	return false;
}

async function scrapeAmazon(keyword, asin, maxPage = 5) {
	console.log(`
  A   SSS  EEEEE
 A A  S    E
AAAA   SSS  EEEE
A   A      E
A   A  SSS EEEEE
  `);
	let pages = [];
	let productsTotal = 0;
	var targetProduct;

	for (let index = 0; index < maxPage; index++) {
		// operation per page until product found
		let page = index + 1;

		let response = await fetchAmazonPage(keyword, page);

		if (!(response.status >= 200 && response.status < 300)) continue; // if something went wrong go next page

		const $ = cheerio.load(await response.data);

		const productDivs = $(SELECTORS.products);

		pages[index] = constructProducts($, productDivs);

		targetProduct = searchTarget(asin, pages[index]);

		if (targetProduct) {
			targetProduct = {
				overall_position: targetProduct["page_position"] + productsTotal,
				page,
				...targetProduct,
			};
			console.log(`\nTarget found !\n`);
			console.log(targetProduct);
			break;
		}
		productsTotal += pages[index].length;

		console.log(
			`\n Page ${page} scraped with ${pages[index].length} products, target not found`
		);
		await new Promise((resolve) =>
			setTimeout(resolve, 500 - Math.random() * 200)
		); //sleeping randomly to avoid requesting amazon too fast, sleeping can contribute to success
	}

	let data = {
		targetProduct,
		pages,
	};

	return data;
}

export default scrapeAmazon;
