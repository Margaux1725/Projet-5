const page = document.location.href;
let Client = {}
// Fonction détermine les conditions d'affichage des produits du panier
const cache = {}
const getproductbyid = async (productId) => {
  if(cache.hasOwnProperty(productId)) return Promise.resolve(cache[productId]);
  const requete = await fetch("http://localhost:3000/api/products/"+ productId)
  const product = await requete.json() 
  cache[productId] = product;
  return product 
}
function affichagePanier() {
  let panier = JSON.parse(localStorage.getItem("panierStocké"));
  if (panier && panier.length != 0) {
    return Promise.all(panier.map(async item => {
      const product = await getproductbyid(item._id)
      return {...product, ...item}
    }))
    .then((objetProduits) => {
      affiche(objetProduits);
      modifQuantité();
      suppression();
      totalProduit();
    })
    .catch((err) => {
        console.log("erreur 404, sur ressource api: " + err);
    });
    // affiche(panier);
  } else {
    document.querySelector("#totalQuantity").innerHTML = "0";
    document.querySelector("#totalPrice").innerHTML = "0";
    document.querySelector("h1").innerHTML =
      "Vous n'avez pas d'article dans votre panier";
  }

}
if (page.match("cart")) affichagePanier();
//Fonction d'affichage d'un panier (tableau)
function affiche(indexé) {
  let zonePanier = document.querySelector("#cart__items");
  zonePanier.innerHTML += indexé.map((choix) => 
  `<article class="cart__item" data-id="${choix._id}" data-couleur="${choix.couleur}" data-quantité="${choix.quantité}"> 
    <div class="cart__item__img">
      <img src="${choix.imageUrl}" alt="${choix.altTxt}">
    </div>
    <div class="cart__item__content">
      <div class="cart__item__content__titlePrice">
        <h2>${choix.name}</h2>
        <span>couleur : ${choix.couleur}</span>
        <p data-price="${choix.price}" id="prix_${choix._id}_${choix.couleur.replaceAll("/", "_")}">${choix.price} €</p>
      </div>
      <div class="cart__item__content__settings">
        <div class="cart__item__content__settings__quantity">
          <p>Qté : </p>
          <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${choix.quantité}">
        </div>
        <div class="cart__item__content__settings__delete">
          <p class="deleteItem" data-id="${choix._id}" data-couleur="${choix.couleur}">Supprimer</p>
        </div>
      </div>
    </div>
  </article>`
    ).join("");
  // totalProduit();
}
// fonction modifQuantité on modifie dynamiquement les quantités du panier
function modifQuantité() {
  const CART = document.querySelectorAll(".cart__item");
  CART.forEach((cart) => {console.log("item panier en dataset: " + " " + cart.dataset.id + " " + cart.dataset.couleur + " " + cart.dataset.quantité); });
  Array.from(CART).forEach((cart) => {
    cart.addEventListener("change", (eq) => {
      let panier = JSON.parse(localStorage.getItem("panierStocké"));
      for (article of panier){
        if (
          article._id === cart.dataset.id &&
          cart.dataset.couleur === article.couleur
        ) {
          article.quantité = eq.target.value;
          const priceElement = document.querySelector(`#prix_${article._id}_${article.couleur.replaceAll("/", "_")}`)
          priceElement.innerText = parseFloat(article.quantité) * parseFloat(priceElement.dataset.price) + " €"
          delete article.price;
          localStorage.setItem("panierStocké", JSON.stringify(panier));
          totalProduit();
        }
      }
    });
  });
}
// fonction supression on supprime un article dynamiquement du panier et donc de l'affichage
function suppression() {
  const cartdelete = document.querySelectorAll(".cart__item .deleteItem");
  cartdelete.forEach((cartdelete) => {
    cartdelete.addEventListener("click", (event) => {
      const produitId = event.target.dataset.id
      const produitCouleur = event.target.dataset.couleur
      const panier = JSON.parse(localStorage.getItem("panierStocké")).filter(item => {       
        if (item._id != produitId) {
          return true;
        } else {
          if (item.couleur != produitCouleur){
            return true
          }
          return false
        }

      })      
      localStorage.setItem("panierStocké", JSON.stringify(panier));
      window.location.reload()
    });
  });
}
// fonction ajout nombre total produit et coût total
function totalProduit() {
  let panier = JSON.parse(localStorage.getItem("panierStocké"));
  return Promise.all(panier.map(async item => {
    const product = await getproductbyid(item._id)
    return {...product, ...item}
  }))
  .then((objetProduits) => {
    let totalArticle = 0;
    let totalPrix = 0;
    for(let article of objetProduits){
      totalArticle += parseInt(article.quantité)
      totalPrix += article.price * parseInt(article.quantité)
    }
    document.getElementById("totalQuantity").textContent = parseInt(totalArticle);
    document.getElementById("totalPrice").textContent = totalPrix;
  })
  .catch((err) => {
      console.log("erreur 404, sur ressource api: " + err);
  });
}


