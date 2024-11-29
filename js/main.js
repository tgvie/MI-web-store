import { products } from "./products.js";

// ---------- TARGET HTML PRODUCTS PAGE ----------
const productsPage = document.querySelector("#products-page");

// ---------- PRINT PRODUCTS ----------
products.forEach((item) => {
  productsPage.innerHTML += `
    <article class="product-card">
        <img class="product-image" src="${item.img.url}" alt="${item.img.alt}">
        <h2>${item.name}</h2>
        <h3>${item.category}</h3>
        <p>${item.price} kr</p>
        <p>${item.rating}</p>

        <!-- PLUS-MINUS BUTTONS -->
        <div class="product-buttons" id="product-${item.id}">
          <div class="plus-minus-buttons">
            <button class="minus-btn" data-id="${item.id}" aria-label="Decrease quantity">-</button>
            <span class="plusminus-amount" id="total-${item.id}">0</span>
            <button class="plus-btn" data-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>

          <!-- ADD TO CART BUTTON -->
          <button class="add-cart-btn" data-id="${item.id}">Add to Cart</button>
        </div>
    </article>
    `;
});

// ---------- CLICK-EVENTS WITHIN PRODUCTS CONTAINER ----------
productsPage.addEventListener("click", (e) => {
  // When plus-btn is clicked
  if (e.target.classList.contains("plus-btn")) {
    const productId = e.target.getAttribute("data-id"); //Target product-id
    let totalSum = document.getElementById(`total-${productId}`); //Target html-<span> that displays total count
    let currentTotal = parseInt(totalSum.innerText); //Get the total and convert to number
    totalSum.innerText = currentTotal + 1; //Increase total by 1 and update it visually
  }

  // When minus-btn is clicked
  if (e.target.classList.contains("minus-btn")) {
    const productId = e.target.getAttribute("data-id"); //Target product-id
    let totalSum = document.getElementById(`total-${productId}`); //Target html-<span> that displays total count
    let currentTotal = parseInt(totalSum.innerText); //Get the total and convert to number
    if (currentTotal > 0) { //Decrease total by 1 only if current total is less than 0, so there is no -number
      totalSum.innerText = currentTotal - 1;
    }
  }

  // When Add to Cart button is clicked
  if (e.target.classList.contains("add-cart-btn")) {
    const productId = parseInt(e.target.getAttribute("data-id")); //Get id for which product was clicked and convert it to number
    const productAmount = document.getElementById(`total-${productId}`); //Use the product-id that shows the total of that product
    const currentTotal = parseInt(productAmount.innerText); //Get the current total from HTML element and convert to number, how many user want to add

    if (currentTotal > 0) { //Cannot add if no amount is selected
      addToCart(productId, currentTotal);

      productAmount.innerText = 0; //Reset the amount visually so user knows product has been added
    }
  }
});

let cart = [];

// ---------- TO ADD PRODUCT TO CART ----------
function addToCart(productId, totalAmount) {
  // Search cart-array to see if the product is already in cart
  const productInCart = cart.findIndex((item) => item.id === productId); //Callback function to specify the condition to find the product to add

  // If product is already in cart (if the returned index from Ln 68 is 0 or higher)
  if (productInCart > -1) {
    cart[productInCart].amount += totalAmount; //Update its amount
  }

  // Else if product not already in cart, add it
  else {
    const addProduct = products.find((item) => item.id === productId); //Find in products-array the item(id) to add
    
    if (addProduct) {
      // If found, add product to cart
      cart.push({ ...addProduct, amount: totalAmount }); //... operator to duplicate the object(product) to visiually add its info to the cart
    }
  }

  popupCartUpdated();

  updateOrderSummary();
}

function popupCartUpdated() {
  const popup = document.getElementById('cartUpdatedPopup');
  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 2000);
}

// ---------- UPDATE ORDER SUMMARY VISUALLY ----------//
function updateOrderSummary() {
  const orderSummary = document.querySelector("#order-summary");

  orderSummary.innerHTML = "<h2>Order Summary</h2>";

  if (cart.length === 0) { //If no items in cart
    orderSummary.innerHTML += "<p>Your cart is empty.</p>";
    return;
  }

  cart.forEach((item) => {
    orderSummary.innerHTML += `
        <div class="order-item">
          <p>${item.amount} x ${item.name} - ${item.price * item.amount} kr</p>
        </div>
      `;
  });
}

// ---------- SORTING PRODUCTS ----------
function sortProducts(sortCriteria) {
  products.sort((item1, item2) => {
    // Sort both name and category (strings) alphebetically
    if (sortCriteria === "name" || sortCriteria === "category") {
      if (item1[sortCriteria].toLowerCase() < item2[sortCriteria].toLowerCase())
        return -1; //If item1's criteria is alphabetically less than item2's, place item1 before item2 in the sorted array

      if (item1[sortCriteria].toLowerCase() > item2[sortCriteria].toLowerCase())
        return 1; //If item1's criteria is alphabetically greater than item2's, place item1 after item2 in the sorted array

      return 0; //Items are equal in sorting, remains unchanged
    }

    // Sort price from low to high
    else if (sortCriteria === "price") {
      return item1[sortCriteria] - item2[sortCriteria];
    }

    // Sort rating from high to low
    else if (sortCriteria === "rating") {
      return item2[sortCriteria] - item1[sortCriteria];
    }
  });

  reorganizeProducts();
}

// ---------- REORGANIZE PRODUCTS ORDER AFTER SORTING ----------
function reorganizeProducts() {
  // Visually remove original order to replace with sorted one
  productsPage.innerHTML = ""; 

  // Print sorted one
  products.forEach((item) => {
    productsPage.innerHTML += `
      <article class="product-card">
        <img class="product-image" src="${item.img.url}" alt="${item.img.alt}">
        <h2>${item.name}</h2>
        <h3>${item.category}</h3>
        <p>${item.price} kr</p>
        <p>${item.rating}</p>

        <!-- PLUS-MINUS BUTTONS -->
        <div class="product-buttons" id="product-${item.id}">
          <div class="plus-minus-buttons">
            <button class="minus-btn" data-id="${item.id}" aria-label="Decrease quantity">-</button>
            <span class="plusminus-amount" id="total-${item.id}">0</span>
            <button class="plus-btn" data-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>

          <!-- ADD TO CART BUTTON -->
          <button class="add-cart-btn" data-id="${item.id}">Add to Cart</button>
        </div>
      </article>
    `;
  });
}

// ---------- CLICK-EVENTS FOR SORT BUTTONS ----------
const sortButtons = document.querySelectorAll(".sort-btn");

sortButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    switch (index) {
      case 0: //First button
        sortProducts("name");
        break;
      case 1: //Second button
        sortProducts("price");
        break;
      case 2: //Third button
        sortProducts("category");
        break;
      case 3: //Fourth button
        sortProducts("rating");
        break;
    }
  });
});

// ---------- CLICK-EVENTS FOR CART & TOP BUTTONS ----------
document.addEventListener('DOMContentLoaded', () => {
  const goTopBtn = document.getElementById('goTopBtn');
  const goCartBtn = document.getElementById('goCartBtn');

  // Scroll to cart button
  goCartBtn.addEventListener('click', () => {
    window.scrollTo(0, 8300);
    /*const orderSummary = document.getElementById('order-summary');
      orderSummary.scrollIntoView(); 
      This was better but being covered by header on phone screens*/
  });

  // Scroll to top button
  goTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});