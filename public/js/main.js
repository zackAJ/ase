const APi_URL = "/api/scrape?keyword=";
const keywordInput = document.getElementById("keyword");
const asinInput = document.getElementById("asin");
const searchBtn = document.getElementById("searchBtn");
const errorDiv = document.getElementById("error");
const targetDiv = document.getElementById("target");
const pagesDiv = document.getElementById("pages");
async function search(event) {
	load(true);
	//empty the previous results
	targetDiv.replaceChildren();
	pagesDiv.replaceChildren();

	let keyword = encodeURIComponent(keywordInput.value.trim());
	let asin = asinInput.value.trim();
	event.preventDefault();

	try {
		let res = await fetch(apiUrl(keyword, asin));

		// if server validation fails || error || failed to scrape ...
		if (!(res.status >= 200 && res.status < 300))
			throw new Error(res.statusText);

		const data = await res.json();

		// try it using this slfdjsldk sdf987f9sd8f ds8f79 sd87sd9f87 s9d8f7s
		if (
			!data.results.targetProduct &&
			!data.results.pages[data.results.pages.length - 1].length
		)
			return alertUser("no products found !");

		//render result
		renderResult(data);
	} catch (err) {
		console.log(err);
		alertUser(); //display error message to the user
	} finally {
		//remove loader in all cases
		load(false);
	}
}

function renderResult(data) {
	let target = data.results.targetProduct;
	let pages = data.results.pages;
	if (target) {
		//target found, show position
		targetDiv.innerHTML = `
      <div class="position mb-4 w-auto">
            <div class="pos-item text-bg-secondary">
              <h5>Page</h5>
              <p class="val">${target.page}</p>
            </div>
            <div class="pos-item text-bg-dark">
              <h5>Page Position</h5>
              <p class="val">${target.page_position}</p>
            </div>
            <div class="pos-item bg-black">
              <h5>Overall Position</h5>
              <p class="val">${target.overall_position}</p>
            </div>
          </div>
  
          <img
            src="${target.image}"
            class="img-fluid rounded-start mb-4 mx-auto"
            alt="..."
            style="align-self: center; max-width: 200px; max-height: 200px"
          />
  
          <div class="info mb-4">
            <div class="resCol">
              <p class="property">ASIN:</p>
              <p class="val">${target.asin}</p>
            </div>
            <div class="resCol">
              <p class="property">title:</p>
              <p class="val">
                ${target.title}
              </p>
            </div>
            <div class="resCol">
              <p class="property">rating:</p>
              <p class="val">${target.rating}</p>
            </div>
            <div class="resCol">
              <p class="property">reviews:</p>
              <p class="val">${target.reviews}</p>
            </div>
          </div>
      `;
	} else {
		//target not found, try this by using jibrish ASIN
		targetDiv.innerHTML = `<h1>product not found in top 5 pages of Amazon</h1>`;
	}

	pages.forEach((page, index) => {
		// loop and render pages
		let targetPage = false;
		if (index + 1 == target.page) {
			targetPage = true;
		}

		let pageDiv = renderPage(index + 1, page, target, targetPage);

		let h2 = document.createElement("h2");
		h2.innerHTML = `Page ${index + 1} <span class="tag">${
			page.length
		} products</span> ${
			targetPage ? '<span class="tag targetTag">Target Page</span>' : ""
		}`;
		pagesDiv.prepend(pageDiv);
		pagesDiv.prepend(h2);
	});
}

function renderPage(pageNum, page, target, targetPage) {
	let pageDiv = document.createElement("div");
	pageDiv.classList.add("page");

	page.forEach((product) => {
		// loop and render products
		let targetProd = false;
		if (targetPage && target.asin == product.asin) {
			targetProd = true;
		}
		let productCard = renderProduct(product, targetProd);
		pageDiv.appendChild(productCard);
	});

	return pageDiv;
}

function renderProduct(product, targetProd = false) {
	let card = document.createElement("div");
	card.setAttribute("class", `card prodCard ${targetProd ? "targetProd" : ""}`);
	card.innerHTML = `
					<div 
          class="d-flex justify-content-center align-items-center" 
             style="width:100%;height: 170px;"
          >
            <img src="${product.image}"
              style="max-width: 200px;max-height: 170px;"
              alt=""
            />
          </div>
<div class="d-flex flex-column p-2 gap-1">
  <p class="p-0 m-0">ASIN : ${product.asin}</p>
  <p class="p-0 m-0 prodTitle">${product.title}</p>
  <p class="p-0 m-0">${product.rating}</p>
  <p class="p-0 m-0">reviews: ${product.reviews}</p>
  <a href="${product.link}" target="_blank" class="link">link</a>
</div>
  `;
	return card;
}
//loader
function load(toggle) {
	if (toggle) {
		searchBtn.innerHTML = "<img  src='/images/loader.svg' class='h-full' />";
		searchBtn.setAttribute("disabled", "true");
	} else {
		searchBtn.textContent = "Search";
		searchBtn.removeAttribute("disabled");
	}
}
//helper to display modal for feedback
function alertUser(message = "an Error has occured, please try again later") {
	errorDiv.classList.remove("hidden");
	errorDiv.textContent = message;
	setTimeout(() => {
		errorDiv.classList.add("hidden");
	}, 3000);
}
//helper
function apiUrl(keyword, asin) {
	return `${APi_URL + keyword}&asin=${asin}`;
}
