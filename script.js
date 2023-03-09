/***********SHOW MENU************/
const navMenu = document.querySelector(".js-nav__menu");
const navToggle = document.querySelector(".js-nav__toggle");
const navClose = document.querySelector(".js-nav__close");
const navMenuObject = navMenu.children[0].children;
const navMenuArray = Object.values(navMenuObject);

navToggle.addEventListener("click", () => {
  navMenu.classList.add("show__menu");
});
navClose.addEventListener("click", () => {
  navMenu.classList.remove("show__menu");
});
navMenuArray.forEach((e) => {
  e.addEventListener("click", () => {
    navMenu.classList.remove("show__menu");
  });
});

/************************************************************************/
const randomMealContainer = document.querySelector(".js-randomMealContainer");
const mealPopup = document.querySelector(".js-popup-container");
const closePopup = document.querySelector(".js-close-popup");
const contact = document.querySelector(".js-contact");
const contactContainer = document.querySelector(".js-contactContainer");
const footer = document.querySelector(".js-footer");

const randomMealInfo = document.querySelector(".js-random__meal__info");
const categoryContainer = document.querySelector(".js-categoryContainer");
const mealContainer = document.querySelector(".js-mealContainer");
const foodBar = document.querySelector(".js-food-bar");
const category = document.querySelector(".js-category");

const paginationContainer = document.querySelector(".js-pagination");

let categories = null;
let id = null;
let current_page = 1;
let rows = 5;

/***************** RANDOM MEAL *****************/

function showMealInfo(mealData) {
  randomMealInfo.innerHTML = "";

  const ingredients = [];
  //get ingredients and measures
  for (let i = 1; i <= 20; i++) {
    if (mealData["strIngredient" + i]) {
      ingredients.push(
        `${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`
      );
    } else {
      break;
    }
  }

  randomMealInfo.innerHTML = `
   
      <h1>${mealData.strMeal}</h1>
      <img
        src="${mealData.strMealThumb}"
        alt="${mealData.strMeal}"
      />
      <h3>Instructions</h3>
      <p>
      ${mealData.strInstructions}
      </p>
      <h3>Ingrediets</h3>
      <ul>
        ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
      </ul>
    
     `;
  //show the popup
  mealPopup.classList.remove("hidden");
}

closePopup.addEventListener("click", () => {
  mealPopup.classList.add("hidden");
});

function fetchRandomMeal() {
  return fetch(`https://www.themealdb.com/api/json/v1/1/random.php`).then(
    (response) => response.json()
  );
}

function randomMeal() {
  contactContainer.classList.add("hidden");
  footer.classList.add("random");
  categoryContainer.innerHTML = "";
  mealContainer.innerHTML = "";
  paginationContainer.innerHTML = "";

  fetchRandomMeal().then(addMeal);
}

function addMeal(mealData) {
  randomMealContainer.innerHTML = `
  <div class="meal__random">
  <h2>Random Meal</h2>  
      <img
        src="${mealData.meals[0].strMealThumb}"
        alt="${mealData.meals[0].strMeal}"
      />
    </div>
    <div class="meal__text">
      <h4>${mealData.meals[0].strMeal}</h4>
    </div>
  `;
  randomMealContainer.addEventListener("click", () => {
    showMealInfo(mealData.meals[0]);
  });
}

/***************** MEAL *****************/
function renderCategory(category, wide = false) {
  if (wide === true) {
    categoryContainer.classList.add("wide");
  } else {
    categoryContainer.classList.remove("wide");
  }
  return `
            <div class="category-item  ${wide === true ? "wide" : ""}" 
  data-id="${category.idCategory}">
            <h2>${category.strCategory}</h2>
            <img src="${category.strCategoryThumb}" alt="${
    category.strCategory
  }" />
  
            <p>${category.strCategoryDescription}</p>
            </div>
    `;
}
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
  /***Kérdés hogy mért kell Promis ide?? amikor a return-al is promist kapunk vissza***/
}

function loaderCategory() {
  contactContainer.classList.add("hidden");
  footer.classList.remove("random");
  if (mealPopup !== "hidden") {
    mealPopup.classList.add("hidden");
  }

  if (categories === null) {
    fetchCategory().then(displayCategory);
  } else {
    displayCategory();
  }
}

/***********************************************************************************************/

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

function renderMeal(meal) {
  const ingredient = renderIngredient(meal);
  return `
        <div class="meal-item">
        <h2>${meal.strMeal}</h2>
        <div>
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
        </div>
        <h3>Instructions</h3>
        <p>${meal.strInstructions}</p>
        <h3>Ingrediets</h3>
            ${ingredient}
        </div>
        
        
        
        `;
}

function isPromiseFulfilled(response) {
  return (response) => response.status === "fulfilled";
}

function displayMealDetails(mealResponse) {
  mealContainer.innerHTML = mealResponse
    .filter(isPromiseFulfilled)
    .map((response) => response.value.meals[0])
    .map((meal) => renderMeal(meal))
    .join("");
}
/************************ Pagination ********************************/

function setupPagination(items, wrapper, rows_per_page) {
  wrapper.innerHTML = "";

  let page_count = Math.ceil(items.length / rows_per_page);
  for (let i = 1; i < page_count + 1; i++) {
    let btn = PaginationButton(i, items);
    wrapper.appendChild(btn);
  }
}

function PaginationButton(page, items) {
  let button = document.createElement("button");
  button.innerText = page;
  if (current_page == page) button.classList.add("active");
  button.addEventListener("click", () => {
    current_page = page;
    nextPageLoaderMeal(items, rows, page);
    window.scrollTo(0, 550);
    //scrollUp();
    let current_btn = document.querySelector(".pagination button.active");
    current_btn.classList.remove("active");
    button.classList.add("active");
  });
  return button;
}

function scrollUp() {}

function nextPageLoaderMeal(meals, rows, current_page) {
  const mealList = displayList(meals, rows, current_page);
  let mealPromiseList = mealList.map((meal) =>
    fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
    ).then((res) => res.json())
  );
  Promise.allSettled(mealPromiseList).then(displayMealDetails);
}

function displayList(items, rows_per_page, page) {
  page--;

  let start = rows_per_page * page;
  let end = start + rows_per_page;
  let paginatedItems = items.slice(start, end);
  return paginatedItems;
}

function loaderMeal(response) {
  let meals = response.meals;
  const mealList = displayList(meals, rows, current_page);
  setupPagination(meals, paginationContainer, rows);
  /*****************************
   const mealList = response.meals.slice(0, 4);
   * **************************/
  let mealPromiseList = mealList.map((meal) =>
    fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
    ).then((res) => res.json())
  );
  /*********ÁTNÉZNIII****/ //
  Promise.allSettled(mealPromiseList).then(displayMealDetails);
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

/***********************************************************************************************/
function clickContact() {
  randomMealContainer.innerHTML = "";
  mealContainer.innerHTML = "";
  categoryContainer.innerHTML = "";
  paginationContainer.innerHTML = "";
  let data = contactContainer.classList[contactContainer.classList.length - 1];
  if (data == "hidden") {
    contactContainer.classList.remove("hidden");
  }
}

/************/
categoryContainer.addEventListener("click", clickCategory);
category.addEventListener("click", loaderCategory);
foodBar.addEventListener("click", randomMeal);
contact.addEventListener("click", clickContact);
randomMeal();
