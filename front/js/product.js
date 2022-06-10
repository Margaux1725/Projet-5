// Récupération de l'id du produit
const params = new URLSearchParams(document.location.search);
const id = params.get("_id");
console.log(id);

// Récupération des produits et traitement
fetch("http://localhost:3000/api/products")
  .then((res) => res.json())
  .then((objetProduits) => {
    lesProduits(objetProduits);
  })
  .catch((err) => {
    document.querySelector(".item").innerHTML = "<h1>erreur 404</h1>";
    console.log("erreur 404, API probablement déconnecté: " + err);
  });

// Création d'objet articleClient
let articleClient = {};
articleClient._id = id;

// Affichage du produit de l'api
function lesProduits(produit) {
  // Variables
  let imageAlt = document.querySelector("article div.item__img");
  let titre = document.querySelector("#title");
  let prix = document.querySelector("#price");
  let description = document.querySelector("#description");
  let couleurOption = document.querySelector("#colors");

  for (let choix of produit) {
    //Id dans l'URL
    if (id === choix._id) {
      imageAlt.innerHTML = `<img src="${choix.imageUrl}" alt="${choix.altTxt}">`;
      titre.textContent = `${choix.name}`;
      prix.textContent = `${choix.price}`;
      description.textContent = `${choix.description}`;
      articleClient.prix = `${choix.price}`;
      //Boucle pour la couleur
      for (let couleur of choix.colors) {
        couleurOption.innerHTML += `<option value="${couleur}">${couleur}</option>`;
      }
    }
  }
}

// Choix couleur
// Définition des variables
let choixCouleur = document.querySelector("#colors");
choixCouleur.addEventListener("input", (ec) => {
  let couleurProduit;
  couleurProduit = ec.target.value;
  articleClient.couleur = couleurProduit;
});
// Choix quantité
// Définition des variables
let choixQuantité = document.querySelector('input[id="quantity"]');
let quantitéProduit;
choixQuantité.addEventListener("input", (eq) => {
  quantitéProduit = eq.target.value;
  articleClient.quantité = quantitéProduit;
});
// conditions de validation du clic via le bouton ajouter au panier
// déclaration variable
let choixProduit = document.querySelector("#addToCart");
// On écoute ce qu'il se passe sur le bouton #addToCart pour faire l'action :
choixProduit.addEventListener("click", () => {
  //conditions de validation du bouton ajouter au panier
  if (
    articleClient.quantité < 1 ||
    articleClient.quantité > 100 ||
    articleClient.quantité === undefined ||
    articleClient.couleur === "" ||
    articleClient.couleur === undefined
  ) {
    alert(
      "Pour valider cet article, veuillez renseigner une couleur et/ou une quantité"
    );
  } else {
    Panier();
    document.querySelector("#addToCart").textContent = "Produit ajouté";
  }
});

// Déclaration tableaux
let choixProduitClient = [];
let produitsEnregistrés = [];
let produitsTemporaires = [];
let produitsAPousser = [];

// Fonction ajoutPremierProduit qui ajoute l'article choisi dans le tableau vierge
function ajoutPremierProduit() {
  if (produitsEnregistrés === null) {
    delete articleClient.prix;
    choixProduitClient.push(articleClient);
    return (localStorage.panierStocké = JSON.stringify(choixProduitClient));
  }
}
function ajoutAutreProduit() {
  produitsAPousser = [];
  produitsTemporaires.push(articleClient);
  produitsAPousser = [...produitsEnregistrés, ...produitsTemporaires];

  produitsAPousser.sort(function triage(a, b) {
    if (a._id < b._id) return -1;
    if (a._id > b._id) return 1;
    if (a._id = b._id){
      if (a.couleur < b.couleur) return -1;
      if (a.couleur > b.couleur) return 1;
    }
    return 0;
  });

  produitsTemporaires = [];
  produitsAPousser.forEach(function(produit){
    delete produit.prix;
  })
  return (localStorage.panierStocké = JSON.stringify(produitsAPousser));
}
// ajuste la quantité si le produit est déja dans le tableau, sinon le rajoute si tableau il y a, ou créait le tableau avec un premier article choisi 
function Panier() {
  produitsEnregistrés = JSON.parse(localStorage.getItem("panierStocké"));
  if (produitsEnregistrés) {
    for (let choix of produitsEnregistrés) {
      if (choix._id === id && choix.couleur === articleClient.couleur) {
        let additionQuantité = parseInt(choix.quantité) + parseInt(quantitéProduit);
        choix.quantité = JSON.stringify(additionQuantité);
        return (localStorage.panierStocké = JSON.stringify(produitsEnregistrés));
      }
    }
    return ajoutAutreProduit();
  }
  return ajoutPremierProduit();
}

