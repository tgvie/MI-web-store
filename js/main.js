import { products } from "./products.js";

// ---------- TARGET HTML PRODUCTS PAGE ----------
const productsPage = document.querySelector("#products-page");

/*
 * PRINT PRODUCTS
 ** for each object in the array
 ** create corresponding HTML-elements
*/
products.forEach((item) => {
  productsPage.innerHTML += `
    <article class="item-card">
        <img src="${item.img.url}" alt="${item.img.alt}">
        <h2>${item.name}</h2>
        <h3>${item.category}</h3>
        <p>${item.price} kr</p>
        <p>${item.rating}</p>

        <!-- PLUS-MINUS BUTTONS -->
        <div class="plus-minus-btn" id="product-${item.id}">
            <button class="minus-btn" data-id="${item.id}" aria-label="Decrease quantity">-</button>
            <span id="total-${item.id}">0</span>
            <button class="plus-btn" data-id="${item.id}" aria-label="Increase quantity">+</button>
        </div>

        <!-- ADD TO CART BUTTON -->
        <button class="add-cart-btn" data-id="${item.id}">Add to Cart</button>
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
    if (currentTotal > 0) {
      //Decrease total by 1 only if current total is less than 0, so there is no -number
      totalSum.innerText = currentTotal - 1;
    }
  }

  // When Add to Cart button is clicked
  if (e.target.classList.contains("add-cart-btn")) {
    const productId = parseInt(e.target.getAttribute("data-id")); //Get id for which product was clicked and convert it to number
    const productAmount = document.getElementById(`total-${productId}`); //Use the product-id that shows the total of that product
    const currentTotal = parseInt(productAmount.innerText); //Get the current total from HTML element and convert to number, how many user want to add

    if (currentTotal > 0) { //Only triggers if there are more than 0 item
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

  if (productInCart > -1) { //If product is already in cart (if the returned index from Ln 73 is 0 or higher)
    cart[productInCart].amount += totalAmount; //Update its amount
  }

  // Else if product not in cart, add it
  else {
    const addProduct = products.find((item) => item.id === productId); //Find in products-array the item(id) to add
    if (addProduct) {
      // If found, add product to cart
      cart.push({ ...addProduct, amount: totalAmount }); //... operator to duplicate the object(product) to visiually add its info to the cart
    }
  }

  updateOrderSummary(); 
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
