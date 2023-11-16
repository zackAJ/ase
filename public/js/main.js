const APi_URL = "/api/scrape?keyword=";
const keywordInput = document.getElementById("keyword");
const asinInput = document.getElementById("asin");
const resultsDiv = document.getElementById("results");
const searchBtn = document.getElementById("searchBtn");
const errorDiv = document.getElementById("error");

async function search(event) {
	load(true);
	resultsDiv.replaceChildren();//empty the previous results
	let keyword = keywordInput.value.trim();
	event.preventDefault();

  try {
    
    let res = await fetch(APi_URL + keyword);
    
		if (!(res.status >= 200 && res.status < 300))
			throw new Error(res.statusText);

		const data = await res.json();

		//if (!data.pages.length) alertUser("no products found !");//test this by searching jibrish
    
		renderProducts(data);

	} catch (err) {
		console.log(err);
		alertUser();//display error message to the user
  } finally {//remove loader in all cases
    load(false);
  }
}

//display products on the screen
function renderProducts(data) {
  for (const [index,page] of Object.entries(data.pages) ) {
    const h2 = document.createElement("h2");
    h2.setAttribute("class", "w-full");
		h2.innerHTML = `Total Products on page:
  <span class="font-bold text-[var(--amazon-gold)]" >${page.length}</span>`;
    resultsDiv.append(h2)
		page.forEach((product) => {
			const productCard = document.createElement("a");
			productCard.setAttribute(
				"class",
				"bg-white w-[20rem]  rounded overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transform-gpu transition-transform cursor-pointer p-3 flex flex-col justify-between h-[420px]"
			);
			productCard.setAttribute("href", product.link);
			productCard.setAttribute("target", "_blank");

			const image = document.createElement("img");
			image.setAttribute("class", "h-[200px] mx-auto");
			image.src = `${product.image}`;
			image.alt = `${product.title.substring(0, 15)}`; //clever me :)

			const details = document.createElement("div");
			details.setAttribute("class", "px-6 py-4");
			const starsWidth = (parseFloat(product.rating.slice(0, 3)) * 110) / 5; //5 stars width=110px, hidding the overflow
			details.innerHTML = `
      <h2 class="font-bold text-xl mb-2 overflow-hidden line-clamp-3 box-orient-vertical ">${
				product.title
			}</h2>
        <div class="text-gray-700 text-base flex gap-2">

            <span
            class="text-yellow-500 !max-w-[${starsWidth || "0"}px]
             overflow-hidden ${starsWidth ? "inline-block" : "hidden"} ">
             ⭐⭐⭐⭐⭐
             </span>
            <span class="block font-bold">${
							product.rating.slice(0, 3) || "No"
						} Stars</span>
        </div>

        <div class="text-sm mt-8">${product.reviews || "no"} reviews</div>
    `;
			productCard.append(image, details);
			resultsDiv.appendChild(productCard);
		});
	};
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
	errorDiv.textContent=message;
	setTimeout(() => {
		errorDiv.classList.add("hidden");
	}, 3000);
}
