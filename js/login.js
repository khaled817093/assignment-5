document.getElementById("login-btn").addEventListener("click", function(event){
    event.preventDefault();
    console.log("login button clicked");
    const numberInput=document.getElementById("username")
    const contactNumber=numberInput.value;
    console.log("Number:", contactNumber);

    const getpin=document.getElementById("username-password")
    const setpin=getpin.value;
    console.log("Pin:", setpin);

    if(contactNumber==='admin' && setpin==='admin123'){
        alert('Sign In Successful')
        window.location.assign("./home.html")
    }
    else{
        alert('Sign In Failed')
        return;
    }
})