//  formulaire
if (page.match("cart")) {
  var contactClient = {};
  Client = contactClient;
  var prenom = document.querySelector("#firstName");
  prenom.classList.add("regex_texte");
  var nom = document.querySelector("#lastName");
  nom.classList.add("regex_texte");
  var ville = document.querySelector("#city");
  ville.classList.add("regex_texte");
  var adresse = document.querySelector("#address");
  adresse.classList.add("regex_adresse");
  var email = document.querySelector("#email");
  email.classList.add("regex_email");
  var regexTexte = document.querySelectorAll(".regex_texte");
  document.querySelector("#email").setAttribute("type", "text");
}
//regex 
let regexLettre = /^[a-záàâäãåçéèêëíìîïñóòôöõúùûüýÿæœ\s-]{1,31}$/i;
let regexChiffreLettre = /^[a-z0-9áàâäãåçéèêëíìîïñóòôöõúùûüýÿæœ\s-]{1,60}$/i;
let regValideEmail = /^[a-z0-9æœ.!#$%&’*+/=?^_`{|}~"(),:;<>@[\]-]{1,60}$/i;
let regMatchEmail = /^[a-zA-Z0-9æœ.!#$%&’*+/=?^_`{|}~"(),:;<>@[\]-]+@([\w-]+\.)+[\w-]{2,4}$/i;
// Ecoute et attribution de point(pour sécurité du clic) si ces champs sont ok d'après la regex
if (page.match("cart")) {
  regexTexte.forEach((regexTexte) =>
    regexTexte.addEventListener("input", (e) => {
      valeur = e.target.value;
      let regNormal = valeur.search(regexLettre);
      if (regNormal === 0) {
        contactClient.firstName = prenom.value;
        contactClient.lastName = nom.value;
        contactClient.city = ville.value;
      }
      if (
        contactClient.city !== "" &&
        contactClient.lastName !== "" &&
        contactClient.firstName !== "" &&
        regNormal === 0
      ) {
        contactClient.regexNormal = 3;
      } else {
        contactClient.regexNormal = 0;
      }
      Client = contactClient;
      couleurRegex(regNormal, valeur, regexTexte);
      valideClic();
    })
  );
}
// le champ écouté via la regex regexLettre fera réagir, grâce à texteInfo, la zone concernée
texteInfo(regexLettre, "#firstNameErrorMsg", prenom);
texteInfo(regexLettre, "#lastNameErrorMsg", nom);
texteInfo(regexLettre, "#cityErrorMsg", ville);
// Ecoute et attribution de point(pour sécurité du clic) si ces champs sont ok d'après la regex
if (page.match("cart")) {
  let regexAdresse = document.querySelector(".regex_adresse");
  regexAdresse.addEventListener("input", (e) => {
    valeur = e.target.value;
    let regAdresse = valeur.search(regexChiffreLettre);
    if (regAdresse == 0) {
      contactClient.address = adresse.value;
    }
    if (contactClient.address !== "" && regAdresse === 0) {
      contactClient.regexAdresse = 1;
    } else {
      contactClient.regexAdresse = 0;
    }
    Client = contactClient;
    couleurRegex(regAdresse, valeur, regexAdresse);
    valideClic();
  });
}
// le champ écouté via la regex regexChiffreLettre fera réagir, grâce à texteInfo, la zone concernée
texteInfo(regexChiffreLettre, "#addressErrorMsg", adresse);
// Ecoute et attribution de point(pour sécurité du clic) si ce champ est ok d'après les regex
if (page.match("cart")) {
  let regexEmail = document.querySelector(".regex_email");
  regexEmail.addEventListener("input", (e) => {
    valeur = e.target.value;
    let regMatch = valeur.match(regMatchEmail);
    let regValide = valeur.search(regValideEmail);
    if (valeur === "" && regMatch === null) {
      contactClient.regexEmail = 0;
      regexEmail.style.backgroundColor = "rgb(220, 50, 50)";
      document.querySelector("#emailErrorMsg").textContent = "Veuillez renseigner votre email.";
      document.querySelector("#emailErrorMsg").style.color = "white";
    } else if ( regValide !== 0) {
      contactClient.regexEmail = 0;
      regexEmail.style.backgroundColor = "rgb(220, 50, 50)";
      document.querySelector("#emailErrorMsg").innerHTML = "Caractère non valide";
      document.querySelector("#emailErrorMsg").style.color = "white";
    } else if (valeur != "" && regMatch == null) {
      contactClient.regexEmail = 0;
      regexEmail.style.backgroundColor = "rgb(220, 50, 50)";
      document.querySelector("#emailErrorMsg").innerHTML = "Caratères acceptés pour ce champ. Forme email pas encore conforme";
      document.querySelector("#emailErrorMsg").style.color = "white";
    } else {
      contactClient.email = email.value;
      contactClient.regexEmail = 1;
      regexEmail.style.backgroundColor = "rgb(0, 138, 0)"
      regexEmail.style.color = "white";
      document.querySelector("#emailErrorMsg").innerHTML = "Forme email conforme.";
      document.querySelector("#emailErrorMsg").style.color = "white";
    }
    if (regValide === 0 && regMatch !== null) {
      contactClient.email = email.value;
      contactClient.regexEmail = 1;
    } else {
      contactClient.regexEmail = 0;
    }
    valideClic();
  });
}
// fonction couleurRegex qui modifira la couleur de l'input par remplissage tapé, aide visuelle et accessibilité
let valeurEcoute = "";
function couleurRegex(regSearch, valeurEcoute, inputAction) {
  if (valeurEcoute === "" && regSearch != 0) {
    inputAction.style.backgroundColor = "white";
    inputAction.style.color = "black";
  //} else if (valeurEcoute !== "" && regSearch != 0 || Client.regexEmail === 0 && regSearch != 0) {
  } else if (regSearch != 0) {
    inputAction.style.backgroundColor = "rgb(220, 50, 50)";
    inputAction.style.color = "white";
  } else if (regSearch === 0){
    inputAction.style.backgroundColor = "rgb(0, 138, 0)";
    inputAction.style.color = "white";
  }
}
// fonction d'affichage individuel des paragraphes sous input sauf pour l'input email
function texteInfo(regex, pointage, zoneEcoute) {
      if (page.match("cart")) {
      zoneEcoute.addEventListener("input", (e) => {
      valeur = e.target.value;
      index = valeur.search(regex);
      if (valeur === "" && index != 0) {
        document.querySelector(pointage).textContent = "Veuillez renseigner ce champ.";
        document.querySelector(pointage).style.color = "white";
      } else if (valeur !== "" && index != 0) {
        document.querySelector(pointage).innerHTML = "Reformulez cette donnée";
        document.querySelector(pointage).style.color = "white";
      } else if (index === 0){
      document.querySelector(pointage).innerHTML = "Caratères acceptés pour ce champ.";
      document.querySelector(pointage).style.color = "white";
      }
    });
  }
}
// Fonction de validation/d'accés au clic du bouton du formulaire
let commande = document.querySelector("#order");
function valideClic() {
  let contactRef = Client;
  let somme =
    contactRef.regexNormal + contactRef.regexAdresse + contactRef.regexEmail;
  if (somme === 5) {
    commande.removeAttribute("disabled", "disabled");
    document.querySelector("#order").setAttribute("value", "Commander !");
  } else {
    commande.setAttribute("disabled", "disabled");
    document.querySelector("#order").setAttribute("value", "Remplir le formulaire");
  }
}
// Envoi de la commande
if (page.match("cart")) {
  commande.addEventListener("click", (e) => {
    e.preventDefault();
    envoiPaquet();
  });
}
// fonction récupérations des id puis mis dans un tableau
let panierId = [];
function tableauId() {
let panier = JSON.parse(localStorage.getItem("panierStocké"));
if (panier && panier.length > 0) {
  for (let indice of panier) {
    panierId.push(indice._id);
  }
} else {
  console.log("le panier est vide");
  document.querySelector("#order").setAttribute("value", "Panier vide!");
}
}
// fonction récupération des donnée client et panier avant transformation
let contactRef;
let commandeFinale;
function paquet() {
  contactRef = Client;
  commandeFinale = {
    contact: {
      firstName: contactRef.firstName,
      lastName: contactRef.lastName,
      address: contactRef.address,
      city: contactRef.city,
      email: contactRef.email,
    },
    products: panierId,
  };
}
// fonction sur la validation de l'envoi
function envoiPaquet() {
  tableauId();
  paquet();
  console.log(commandeFinale);
  let somme = contactRef.regexNormal + contactRef.regexAdresse + contactRef.regexEmail;
  if (panierId.length != 0 && somme === 5) {
    fetch("http://localhost:3000/api/products/order", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commandeFinale),
    })
      .then((res) => res.json())
      .then((data) => {
        window.location.href = `./confirmation.html?commande=${data.orderId}`;
      })
      .catch(function (err) {
        console.log(err);
        alert("erreur");
      });
  }
}
// fonction affichage auto invoquée du numéro de commande et vide du storage lorsque l'on est sur la page confirmation
(function Commande() {
  if (page.match("confirmation")) {
    localStorage.clear();
    let numCom = new URLSearchParams(document.location.search).get("commande");
    document.querySelector("#orderId").innerHTML = `<br>${numCom}<br>Merci pour votre achat`;
    console.log("valeur de l'orderId venant de l'url: " + numCom);
    numCom = undefined;
  } else {
    console.log("sur page cart");
  }
})();


