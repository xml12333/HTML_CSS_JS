export const getInputDataFromForm = (formSelector, attribut) => {
  const nodeList = formSelector.querySelectorAll(`input[${attribut}]`);
  return Array.from(nodeList).reduce(
    (obj, el) => ({
      ...obj,
      [el.attributes[attribut].value]: el.value,
    }),
    {}
  );
};

export const checkLogOn = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};

  return DB.find(
    (user) =>
      currentUser.email === user.email && currentUser.password === user.password
  );
};

export const getCartItem = (shoppingCart,productId) =>{
  return shoppingCart.find(
    (el) =>  el.id === productId
  );
}

export const getProductById = (Products, productId) =>{
  return Products.find(
    (el) =>  el.id === productId
  );
}

export const addToCart = (e, productId) => {
  const userData = getLogOnUser();
  let item = getCartItem(userData.shoppingCart, String(productId));
  if (item) {
    userData.shoppingCart.pop(item);
    // userData.shoppingCart = [
    //   ...userData.shoppingCart,
    //   { id: productId, count: item.count + 1 },
    // ];
    if (e.target.classList.contains("product__cart")) {
      e.target.classList.remove("product__cart--in");
    } else {
      e.target.parentElement.classList.remove("product__cart--in");
    }
  } else {
    userData.shoppingCart.push({ id: productId, count: 1 });

    if (e.target.classList.contains("product__cart")) {
      e.target.classList.add("product__cart--in");
    } else {
      e.target.parentElement.classList.add("product__cart--in");
    }
  }
  localStorage.setItem("currentUser", JSON.stringify(userData));
  headerShoppingCartCount.innerHTML = userData.shoppingCart.length;
};

export const getLogOnUser = () => {
  return JSON.parse(localStorage.getItem("currentUser")) || {};
};

const getStorageUser = () => {
  const users = localStorage.getItem("users");
  if (users) {
    return JSON.parse(users);
  } else {
    return [];
  }
};

export const DB = getStorageUser();
