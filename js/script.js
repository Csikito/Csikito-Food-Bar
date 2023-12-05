/***************************** CONSTANTS ***********************************/
const foodBar = document.querySelector(".js-food-bar");
const category = document.querySelector(".js-category");
const contact = document.querySelector(".js-contact");

const randomMealContainer = document.querySelector(".js-randomMealContainer");
const randomMealInfo = document.querySelector(".js-random__meal__info");

const categoryContainer = document.querySelector(".js-categoryContainer");
const mealContainer = document.querySelector(".js-mealContainer");
const contactContainer = document.querySelector(".js-contactContainer");

let categories = null;
let id = null;

/*****Pagination*****/
const paginationContainer = document.querySelector(".js-pagination");
let current_page = 1;
let rows = 6;

/*************************************************** FUNCTION *******************************************************/

/***************** Random meal *************/
function showMealInfo(mealData) {
  randomMealInfo.innerHTML = "";
  randomMealInfo.innerHTML = renderMealDetails(mealData);

  randomMealContainer.classList.add("hidden");
  randomMealInfo.classList.remove("hidden");
}

function fetchRandomMeal() {
  return fetch(`https://www.themealdb.com/api/json/v1/1/random.php`).then(
    (response) => response.json()
  );
}

function randomMeal() {
  if (!randomMealInfo.classList.contains("hidden")) {
    randomMealInfo.classList.add("hidden");
  }
  randomMealContainer.classList.remove("hidden");
  contactContainer.classList.add("hidden");
  categoryContainer.innerHTML = "";
  mealContainer.innerHTML = "";
  paginationContainer.innerHTML = "";

  fetchRandomMeal().then(renderRandomMeal);
}

/***************** Category *****************/

function displayCategory() {
  current_page = 1;
  randomMealContainer.innerHTML = "";
  mealContainer.innerHTML = "";
  paginationContainer.innerHTML = "";
  categoryContainer.innerHTML = categories
    .map((category) => renderCategory(category))
    .join("");
}

function fetchCategory() {
  return fetch("https://www.themealdb.com/api/json/v1/1/categories.php")
    .then((res) => res.json())
    .then((data) => {
      categories = data.categories;
    });
}

function loaderCategory() {
  categoryContainer.classList.remove("hidden");
  paginationContainer.classList.remove("hidden");
  randomMealContainer.classList.add("hidden");
  contactContainer.classList.add("hidden");
  if (randomMealInfo !== "hidden") {
    randomMealInfo.classList.add("hidden");
  }

  if (categories === null) {
    fetchCategory().then(displayCategory);
  } else {
    displayCategory();
  }
}

/*************** Select meal for the category list **************/

function isPromiseFulfilled(response) {
  return (response) => response.status === "fulfilled";
}

function displayMealDetails(mealResponse) {
  mealContainer.innerHTML = mealResponse
    .filter(isPromiseFulfilled)
    .map((response) => response.value.meals[0])
    .map((meal) => renderMeal(meal))
    .join("");

  const mealItem = document.querySelectorAll(".js-meal-item");
  mealItem.forEach((item) =>
    item.addEventListener("click", (e) => {
      categoryContainer.classList.add("hidden");
      paginationContainer.classList.add("hidden");

      const id = e.target.dataset.id || e.target.parentElement.dataset.id;
      mealContainer.innerHTML = mealResponse
        .filter(isPromiseFulfilled)
        .map((response) => response.value.meals[0])
        .filter((items) => items.idMeal === id)
        .map((item) => renderMealDetails(item));
    })
  );
}

function displayList(items, rows_per_page, page) {
  page--;

  let start = rows_per_page * page;
  let end = start + rows_per_page;
  let paginatedItems = items.slice(start, end);
  return paginatedItems;
}

function nextPageLoaderMeal(meals, rows, current_page) {
  const mealList = displayList(meals, rows, current_page);
  let mealPromiseList = mealList.map((meal) =>
    fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
    ).then((res) => res.json())
  );
  Promise.allSettled(mealPromiseList).then(displayMealDetails);
}

function PaginationButton(page, items) {
  let button = document.createElement("button");
  button.innerText = page;
  if (current_page == page) button.classList.add("active");
  button.addEventListener("click", () => {
    current_page = page;
    nextPageLoaderMeal(items, rows, page);
    window.scrollTo(0, 550);
    let current_btn = document.querySelector(".pagination button.active");
    current_btn.classList.remove("active");
    button.classList.add("active");
  });
  return button;
}

function setupPagination(items, rows_per_page) {
  paginationContainer.innerHTML = "";
  let page_count = Math.ceil(items.length / rows_per_page);
  if (page_count > 1) {
    for (let i = 1; i <= page_count; i++) {
      let btn = PaginationButton(i, items);
      paginationContainer.appendChild(btn);
    }
  }
}

