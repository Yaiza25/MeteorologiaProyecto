// Variables
var bEjecutando = false;

// Funciones
function ObtenerDatos(username, password) {
    // Obtener el acceso a traves de la api 
    if (!bEjecutando) { // Evitar doble peticion de Ajax
        $.ajax({
            type: "POST",
            dataType: "html",
            url: `http://10.10.17.196:8080/api/Users/authenticate/username/${username}/password/${password}`,
            async: false, // Sincrono
            headers: {
                "accept": "application/json",
            },
            beforeSend: function (response) {
                bEjecutando = true;
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
            },
            complete: function (response, status) {
                bEjecutando = false;
            }
        });
    }
}
