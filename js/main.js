import { products } from "./products.js";
import { inputRegex } from "./regex.js";

// -------------------------------------------------------------------------------------------
// ---------- PRINT PRODUCTS -----------------------------------------------------------------
// -------------------------------------------------------------------------------------------
const productsPage = document.querySelector("#products-page");

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

  orderSummary.innerHTML = "<h2>Order Summary</h2>";

  if (cart.length === 0) { //If no items in cart
    orderSummary.innerHTML += "<p>Your cart is empty.</p>";
    return;
  }

  // Get total price of cart
  let totalPrice = 0;

  cart.forEach((item) => {
    const itemTotalPrice = item.price * item.amount;
    totalPrice += itemTotalPrice;

    orderSummary.innerHTML += `
        <div class="order-item">
          <p>${item.amount} x ${item.name} - ${itemTotalPrice} kr</p>
        </div>
      `;
  });

  orderSummary.innerHTML += `
    <h3>Order Total: ${totalPrice} kr</h3>
    `;
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

  reorganizeProducts();
}

// -------------------------------------------------------------------------------------------
// ---------- REORGANIZE PRODUCTS ORDER AFTER SORTING ----------------------------------------
// -------------------------------------------------------------------------------------------
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

clearBtn.addEventListener('click', (e) => {
  e.preventDefault(); //Prevent html type="reset" to add custom commands

  // Clear user's form
  form.reset();

  // Clear order summary
  cart = [];
  orderSummary.innerHTML = `
    <h2>Order Summary</h2>
    <p>Your cart is empty.</p>
  `;

  validateForm();
});