function loaderMeal(response) {
  let meals = response.meals;
  setupPagination(meals, rows);
  nextPageLoaderMeal(meals, rows, current_page);
}

function fetchMealList(meal) {
  let filterMeal = meal[0].strCategory;
  return fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?c=${filterMeal}`
  ).then((response) => response.json());
}

function categoryById(id) {
  return categories.filter((category) => category.idCategory === id);
}

function clickCategory(e) {
  const id = e.target.dataset.id || e.target.parentElement.dataset.id;
  if (id === undefined) {
    return;
  }
  if (id === "all") {
    return displayCategory();
  }
  let currentCategory = categoryById(id);
  categoryContainer.innerHTML = ` ${renderCategory(currentCategory[0], true)}
                            <button class="btn" data-id="all">Back to Category</button>
  `;
  fetchMealList(currentCategory).then(loaderMeal);
}

/************************* Contact ***********************/
function clickContact() {
  randomMealContainer.innerHTML = "";
  mealContainer.innerHTML = "";
  categoryContainer.innerHTML = "";
  paginationContainer.innerHTML = "";
  randomMealContainer.classList.add("hidden");
  randomMealInfo.classList.add("hidden");
  let data = contactContainer.classList[contactContainer.classList.length - 1];
  if (data == "hidden") {
    contactContainer.classList.remove("hidden");
  }
}

/************************************************** RENDER ************************************************************/

function renderRandomMeal(mealData) {
  randomMealContainer.innerHTML = `
 
  <div class="meal__random frontMealContainer js-frontMealContainer is-flipped">
    <div>
      <h2>Let's see what you will cook today.</h2>
      <img
      src="./images/card_question.png"
      alt="card_question"
      />
    </div>
    </div>
  <div class="meal__random backMealContainer js-backMealContainer">
    <h2>${mealData.meals[0].strMeal}</h2>  
      <img
        src="${mealData.meals[0].strMealThumb}"
        alt="${mealData.meals[0].strMeal}"
      /> 
      <button class="btn js-show__recipe">Show recipe</button>
    </div>
    
    
  `;

  /** Card flipped **/
  const frontCard = document.querySelector(".js-frontMealContainer");
  const backCard = document.querySelector(".js-backMealContainer");

  randomMealContainer.addEventListener("click", () => {
    frontCard.classList.remove("is-flipped");
    frontCard.lastElementChild.classList.add("is-spinning");
    backCard.classList.add("is-flipped");
  });

  backCard.addEventListener("click", () => {
    showMealInfo(mealData.meals[0]);
  });
}

function renderCategory(category, wide = false) {
  if (wide === true) {
    categoryContainer.classList.add("wide");
  } else {
    categoryContainer.classList.remove("wide");
  }
  return `
            <div class="category-item js-category-item  ${
              wide === true ? "wide" : ""
            }" 
  data-id="${category.idCategory}">
            <h2>${category.strCategory}</h2>
            <img src="${category.strCategoryThumb}" alt="${
    category.strCategory
  }" />
  
            <p>${category.strCategoryDescription}</p>
            </div>
    `;
}

function renderIngredient(data) {
  let html = "<ul>";
  for (let i = 1; i < 20; ++i) {
    let ingredient = data["strIngredient" + i];
    let measure = data["strMeasure" + i];
    if (typeof ingredient === "string" && ingredient.length > 0) {
      html += `<li>${ingredient}(${measure})</li>`;
    }
  }
  html += "</ul>";
  return html;
}

function renderMealDetails(meal) {
  const ingredient = renderIngredient(meal);
  const video = meal.strYoutube
    ? `<a class="youtube__btn" href="${meal.strYoutube}" target="_blank">[<i class="ri-youtube-line"></i>]</a>`
    : "";
  return `
  <div class="random__meal__item">
  <div class="ingredient">
   <div class ="left__side">
       <h2>${meal.strMeal} ${video} </h2>
       <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
       </div>
       <div class ="right__side"> 
       <h3>Ingrediets</h3>
       ${ingredient}
    
   </div>
 </div>
 <div class="instructions"> 
   <h3>Instructions</h3>
   <p>${meal.strInstructions}</p>
 </div>
</div>    

        `;
}

function renderMeal(meal) {
  return `
        <div class="meal-item js-meal-item" data-id="${meal.idMeal}">
          <h2>${meal.strMeal}</h2>
       
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
       
        </div>

        `;
}

/************************************************ ADD EVENT LISTENER  ***************************************************/
foodBar.addEventListener("click", randomMeal);
category.addEventListener("click", loaderCategory);
categoryContainer.addEventListener("click", clickCategory);
contact.addEventListener("click", clickContact);
randomMeal();
