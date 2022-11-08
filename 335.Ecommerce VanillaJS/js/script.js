import { PRODUCTS } from "./data.js";
import {
  getInputDataFromForm,
  checkLogOn,
  getLogOnUser,
  getCartItem,
  getProductById,
  addToCart,
  DB,
} from "./utils.js";

//Registration
const registrationForm = document.querySelector("#RegistrationForm");
const loginForm = document.querySelector("#LoginForm");
if (registrationForm || loginForm) {
  registrationForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const error = e.target.querySelector(".error");
    const data = getInputDataFromForm(registrationForm, "data-name");

    if (data.password != data.passwordVerify) {
      error.innerText = "Passwords do not match";
      error.classList.add("active");
      setTimeout(() => {
        error.classList.remove("active");
      }, 3000);
    } else {
      const userExist = DB.find((item) => item.email === data.email);
      if (userExist) {
        error.innerText = "User exist";
        error.classList.add("active");
        setTimeout(() => {
          error.classList.remove("active");
        }, 3000);
      } else {
        data.name = data.name.trim().toLowerCase();
        data.email = data.email.trim().toLowerCase();
        data.status = true;
        data.favourites = [];
        data.shoppingCart = [];
        data.orders = [];
        localStorage.setItem("currentUser", JSON.stringify(data));
        localStorage.setItem("users", JSON.stringify([...DB, data]));
        document.location.href = "account.html";
      }
    }
  });
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const error = e.target.querySelector(".error");
    const data = getInputDataFromForm(loginForm, "data-name");
    data.email = data.email.trim().toLowerCase();
    data.status = true;
    data.favourites = [];
    data.shoppingCart = [];
    data.orders = [];
    const userExist = DB.find(
      (item) => item.email === data.email && item.password === data.password
    );
    if (userExist) {
      localStorage.setItem("currentUser", JSON.stringify(userExist));
      document.location.href = "account.html";
    }
  });
}
// Header
const headerFavouritesCount = document.querySelector("#headerFavouritesCount"),
  headerShoppingCartCount = document.querySelector("#headerShoppingCartCount");
