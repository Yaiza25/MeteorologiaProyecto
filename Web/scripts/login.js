// Añadir evento de click al button de login
document.getElementById('btnLogin').addEventListener('click', (ev) => {
    ev.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    ObtenerDatos(username, password);
})

// Funciones
function ObtenerDatos(username, password) {
    // Obtener el acceso a traves de la api 
    $.ajax({
        type: "POST",
        dataType: "html",
        url: `http://10.10.17.196:5000/api/Users/authenticate/username/${username}/password/${password}`,
        headers: {
            "accept": "application/json",
        },
        success: function (response) { // Si el usuario existe
            var aSession = { "Sesion": true, "User": username }; // Crear estructura del localStorage
            localStorage.Session = JSON.stringify(aSession);

            window.location.href = "./index.html";
        },
        error: function (response, status) { // Si el usuario no existe
            alert("Usuario o contraseña incorrecta");

            var aSession = { "Sesion": false, "User": "" }; // Crear estructura del localStorage
            localStorage.Session = JSON.stringify(aSession); // Guardar los cambios en el localStorage
        }
    });
}
