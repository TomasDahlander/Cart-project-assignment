$(document).ready(function(){

    // Skapar upp listor att lagra strängar i och att iterera över
    let savedImg = [];
    let savedH3 = [];
    let savedPrice = [];
    let savedQuantity = [];

    // Laddar in allt från localStorage om det finns
    function loadLocalStorage(){
        const savedImgTemp = JSON.parse(localStorage.getItem("savedImg"));
        const savedH3Temp = JSON.parse(localStorage.getItem("savedH3"));
        const savedPriceTemp = JSON.parse(localStorage.getItem("savedPrice"));
        const savedQuantityTemp = JSON.parse(localStorage.getItem("savedQuantity"));

        if(savedImgTemp !== null) savedImg = savedImgTemp;
        if(savedH3Temp !== null) savedH3 = savedH3Temp;
        if(savedPriceTemp !== null) savedPrice = savedPriceTemp;
        if(savedQuantityTemp !== null) savedQuantity = savedQuantityTemp;
    }

    // Laddar produkter från API
    function loadProducts() {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "http://webacademy.se/fakestore/")
        xhr.send();

        xhr.onreadystatechange = function() {
            if(xhr.readyState === 4 && xhr.status === 200){
                renderProducts(JSON.parse(xhr.responseText));
            }
        }
    }

    // Lägger till varje produkt med bild, rubrik, text och pris på första sidan 
    function renderProducts(json){
        let products = "";

        json.forEach(function(obj){
            products += `<div class="col-sm-4 div-product-holder position-relative">
            <img
              src=${obj.image}
              alt=${obj.title}
            />
            <h3>${obj.title}</h3>
            <p>
              ${obj.description}
            </p>
            <label>Price</label> <span>${obj.price}</span> <label>$</label>
            <br />
    
            <button
              type="button"
              class="btn btn-primary position-absolute bottom-0 start-10 addBtn"
            >
              Add to cart
            </button>
          </div>`;

        });
        $("#mainDiv").html(products);

        // Skapar lyssnare för "add to cart" knapp
        $(".addBtn").click(function(){

            console.log("click");
    
            // läs in info fron respektive produkt man klickar på
            const img = $(this).siblings("img").attr("src");
            const head = $(this).siblings("h3").html();
            const price = Number($(this).siblings("span").html());
            const quantity = 1;
    
            // kontrollera så att man inte lägger till dubblett och öka istället antalet för quantity
            for(let i = 0; i < savedImg.length; i++){
                if(savedImg[i] === img){
                    let q = Number(savedQuantity[i]);
                    q++;
                    savedQuantity[i] = q;
                    localStorage.setItem("savedQuantity", JSON.stringify(savedQuantity));  
                    window.location.href = "cart.html";             
                    return;
                }
            }
    
            savedImg.push(img);
            savedH3.push(head);
            savedPrice.push(price);
            savedQuantity.push(quantity);
    
            localStorage.setItem("savedImg", JSON.stringify(savedImg));
            localStorage.setItem("savedH3", JSON.stringify(savedH3));
            localStorage.setItem("savedPrice", JSON.stringify(savedPrice));
            localStorage.setItem("savedQuantity", JSON.stringify(savedQuantity));
    
             window.location.href = "cart.html";
        });

    }

    // Lägg till samtliga produkter från localStorage på "cart" sidan
    function onCartStart(){

        for(let i = 0; i < savedImg.length; i++){
            $("#list").append(`
            <li class="border border-3">
                <span>${savedH3[i]}</span> <br>
                <span>Unit price: ${savedPrice[i]}</span> <br>
                <img
                src=${savedImg[i]} 
                alt=${savedH3[i]}
                class="cart-img"
                /> 
                <br>
                <button class="btn btn-info minus minus-btn">-</button>
                <input type="number" class="text-center disabled noselect" value=${savedQuantity[i]} readonly min="1"</input>
                <button class="btn btn-info plus plus-btn">+</button> <br>
                <button class="btn btn-danger remove-btn">Remove</button>
            </li>
                `);
        }
        calculateTotalPrice();
    }

    // Skapa lyssnare för "remove" knappen på "cart" sidan
    $(document).on("click", ".remove-btn", function(){
        const url = $(this).siblings("img").attr("src");
        removeFromList(url);
        $(this).parent().remove();
    });

    // Skapa lyssnare för "plus" knappen på "cart" sidan
    $(document).on("click", ".plus", function(){
        let q = Number($(this).siblings("input").attr("value"));
        q++;
        $(this).siblings("input").attr("value", q);
        const url = $(this).siblings("img").attr("src");
        changeQuantity(url, q);
    });

    // Skapa lyssnare för "minus" knappen på "cart" sidan
    $(document).on("click", ".minus", function(){
        let q = Number($(this).siblings("input").attr("value"));
        if(q === 1) return;
        q--;
        $(this).siblings("input").attr("value", q);
        const url = $(this).siblings("img").attr("src");
        changeQuantity(url, q);
    });

    // Räkna ut totalpriset på "cart" sidan
    function calculateTotalPrice(){
        let totalPrice = 0.0;
        for(let i = 0; i < savedImg.length; i++){
            const price = Number(savedPrice[i]);
            const quantity = Number(savedQuantity[i]);
            totalPrice += (price*quantity);
        }
        
        $("#totalPrice").html(totalPrice.toFixed(2));
    }

    // Funktion för att ändra kvantitet i varukorgen
    function changeQuantity(url, q){
        for(let i = 0; i < savedImg.length; i++){
            if(savedImg[i] === url){
                savedQuantity[i] = q;
                localStorage.setItem("savedQuantity", JSON.stringify(savedQuantity));
                break;
            }
        }
        calculateTotalPrice();
    }

    // Function för att ta bort en produkt ur "carten" och localStorage
    function removeFromList(url){
        for(let i = 0; i < savedImg.length; i++){
            if(savedImg[i] === url){

                savedImg.splice(i,1);
                savedH3.splice(i,1);
                savedPrice.splice(i,1);
                savedQuantity.splice(i,1);

                localStorage.setItem("savedImg", JSON.stringify(savedImg));
                localStorage.setItem("savedH3", JSON.stringify(savedH3));
                localStorage.setItem("savedPrice", JSON.stringify(savedPrice));
                localStorage.setItem("savedQuantity", JSON.stringify(savedQuantity));

                break;
            }
        }
        calculateTotalPrice();
    }

    // Funktion för att kontrollera input i beställningsformuläret
    $("#submitButton").click(function(){
        const name = $("#nameInput").val();
        const address = $("#addressInput").val();
        const tele = $("#teleInput").val();
        const email = $("#emailInput").val();

        let ok = true;

        if(name.length < 1){
            $("#nameError").html("Name must contain atleast 1 character");
            ok = false;
        }else{
            $("#nameError").html("");
        }

        if(address.length < 10){
            $("#addressError").html("The address must be atleast 10 character long");
            ok = false;
        }else{
            $("#addressError").html("");
        }

        if(tele.length < 5){
            $("#teleError").html("Telephone number must be atleast 5 digits and can't contain letters");
            ok = false;
        }else{
            $("#teleError").html("");
        }
        
        const checkA = email.search(/@/i);
        const checkSpaces = email.search(/\s/g);
        const checkDot = email.search(/\./g);
        console.log(checkDot);

        if(checkA < 0){ // Saknas @ ?
            console.log("Email måste innehålla @");
            $("#emailError").html("Email must contain @");
            ok = false;
        }
        else if(checkSpaces >= 0){ // Innehåller mellanrum ?
            $("#emailError").html("Email can't contain a whitespace");
            ok = false;
        }
        else if(checkDot < 0){ // Saknas . ?
            $("#emailError").html("Email must contain a period (.)");
            ok = false;
        }
        else{
            $("#emailError").html("");
        }

        if(ok){
        $("#nameInput").val("");
        $("#addressInput").val("");
        $("#teleInput").val("");
        $("#emailInput").val("");
        localStorage.clear();
        alert("Thank you for your order")
        location.reload();
        }
    });

    // Funktionerna som körs direkt vid start
    loadProducts();
    loadLocalStorage();
    onCartStart();
    
});