document.addEventListener("DOMContentLoaded", (e) => {
  const headerUser = document.querySelector("#headerUser"),
    headerFavourites = document.querySelector("#headerFavourites"),
    headerShoppingCart = document.querySelector("#headerShoppingCart"),
    headerLogout = document.querySelector("#headerLogout");

  const userLogOn = checkLogOn();
  if (userLogOn) {
    const userData = getLogOnUser();
    if (userLogOn.status) {
      headerUser.href = `account.html`;
      headerUser.innerHTML = userLogOn.name;

      headerFavourites.href = "favorites.html";
      headerFavouritesCount.innerHTML = userData.favourites.length;
      headerShoppingCart.href = "shoppingCart.html";
      headerShoppingCartCount.innerHTML = userData.shoppingCart.length;
      headerLogout.classList.add("active");
    }
  } else {
    headerUser.href = `login.html`;
    headerUser.innerHTML = `Log in`;

    headerFavourites.href = "login.html";
    headerFavouritesCount.innerHTML = "0";
    headerShoppingCart.href = "login.html";
    headerShoppingCartCount.innerHTML = "0";
  }
  headerLogout.addEventListener("click", () => {
    const currentUser = getLogOnUser();
    localStorage.setItem(
      "users",
      JSON.stringify([
        ...DB.filter((user) => user.email != currentUser.email),
        currentUser,
      ])
    );
    localStorage.removeItem("currentUser");
    document.location.href = "index.html";
  });
});
//Main
const main = document.querySelector("main");
if (main) {
  const categories = document.getElementById("categoriesContainer");
  const categoriesSet = new Set();
  PRODUCTS.forEach((el) => {
    categoriesSet.add(...el.categories);
  });
  const userLogOn = checkLogOn();
  const userData = getLogOnUser();
  const renderCategoriesProduct = (category, product) => {
    if (product.categories.includes(category)) {
      return `
         <div class="product" data-id="${product.id}">
						<button class="product__favourite">
							<img src="images/product__favourite${
                userLogOn
                  ? userData.favourites.includes("" + product.id)
                    ? "--true"
                    : ""
                  : ""
              }.png" alt="favourite" height="20">
						</button>
						<img src="images/products/${product.img}.png" class="product__img" alt="${
        product.title
      }" height="80">
						<p class="product__title">${product.title}</p>
            ${
              product.sale
                ? `
						<div class="product__sale">
							<span class="product__sale--old">$${product.price}</span>
							<span class="product__sale--percent">-${product.salePercent}%</span>
						</div>`
                : ""
            }
						<div class="product__info">
							<span class="product__price">${
                product.sale
                  ? Math.floor(
                      product.price -
                        (product.price / 100) * product.salePercent
                    )
                  : product.price
              }</span>
              ${
                userLogOn
                  ? getCartItem(userData.shoppingCart, String(product.id))
                    ? `<button class="product__cart product__cart--in">
                    <img src="images/shopping-cart.png" alt="shopping cart" height="20">
                  </button>`
                    : `<button class="product__cart">
                    <img src="images/shopping-cart.png" alt="shopping cart" height="20">
                  </button>`
                  : `<button class="product__cart">
                  <img src="images/shopping-cart.png" alt="shopping cart" height="20">
                </button>`
              }
              
						</div>
					</div>`;
    }
  };

  const renderCategories = () => {
    return Array.from(categoriesSet)
      .map(
        (category) =>
          `<section class="category" data-name="${category}">
    <h2>${category}</h2>
    <div class="category__container">
    ${PRODUCTS.map((product) =>
      renderCategoriesProduct(category, product)
    ).join("")}
    </div>
    </section>`
      )
      .join("");
  };

  const addToFavorites = (e) => {
    e.preventDefault();
    if (!userLogOn) {
      document.location.href = "login.html";
    } else {
      const userData = getLogOnUser();
      let productId = e.target.parentElement.parentElement.dataset.id;
      if (userData.favourites.includes(productId)) {
        userData.favourites.pop(productId);
        e.target.src = "images/product__favourite.png";
      } else {
        userData.favourites.push(productId);
        e.target.src = "images/product__favourite--true.png";
      }

      localStorage.setItem("currentUser", JSON.stringify(userData));
      headerFavouritesCount.innerHTML = userData.favourites.length;
    }
  };

  categories.innerHTML = renderCategories();

  document.addEventListener("DOMContentLoaded", (e) => {
    const favoritesBtn = document.querySelectorAll(".product__favourite");
    favoritesBtn.forEach((el) => {
      el.addEventListener("click", addToFavorites);
    });
    const productBtn = document.querySelectorAll(".product__cart");
    productBtn.forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        if (!userLogOn) {
          document.location.href = "login.html";
        } else {
          let productId =
            e.target.parentElement.parentElement.parentElement.dataset.id ||
            e.target.parentElement.parentElement.dataset.id;
          addToCart(e, productId, headerShoppingCartCount);
        }
      });
    });
  });
}
//Account
const orderTable = document.getElementById("orderTable");
const orderForm = document.getElementById("orderForm");
if (orderTable || orderForm) {
  const userName = document.getElementById("user-name");
  const userEmail = document.getElementById("user-email");
  const saveBtn = document.getElementById("save");
  const deletBtn = document.getElementById("delete");
  const userLogOn = checkLogOn();
  const userData = getLogOnUser();

  const renderOrders = (orders) => {
    return orders.map((order) => {
      let product = getProductById(PRODUCTS, Number(order.id));
      return `<tr>
      <td>
        <div class="item__info">
          <img
            src="images/products/${product.img}.png"
            alt="${product.title}"
            height="100"
          />
          <div>
            <p class="item__info--title">${product.title}</p>
          </div>
        </div>
      </td>
      ${
        product.sale
          ? `<td>$${product.price}</td>
      <td><span class="item__sale">- ${product.salePercent}%</span></td>
      <td>${
        Math.floor(
          product.price - (product.price / 100) * product.salePercent
        ) * order.count
      }</td>`
          : `<td>$${product.price}</td>
      <td>-</td>
      <td>${product.price * order.count}</td>`
      }

    </tr>`;
    });
  };

  const renderTableOrders = (orders) => {
    return `
    <table class="order__table" id="orderTable">
    <caption>
      Ordered Items
    </caption>
    <thead>
      <tr>
        <th>Item Description</th>
        <th>Price</th>
        <th>Sale</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${renderOrders(orders)}  
    
    </tbody>
  </table>`;
  };
  if (userLogOn && userData) {
    orderTable.innerHTML = userData.orders
      ? renderTableOrders(userData.orders)
      : "";

    userName.value = userData.name || "";
    userEmail.innerHTML = userData.email;
    saveBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ ...userData, name: userName.value })
      );
      const currentUser = getLogOnUser();
      localStorage.setItem(
        "users",
        JSON.stringify([
          ...DB.filter((user) => user.email != currentUser.email),
          currentUser,
        ])
      );
    });
    deletBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.setItem(
        "users",
        JSON.stringify(DB.filter((el) => el.email != userData.email))
      );
      localStorage.removeItem("currentUser");
      document.location.href = "index.html";
    });
  }
}
//Shoping Cart
const shopCartTable = document.getElementById("shopCartTable");
const shopCartForm = document.getElementById("shopCartForm");
if (shopCartTable || shopCartForm) {
  const completeBtn = document.getElementById("complete");
  const userLogOn = checkLogOn();
  const userData = getLogOnUser();
  if (userLogOn && userData) {
    const renderCart = (shoppingCart) => {
      return shoppingCart.map((order) => {
        let product = getProductById(PRODUCTS, Number(order.id));
        return `<tr>
        <td>
          <div class="item__info">
            <img
              src="images/products/${product.img}.png"
              alt="${product.title}"
              height="100"
            />
            <div>
              <p class="item__info--title">${product.title}</p>
            </div>
          </div>
        </td>
        <td>
        <input type="number" value="${
          order.count
        }" min="1" id="quantity" data-id=${product.id}>
        </td>
        ${
          product.sale
            ? `<td>$${product.price}</td>
        <td><span class="item__sale">- ${product.salePercent}%</span></td>
        <td data-totalId=${product.id}>${
                Math.floor(
                  product.price - (product.price / 100) * product.salePercent
                ) * order.count
              }</td>`
            : `<td>$${product.price}</td>
        <td>-</td>
        <td  data-totalId=${product.id}>${product.price * order.count}</td>`
        }
        <td>
                  <button class="item__remove" id="remove" data-removeId=${
                    product.id
                  }>
                    <img
                      src="images/delete.png"
                      alt="delete"
                      height="20"
                    />
                  </button>
                </td>
      </tr>`;
      });
    };
    const renderTableShopCart = (shoppingCart) => {
      return `
      <table class="order__table" id="shopCartTable">
      <caption>
        Items in Shopping Cart
      </caption>
      <thead>
        <tr>
          <th>Item Description</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Sale</th>
          <th>Total</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${renderCart(shoppingCart)}  
      
      </tbody>
    </table>`;
    };
    const countTotal = () => {
      let orderTotal = document.getElementById("orderTotal");
      let totals = document.querySelectorAll(`[data-totalId]`);
      orderTotal.innerText =
        "$" +
        Array.from(totals).reduce((sum, el) => {
          return sum + Number(el.innerText);
        }, 0);
    };
    shopCartTable.innerHTML = userData.shoppingCart
      ? renderTableShopCart(userData.shoppingCart)
      : "";
    countTotal();

    const qtyBtns = document.querySelectorAll("#quantity");
    const removeBtns = document.querySelectorAll("#remove");

    qtyBtns.forEach((btn) => {
      btn.addEventListener("change", (e) => {
        let productId = e.target.dataset.id;
        let total = document.querySelector(`[data-totalId="${productId}"]`);
        let product = getProductById(PRODUCTS, Number(productId));

        total.innerHTML = product.sale
          ? Math.floor(
              product.price - (product.price / 100) * product.salePercent
            ) * e.target.value
          : product.price * e.target.value;
        countTotal();
        const userData = getLogOnUser();
        let item = getCartItem(userData.shoppingCart, productId);
        item.count = Number(e.target.value);
        localStorage.setItem("currentUser", JSON.stringify(userData));
      });
    });
    removeBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        let productId = e.target.parentElement.dataset.removeid;
        const userData = getLogOnUser();
        let item = getCartItem(userData.shoppingCart, productId);
        userData.shoppingCart = userData.shoppingCart.filter(
          (el) => el.id != item.id
        );
        localStorage.setItem("currentUser", JSON.stringify(userData));
        document.location.href = "shoppingCart.html";
      });
    });
    completeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const userData = getLogOnUser();
      userData.orders = [...userData.orders, ...userData.shoppingCart];
      userData.shoppingCart = [];
      userData.orders.forEach((el) => {
        userData.favourites = userData.favourites.filter(
          (fav) => fav != Number(el.id)
        );
      });
      localStorage.setItem("currentUser", JSON.stringify(userData));
      document.location.href = "account.html";
    });
  }
}
//Favourite
const favouriteTable = document.getElementById("favouriteTable");
if (favouriteTable) {
  const userLogOn = checkLogOn();
  const userData = getLogOnUser();
  if (userLogOn && userData) {
    const renderFavourites = (favourites) => {
      return favourites.map((order) => {
        let product = getProductById(PRODUCTS, Number(order));
        return `<tr>
        <td>
          <div class="item__info">
            <img
              src="images/products/${product.img}.png"
              alt="${product.title}"
              height="100"
            />
            <div>
              <p class="item__info--title">${product.title}</p>
            </div>
          </div>
        </td>
        
        ${
          product.sale
            ? `<td>$${product.price}</td>
        <td><span class="item__sale">- ${product.salePercent}%</span></td>
        <td>${Math.floor(
          product.price - (product.price / 100) * product.salePercent
        )}</td>`
            : `<td>$${product.price}</td>
        <td>-</td>
        <td>${product.price}</td>`
        }
        <td data-id=${order}>
        
        ${
          getCartItem(userData.shoppingCart, String(product.id))
            ? `<button class="product__cart product__cart--in" id="product-cart">
                    <img src="images/shopping-cart.png" alt="shopping cart" height="20">
                  </button>`
            : `<button class="product__cart" id="product-cart">
                    <img src="images/shopping-cart.png" alt="shopping cart" height="20">
                  </button>`
        }
        <button class="item__favourite" id="favourite">
          <img
            src="images/product__favourite--true.png"
            alt="favourite"
            height="20"
          />
        </button>
      </td>
      </tr>`;
      });
    };
    const renderFavouriteTable = (favourites) => {
      return `
      <table class="order__table" id="shopCartTable">
      <caption>
      Favourite Items
      </caption>
      <thead>
        <tr>
          <th>Item Description</th>
          <th>Price</th>
          <th>Sale</th>
          <th>Total</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${renderFavourites(favourites)}  
      
      </tbody>
    </table>`;
    };

    favouriteTable.innerHTML = userData.favourites
      ? renderFavouriteTable(userData.favourites)
      : "";
    const cartBtns = document.querySelectorAll("#product-cart");
    const favouriteBtns = document.querySelectorAll("#favourite");
    cartBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        let productId =
          e.target.parentElement.dataset.id ||
          e.target.parentElement.parentElement.dataset.id;
        console.log(productId);
        addToCart(e, productId, headerShoppingCartCount);
      });
    });
    favouriteBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        let productId =
          e.target.parentElement.dataset.id ||
          e.target.parentElement.parentElement.dataset.id;
        const userData = getLogOnUser();
        let item = getCartItem(userData.shoppingCart, productId);
        if (!item) {
          userData.favourites.pop(productId);
          localStorage.setItem("currentUser", JSON.stringify(userData));
          headerFavouritesCount.innerHTML = userData.favourites.length;
          document.location.href = "favorites.html";
        }
      });
    });
  }
}
