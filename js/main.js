import { products } from "./products.js";
import { inputRegex } from "./regex.js";

function getRatingEmoji(rating) {
  if (rating === 1) return "🌕🌑🌑🌑🌑";
  if (rating === 1.5) return "🌕🌗🌑🌑🌑";
  if (rating === 2) return "🌕🌕🌑🌑🌑";
  if (rating === 2.5) return "🌕🌕🌗🌑🌑";
  if (rating === 3) return "🌕🌕🌕🌑🌑";
  if (rating === 3.5) return "🌕🌕🌕🌗🌑";
  if (rating === 4) return "🌕🌕🌕🌕🌑";
  if (rating === 4.5) return "🌕🌕🌕🌕🌗";
  if (rating === 5) return "🌕🌕🌕🌕🌕";
}

// -------------------------------------------------------------------------------------------
// ---------- PRINT PRODUCTS -----------------------------------------------------------------
// -------------------------------------------------------------------------------------------
const productsPage = document.querySelector("#products-page");

function printProducts(products) {
  productsPage.innerHTML = "";
  products.forEach((item) => {
    const ratingWithEmoji = getRatingEmoji(item.rating);

    productsPage.innerHTML += `
      <article class="product-card">
        <img class="product-image" src="${item.img.url}" alt="${item.img.alt}">
        <h2>${item.name}</h2>
        <p>${ratingWithEmoji}</p>
        <h3>${item.category}</h3>
        <p>${item.weekendPrice ? Math.round(item.weekendPrice) : item.price} kr</p>

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

// -------------------------------------------------------------------------------------------
// ---------- CLICK-EVENTS WITHIN PRODUCTS CONTAINER -----------------------------------------
// -------------------------------------------------------------------------------------------
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

// -------------------------------------------------------------------------------------------
// ---------- TO ADD PRODUCT TO CART ---------------------------------------------------------
// -------------------------------------------------------------------------------------------
let cart = [];

function addToCart(productId, totalAmount) {
  // Find the product in products array
  const addProduct = products.find((item) => item.id === productId); //Find in products-array the item(id) to add
  const basePrice = addProduct.price;
  const priceToUse = addProduct.weekendPrice || basePrice;

  // Check if product is already in cart
  const productInCart = cart.findIndex((item) => item.id === productId);

  // If product is already in cart (if returned index is 0 or higher)
  if (productInCart > -1) {
    cart[productInCart].amount += totalAmount; //Update its amount
    cart[productInCart].totalPrice = cart[productInCart].amount * priceToUse;
  } else { //Else if product not already in cart, add it
    cart.push({ 
      ...addProduct, 
      amount: totalAmount, 
      totalPrice: totalAmount * priceToUse, 
      discountApplied: false 
    }); //... operator to duplicate the object(product) to visiually add its info to the cart
  }

  popupCartUpdated();
  updateOrderSummary();

  if (cart.length > 0) {
    startInactiveTimer();
  }
}

// -------------------------------------------------------------------------------------------
// ---------- POPUP WHEN CART IS UPDATED -----------------------------------------------------
// -------------------------------------------------------------------------------------------
function popupCartUpdated() {
  const popup = document.getElementById('cartUpdatedPopup');
  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 2000);
}

// -------------------------------------------------------------------------------------------
// ---------- UPDATE ORDER SUMMARY VISUALLY --------------------------------------------------
// -------------------------------------------------------------------------------------------
function updateOrderSummary() {
  const orderSummary = document.querySelector("#order-summary");

  // Calculate shipping and discounts
  amountDiscount();
  timeBasedDiscount();
  disableInvoicePayment();

  orderSummary.innerHTML = "<h2>Order Summary</h2>";

  if (cart.length === 0) { //If no items in cart
    orderSummary.innerHTML += "<p>Your cart is empty.</p>";
    return;
  }

  // Get total price of cart
  let totalPrice = 0;

  // Determine which discount message to display
  let combinedDiscountMsg = "";
  if (cart.some(product => product.discountApplied) && mondayDiscount > 0) {
    combinedDiscountMsg = `You get <strong>10%</strong> off for ordering 10+ of the same figures!
    <br>
    Enjoy an additional <strong>10%</strong> discount on your total order as a Monday special!
    `;
  }

  const discountMsgToUse = combinedDiscountMsg || discountMsg;

  cart.forEach((item) => {
    const itemTotalPrice = Math.round(item.totalPrice);
    totalPrice += itemTotalPrice;

    orderSummary.innerHTML += `
        <div class="ordered-item">
          <p>${item.amount} x ${item.name} - ${itemTotalPrice} kr</p>
        </div>
      `;
  });

  // Checkout Total
  const shippingCost = calculateShippingCost();
  let shippingInfoMsg = "";
  if (shippingCost > 0) { //If condition for free shipping is not met
    shippingInfoMsg = `
    <p>This fee includes a flat amount of 25 kr, plus 10% of your order total.
    <br>
    Get your shipping free by ordering 15+ figures!</p>
    `;
  }

  const checkoutTotal = totalPrice - mondayDiscount + shippingCost;

  orderSummary.innerHTML += `
    <p><strong>Discount:</strong> ${discountMsgToUse}</p>
    <p><strong>Shipping fee:</strong> ${shippingCost} kr</p>
    <p>${shippingInfoMsg}</p>
    <h3>Checkout Total: ${checkoutTotal} kr</h3>`;
}

// -------------------------------------------------------------------------------------------
// ---------- SORTING PRODUCTS ---------------------------------------------------------------
// -------------------------------------------------------------------------------------------
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

  printProducts(products);
}

// -------------------------------------------------------------------------------------------
// ---------- CLICK-EVENTS FOR SORT BUTTONS --------------------------------------------------
// -------------------------------------------------------------------------------------------
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

// -------------------------------------------------------------------------------------------
// ---------- CLICK-EVENTS FOR CART & TOP BUTTONS --------------------------------------------
// -------------------------------------------------------------------------------------------
const goTopBtn = document.getElementById('goTopBtn');
const goCartBtn = document.getElementById('goCartBtn');

// Scroll to cart button
goCartBtn.addEventListener('click', () => {
  window.scrollTo(0, 8300);
});

// Scroll to top button
goTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// -------------------------------------------------------------------------------------------
// ---------- PAYMENT METHODS ----------------------------------------------------------------
// -------------------------------------------------------------------------------------------
const payCardBtn = document.getElementById('paycard');
const payInvoiceBtn = document.getElementById('payinvoice');
const cardSection = document.querySelector('.card-section');
const invoiceSection = document.querySelector('.invoice-section');

function togglePaymentOptions() {
    if (payCardBtn.checked) {
        cardSection.classList.remove('hidden')
        invoiceSection.classList.add('hidden');
    } else if (payInvoiceBtn.checked) {
        invoiceSection.classList.remove('hidden');
        cardSection.classList.add('hidden');
    }
};

payCardBtn.addEventListener('change', togglePaymentOptions);
payInvoiceBtn.addEventListener('change', togglePaymentOptions);

togglePaymentOptions();

// -------------------------------------------------------------------------------------------
// ---------- VALIDATION ---------------------------------------------------------------------
// -------------------------------------------------------------------------------------------
const orderButton = document.querySelector('.orderbtn');
const privacyBtn = document.getElementById('agreeprivacy');

// Validate each input field
function validateField(input) {
  const inputField = document.getElementById(input.id);
  const warningMessage = document.getElementById(input.warningId);

  if (inputField && warningMessage) {
    if (!input.regex.test(inputField.value)) {
      warningMessage.innerHTML = input.message;
      warningMessage.style.display = "block";
      inputField.classList.add("invalid-input");
      return false; //Field is invalid
    } else {
      warningMessage.style.display = "none";
      inputField.classList.remove("invalid-input");
      return true; //Field is valid
    }
  }
  return true; //If no validation is needed
}

// Validate entire form to enable Place Order button
function validateForm() {
  let allValid = true;

  // Validate field based on Regex
  inputRegex.forEach((input) => {
    const inputField = document.getElementById(input.id);
    if (inputField && !input.regex.test(inputField.value)) {
      allValid = false; //Invalid if any field fails
    }
  });

  // If card is selected, no need for any input nor validation
  if (payCardBtn.checked) {
    orderButton.disabled = !privacyBtn.checked; //Ensure Privacy Policy is checked
    return;
  }

  // If invoice is selected, find the Regex in the array and validate personal ID
  if (payInvoiceBtn.checked) {
    const personalIdInput = document.getElementById('personalId');
    if (!personalIdInput && !inputRegex.find(input => input.id === 'personalId').regex.test(personalIdInput.value)) {
      allValid = false;
    }
  }

  // Privacy policy checkbox must be checked
  if (!privacyBtn.checked) {
    allValid = false;
  }

  // Enable or disable the Place Order button
  orderButton.disabled = !allValid;
}

// Validate field on blur
inputRegex.forEach((input) => {
  const inputField = document.getElementById(input.id);

  if (inputField) {
    inputField.addEventListener('blur', () => {
      validateField(input);
      validateForm();
    });
  }
});

// Re-validate everytime these buttons are unchecked/checked
[payCardBtn, payInvoiceBtn, privacyBtn].forEach((button) => {
  button.addEventListener('change', () => {
    validateForm();
  });
});

// -------------------------------------------------------------------------------------------
// ---------- CLEAR ORDER AND FORM -----------------------------------------------------------
// -------------------------------------------------------------------------------------------
const clearBtn = document.querySelector(".clearbtn");
const orderSummary = document.querySelector("#order-summary");
const form = document.getElementById('userForm');

function clearCartForm() {
  // Clear user's form
  form.reset();

  // Clear cart
  cart = [];
  orderSummary.innerHTML = `
    <h2>Order Summary</h2>
    <p>Your cart is empty.</p>
  `;
  inactiveTimerStarted = false;
}

clearBtn.addEventListener('click', (e) => {
  e.preventDefault(); //Prevent html type="reset" to add custom commands
  clearCartForm();
  validateForm();
});

// -------------------------------------------------------------------------------------------
// ---------- DISCOUNTS & SPECIAL PRICES -----------------------------------------------------
// -------------------------------------------------------------------------------------------
let discountMsg = "Not available for this order.";
let mondayDiscount = 0;

/**
 * For each product in the cart
 * Calculate total cost of that product
 * Add to sum, which then add up to total cost of all products
 */
function calculateCartTotal() {
  return cart.reduce((sum, product) => sum + product.totalPrice, 0);
}

// Hide invoice if total cost is more than 800kr
function disableInvoicePayment() {
  const checkoutTotal = calculateCartTotal();
  const payInvoiceBtn = document.getElementById('payinvoice');
  payInvoiceBtn.disabled = checkoutTotal > 800;
}

// Amount-based discount
function amountDiscount() {
  let hasAmountDiscount = false;
  
  cart.forEach(product => {
    if (product.amount >= 10 && !product.discountApplied) {
      const activePrice = product.weekendPrice || product.price;
      product.totalPrice = Math.round(product.amount * activePrice * 0.90);
      product.discountApplied = true; //Mark as discounted
      hasAmountDiscount = true;
    }
  });
  
  if (hasAmountDiscount) {
    discountMsg = "You've ordered 10+ of the same figures. Enjoy a <strong>10%</strong> off on these as a thank you!";
  }
}

// Check date and time for discounts (mondayDiscount)
function timeBasedDiscount() {
  //const testDate = new Date("2024-12-16T09:00:00");
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();

  // Monday discount before 10:00
  if (day === 1 && hour < 10) {
    const cartTotal = calculateCartTotal();
    mondayDiscount = Math.round(cartTotal * 0.10); //Apply 10% discount on the total
    discountMsg = "Monday special - <strong>10%</strong> off your entire order!";
  } else {
    mondayDiscount = 0; //Reset discount outside the time frame
  }
}
// Ensure this applied on page load
timeBasedDiscount ();

// Shipping cost
function calculateShippingCost() {
  const totalProducts = cart.reduce((sum, product) => sum + product.amount, 0);
  if (totalProducts >= 15) {
    return 0; //Free shipping for 15+ products in cart
  }
  const checkoutTotal = calculateCartTotal();
  return Math.round(25 + checkoutTotal * 0.10); //Shipping = 25kr + 10% of total
}

function weekendPriceUp () {
  //const testDate = new Date("2024-12-13T16:00:00");
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();

  const isWeekend =
    (day === 5 && hour >= 15) || //Friday after 15
    day === 6 || //Saturday
    (day === 0 && hour < 3); //Sunday before 03

  if (isWeekend) {
    products.forEach(product => {
      if (!product.weekendPriceUp) {
        product.weekendPrice = Math.round(product.price * 1.15);
        product.weekendPriceUp = true;
      }
    });
  } else {
    products.forEach(product => {
      if (product.weekendPriceUp) {
        product.weekendPrice = product.price;
        product.weekendPriceUp = false;
      }
    });
  }

  // Re-print products with updated prices
  printProducts(products);
}
// Ensure this is applied on page load
weekendPriceUp();

let inactiveTimerStarted = false;

function startInactiveTimer() {
  if (inactiveTimerStarted) return; //Prevent starting multiple timers

  inactiveTimerStarted = true;

  setTimeout(() => {
    alert("Order timeout! Your cart and form have been cleared. Feel free to restart your order.");
    clearCartForm();
  }, 900000); //15 min in milliseconds
}