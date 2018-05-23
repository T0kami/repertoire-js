function main(){
  //Création de la BDD
  var contactListDiv = document.getElementById("contactList");
  var db;
  var request = window.indexedDB.open("test5", 5);
  request.onerror = function() {
    console.log("Error creating the database");
  };
  request.onsuccess = function() {
    db = request.result;
    console.log("successfully opened");

    listAll(contactListDiv);

  };

  request.onupgradeneeded = function() {

        db = request.result;
        function createTable(){
          var objectStore = db.createObjectStore("contacts", {autoIncrement: true});

          objectStore.createIndex("name", "name", { unique: false });
          objectStore.createIndex("phone", "phone", { unique: true });
          objectStore.createIndex("email", "email", { unique: false });

        }

        // On ajoute un magasin d'objet à la base de données
        if (!db.objectStoreNames.contains('contacts')) {

          createTable();

        }else{
          db.deleteObjectStore("contacts");

          createTable();
        }


  }


  function add(contactInfos) {

         var request = db.transaction(["contacts"], "readwrite").objectStore("contacts").add(contactInfos);

         request.onsuccess = function(event) {
                 console.log("Le contact à bien été ajouté !");

                 listAll(contactListDiv);
         };

         request.onerror = function(event) {
            if (String(request.error).includes("uniqueness")){
              alert("Ce numéro existe déjà dans votre répertoire !");
            }else{
                 console.log(request.error);
            }
         }

  }



 function listAll(contactListDiv) {
   var objectStore = db.transaction("contacts").objectStore("contacts");

   objectStore.index('name').openCursor().onsuccess = function(event) {
     var cursor = event.target.result;
     if (cursor) {
           contactListDiv.innerHTML += ("<div>" + cursor.value.name + ", Téléphone: " + cursor.value.phone + ", Email: " + cursor.value.email + "</div>");

           cursor.continue();
     }
   };
 }

 function search(searchString, contactListDiv){
   var objectStore = db.transaction("contacts").objectStore("contacts");
   contactListDiv.innerHTML = "";
   objectStore.index('name').openCursor().onsuccess = function(event) {
     var cursor = event.target.result;

     if (cursor) {
       var response = cursor.value.name + " " + cursor.value.phone + " " + cursor.value.email ;
       if(response.includes(searchString)){
       //console.log(typeof(response));

       contactListDiv.innerHTML += ("<div>" + cursor.value.name + ", Téléphone: " + cursor.value.phone + ", Email: " + cursor.value.email + "</div>");
       }
      cursor.continue();
      }


   };

 }

 function clearData() {
   // ouvre une transaction de lecture / écriture  prête pour le nettoyage
   var transaction = db.transaction(["contacts"], "readwrite");

   // en cas de succès de l'ouverture de la transaction
   transaction.oncomplete = function(event) {
 	   console.log("Transaction effectuée !");
   };

   // en cas d'échec de l'ouverture de la transaction
   transaction.onerror = function(event) {
      console.log('Transaction en échec à cause de l\'erreur : ' + transaction.error);
   };

   // ouvre l'accès au un magasin "toDoList" de la transaction
   var objectStore = transaction.objectStore("contacts");

   // Vide le magasin d'objet
   var objectStoreRequest = objectStore.clear();

   objectStoreRequest.onsuccess = function(event) {
     console.log("La base a bien été nettoyée !")
   };
 };

 document.querySelectorAll("input[name=search]")[0].addEventListener("keyup", function(event){
   search(event.target.value, contactListDiv);
 });

  //contacts.init("test");

  //Ajout d'un contact
  document.querySelectorAll("input[type=submit]")[0].addEventListener("click", function(event){
    event.preventDefault();
    var contactForm = document.getElementsByTagName('form')[0];
    var contactInfos = {};
    for (let item of contactForm){

      if (item.type == "text"){
        contactInfos[item.id] = item.value;
      }
    }
    add(contactInfos);
  });

}

main();




//Script pour les onglets
function contactTabs(evt, onglet) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(onglet).style.display = "block";
    evt.currentTarget.className += " active";
}
