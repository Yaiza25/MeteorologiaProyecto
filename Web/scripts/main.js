import L from 'leaflet'; // Importar Leaflet

// Variables
var bEjecutandoToken = false;
var bEjecutandoDatos = false;

var zoom = 8.5; // Zoom del mapa

var map = L.map('map').setView([43.0695849, -2.49308], zoom); // Centrar el mapa en una posicion

var iconoPredeterminado = L.icon({ // Crear icono de predeterminado
  iconUrl: './images/predeterminado.png',
  iconSize: [35, 35],
});

var iconoSeleccionado = L.icon({ // Crear icono de seleccionado
  iconUrl: './images/seleccionado.png',
  iconSize: [35, 35],
});

// Ejecucion
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map); // Añadir el mapa del mundo

addEventListener('load', LeerDatos);

// Funciones
// Leer la meteorologia de la api
function LeerDatos() {
  var iContadorDivs = 0; // Inicializar contador

  // Obtenemos el token
  if (localStorage.Token == undefined) GetToken();
  var sToken = JSON.parse(localStorage.Token);

  // Obtener la meteorologia a traves de la api 
  if (!bEjecutandoDatos) { // Evitar doble peticion de Ajax
    $.ajax({
      type: "GET",
      dataType: "html",
      url: 'http://10.10.17.196:8080/api/Weather',
      async: false, // Sincrono
      headers: {
        "accept": "application/json",
        "Authorization": "Bearer " + sToken
      },
      beforeSend: function (response) {
        bEjecutandoDatos = true;
      },
      success: function (response) {
        var aWeather = JSON.parse(response);

        // JQuery - Run
        $(document).ready(() => {
          $("#paneles").html(" "); // Limpiamos el div de paneles

          $(".elemento").draggable({ // Añadir evento Drag a los elementos meteorologicas
            revert: "invalid",
            helper: "clone"
          });

          // Crear el registro de las anteriores sesiones (localStorage)
          if (localStorage.Registro == undefined) { // Si no existe localStorage, se crea
            var aInformacion = {};

            for (let h = 0; h < aWeather.length; h++) {
              aInformacion[aWeather[h].id] = { "Seleccionado": false, "Viento": false, "Precipitacion": false, "Direccion": false };
            }

            localStorage.Registro = JSON.stringify(aInformacion);
          } else { // Si existe el localStorage convertirlo a Array
            aInformacion = JSON.parse(localStorage.Registro);
          }

          // Crear el registro de inicio de sesion (localStorage)
          if (localStorage.Session == undefined) { // Si no existe localStorage, se crea
            var aSession = { "Sesion": false, "User": "" };
            localStorage.Session = JSON.stringify(aSession);
          } else { // Si existe el localStorage convertirlo a Array
            var aSession = JSON.parse(localStorage.Session);
          }

          // Comprobar si el usuario esta registrado
          if (!aSession.Sesion) { // Si no esta registrado
            $(`#avatar`).html(`<a class="nav-link active" href="login.html"><i class="fas fa-user"></i> Login</a>`);
          } else if (aSession.Sesion) { // Si esta registrado
            $(`#avatar`).html(`<a class="nav-link active" href="" id="off"></i>Hola, ${aSession.User} <i class="fas fa-power-off"></i></a>`); 
            
            $(`#off`).bind('click', function () {
              aSession = { "Sesion": false, "User": "" }; // Sin loggear
              localStorage.Session = JSON.stringify(aSession); // Guardamos los cambios en el localStorage

              LeerDatos(); // Ejecutamos la lectura de datos
            });
          }

          $.each(aWeather, (i) => {
            // Comprobar si el usuario no esta registrado
            if (!aSession.Sesion) {
              var iconMarker = iconoPredeterminado; // Añadir el marcador con el icono predeterminado
            }

            // Comprobar en el localStorage.Registro, si el usuario registrado
            if (!aInformacion[aWeather[i].id].Seleccionado & aSession.Sesion) { // Si no esta seleccionado el marcador
              var iconMarker = iconoPredeterminado; // Añadir el marcador con el icono predeterminado
            } else if (aInformacion[aWeather[i].id].Seleccionado && aSession.Sesion) { // Si esta seleccionado el marcador
              var iconMarker = iconoSeleccionado; // Añadir el marcador con el icono seleccionado
              iContadorDivs++;

              // Añadir/crear panel meteorologico
              var sTiempoDescripcion = "";

              if ((`${aWeather[i].description}`.toLowerCase()).includes("despejado")) sTiempoDescripcion = "sol";
              else if ((`${aWeather[i].description}`.toLowerCase()).includes("nuboso")) sTiempoDescripcion = "nube";
              else if ((`${aWeather[i].description}`.toLowerCase()).includes("lluvia")) sTiempoDescripcion = "lluvia";
              else if ((`${aWeather[i].description}`.toLowerCase()).includes("nieve")) sTiempoDescripcion = "nieve";

              $(`<div class='carta' id='${aWeather[i].id}'>
                <h3>${(aWeather[i].location).charAt(0).toUpperCase()}${(aWeather[i].location).slice(1)}</h3>
                <div class='descripcion'>
                  <img src="./images/${sTiempoDescripcion}.png" alt="Imagen descriptiva del tiempo" width="90" height="90">
                </div>
                <div class='informacion'>
                  <div class='temperatura'>
                    <h2>${aWeather[i].temperature}&deg;C</h2>
                  </div>
                  <div id='datos${aWeather[i].id}' class='datos'>
                    <p>Humedad: ${aWeather[i].humidity}%</p>
                  </div>
                </div>
              </div>`).appendTo("#paneles");

              if (aInformacion[aWeather[i].id].Viento) { // Añadir el viento al panel meteorologico
                $(`<div id='viento${aWeather[i].id}' class='elementPlus'>Velocidad del viento: ${aWeather[i].windspeed} km/h</div>`).appendTo(`#datos${aWeather[i].id}`);

                $(`#viento${aWeather[i].id}`).draggable({ // Añadir evento Drag al viento del panel meteorologico
                  revert: "invalid",
                  helper: "clone"
                });
              }

              if (aInformacion[aWeather[i].id].Precipitacion) { // Añadir la precipitacion al panel meteorologico
                $(`<div id='precipitacion${aWeather[i].id}' class='elementPlus'>Precipitación acumulada: ${aWeather[i].precipitation}%</div>`).appendTo(`#datos${aWeather[i].id}`);

                $(`#precipitacion${aWeather[i].id}`).draggable({ // Añadir evento Drag a la precipitacion del panel meteorologico
                  revert: "invalid",
                  helper: "clone"
                });
              }

              if (aInformacion[aWeather[i].id].Direccion) { // Añadir la direccion del viento al panel meteorologico
                $(`<div id='direccion${aWeather[i].id}' class='elementPlus'>Dirección del viento: ${aWeather[i].winddirection}&deg;</div>`).appendTo(`#datos${aWeather[i].id}`);

                $(`#direccion${aWeather[i].id}`).draggable({ // Añadir evento Drag a la direccion del viento del panel meteorologico
                  revert: "invalid",
                  helper: "clone"
                });
              }

              // Añadir Drag & Drop al panel meteorologico         
              $(`#${aWeather[i].id}`).droppable({ // Añadir evento Drop al panel meteorologico
                drop: function (event, ui) {

                  if (!aInformacion[aWeather[i].id].Viento && ui.draggable[0].id == "viento") { // Añadir la velocidad del viento al panel
                    $(`<div id='viento${aWeather[i].id}' class='elementPlus'>Velocidad del viento: ${aWeather[i].windspeed} km/h</div>`).appendTo(`#datos${aWeather[i].id}`);

                    $(`#viento${aWeather[i].id}`).draggable({ // Añadir evento Drag al viento del panel meteorologico
                      revert: "invalid",
                      helper: "clone"
                    });

                    aInformacion[aWeather[i].id].Viento = true; // Cambiar el registro para indicar que tiene viento
                    localStorage.Registro = JSON.stringify(aInformacion); // Guardar en el localStorage el cambio
                  };

                  if (!aInformacion[aWeather[i].id].Precipitacion && ui.draggable[0].id == "precipitacion") { // Añadir la Precipitación acumulada al panel
                    $(`<div id='precipitacion${aWeather[i].id}' class='elementPlus'>Precipitación acumulada: ${aWeather[i].precipitation}%</div>`).appendTo(`#datos${aWeather[i].id}`);

                    $(`#precipitacion${aWeather[i].id}`).draggable({ // Añadir evento Drag a la precipitacion del panel meteorologico
                      revert: "invalid",
                      helper: "clone"
                    });

                    aInformacion[aWeather[i].id].Precipitacion = true; // Cambiar el registro para indicar que tiene precipitacion
                    localStorage.Registro = JSON.stringify(aInformacion); // Guardar en el localStorage el cambio
                  };

                  if (!aInformacion[aWeather[i].id].Direccion && ui.draggable[0].id == "direccion") { // Añadir la direccion del viento al panel meteorologico
                    $(`<div id='direccion${aWeather[i].id}' class='elementPlus'>Dirección del viento: ${aWeather[i].winddirection}&deg;</div>`).appendTo(`#datos${aWeather[i].id}`);

                    $(`#direccion${aWeather[i].id}`).draggable({ // Añadir evento Drag a la direccion del viento del panel meteorologico
                      revert: "invalid",
                      helper: "clone"
                    });

                    aInformacion[aWeather[i].id].Direccion = true; // Cambiar el registro para indicar que tiene direccion
                    localStorage.Registro = JSON.stringify(aInformacion); // Guardar en el localStorage el cambio
                  };
                }
              });
            }

            // Añadir marcadores al mapa
            const marker = new L.marker([aWeather[i].latitude, aWeather[i].length], { icon: iconMarker }) // Establecer latitud, longitud e imagen del marcador
              .on('click', function (e) { // Evento del marcador
                if (this.options.icon.options.iconUrl == iconoPredeterminado.options.iconUrl && iContadorDivs < 6 && aSession.Sesion) { // Si el marcador no esta seleccionado y el usuario esta registrado
                  this.setIcon(iconoSeleccionado); // Cambiar imagen del marcador a seleccionado
                  iContadorDivs++;

                  aInformacion[aWeather[i].id].Seleccionado = true; // Cambiar el registro para indicar que esta seleccionado
                  localStorage.Registro = JSON.stringify(aInformacion); // Guardar en el localStorage el cambio

                  // Añadir/crear panel meteorologico
                  var sTiempoDescripcion = "";

                  if ((`${aWeather[i].description}`.toLowerCase()).includes("despejado")) sTiempoDescripcion = "sol";
                  else if ((`${aWeather[i].description}`.toLowerCase()).includes("nuboso")) sTiempoDescripcion = "nube";
                  else if ((`${aWeather[i].description}`.toLowerCase()).includes("lluvia")) sTiempoDescripcion = "lluvia";
                  else if ((`${aWeather[i].description}`.toLowerCase()).includes("nieve")) sTiempoDescripcion = "nieve";

                  $(`<div class='carta' id='${aWeather[i].id}'>
                    <h3>${(aWeather[i].location).charAt(0).toUpperCase()}${(aWeather[i].location).slice(1)}</h3>
                    <div class='descripcion'>
                      <img src="./images/${sTiempoDescripcion}.png" alt="Imagen descriptiva del tiempo" width="90" height="90">
                    </div>
                    <div class='informacion'>
                      <div class='temperatura'>
                        <h2>${aWeather[i].temperature}&deg;C</h2>
                      </div>
                      <div id='datos${aWeather[i].id}' class='datos'>
                        <p>Humedad: ${aWeather[i].humidity}%</p>
                      </div>
                    </div>
                  </div>`).appendTo("#paneles");

                  if (aInformacion[aWeather[i].id].Viento) { // Añadir el viento al panel meteorologico
                    $(`<div id='viento${aWeather[i].id}' class='elementPlus'>Velocidad del viento: ${aWeather[i].windspeed} km/h</div>`).appendTo(`#datos${aWeather[i].id}`);

                    $(`#viento${aWeather[i].id}`).draggable({ // Añadir evento Drag al viento del panel meteorologico
                      revert: "invalid",
                      helper: "clone"
                    });
                  }

                  if (aInformacion[aWeather[i].id].Precipitacion) { // Añadir la precipitacion al panel meteorologico
                    $(`<div id='precipitacion${aWeather[i].id}' class='elementPlus'>Precipitación acumulada: ${aWeather[i].precipitation}%</div>`).appendTo(`#datos${aWeather[i].id}`);

                    $(`#precipitacion${aWeather[i].id}`).draggable({ // Añadir evento Drag a la precipitacion del panel meteorologico
                      revert: "invalid",
                      helper: "clone"
                    });
                  }

                  if (aInformacion[aWeather[i].id].Direccion) { // Añadir la direccion del viento al panel meteorologico
                    $(`<div id='direccion${aWeather[i].id}' class='elementPlus'>Dirección del viento: ${aWeather[i].winddirection}&deg;</div>`).appendTo(`#datos${aWeather[i].id}`);

                    $(`#direccion${aWeather[i].id}`).draggable({ // Añadir evento Drag a la direccion del viento del panel meteorologico
                      revert: "invalid",
                      helper: "clone"
                    });
                  }

                  // Añadir Drag & Drop al panel meteorologico         
                  $(`#${aWeather[i].id}`).droppable({ // Añadir evento Drop al panel meteorologico
                    drop: function (event, ui) {

                      if (!aInformacion[aWeather[i].id].Viento && ui.draggable[0].id == "viento") { // Añadir la velocidad del viento al panel
                        $(`<div id='viento${aWeather[i].id}' class='elementPlus'>Velocidad del viento: ${aWeather[i].windspeed} km/h</div>`).appendTo(`#datos${aWeather[i].id}`);

                        $(`#viento${aWeather[i].id}`).draggable({ // Añadir evento Drag al viento del panel meteorologico
                          revert: "invalid",
                          helper: "clone"
                        });

                        aInformacion[aWeather[i].id].Viento = true; // Cambiar el registro para indicar que tiene viento
                        localStorage.Registro = JSON.stringify(aInformacion); // Guardar en el localStorage el cambio
                      };

                      if (!aInformacion[aWeather[i].id].Precipitacion && ui.draggable[0].id == "precipitacion") { // Añadir la Precipitación acumulada al panel
                        $(`<div id='precipitacion${aWeather[i].id}' class='elementPlus'>Precipitación acumulada: ${aWeather[i].precipitation}%</div>`).appendTo(`#datos${aWeather[i].id}`);

                        $(`#precipitacion${aWeather[i].id}`).draggable({ // Añadir evento Drag a la precipitacion del panel meteorologico
                          revert: "invalid",
                          helper: "clone"
                        });

                        aInformacion[aWeather[i].id].Precipitacion = true; // Cambiar el registro para indicar que tiene precipitacion
                        localStorage.Registro = JSON.stringify(aInformacion); // Guardar en el localStorage el cambio
                      };

                      if (!aInformacion[aWeather[i].id].Direccion && ui.draggable[0].id == "direccion") { // Añadir la direccion del viento al panel meteorologico
                        $(`<div id='direccion${aWeather[i].id}' class='elementPlus'>Dirección del viento: ${aWeather[i].winddirection}&deg;</div>`).appendTo(`#datos${aWeather[i].id}`);

                        $(`#direccion${aWeather[i].id}`).draggable({ // Añadir evento Drag a la direccion del viento del panel meteorologico
                          revert: "invalid",
                          helper: "clone"
                        });

                        aInformacion[aWeather[i].id].Direccion = true; // Cambiar el registro para indicar que tiene direccion
                        localStorage.Registro = JSON.stringify(aInformacion); // Guardar en el localStorage el cambio
                      };
                    }
                  });
                } else if (this.options.icon.options.iconUrl == iconoSeleccionado.options.iconUrl && aSession.Sesion) { // Si el marcador esta seleccionado y el usuario esta registrado
                  this.setIcon(iconoPredeterminado); // Cambiar imagen del marcador a predeterminado
                  iContadorDivs--; 

                  aInformacion[aWeather[i].id].Seleccionado = false; // Cambiar el registro para indicar que ya no esta seleccionado
                  localStorage.Registro = JSON.stringify(aInformacion); // Guardar en el localStorage el cambio

                  $(`#${aWeather[i].id}`).remove(); // Borrar panel meteorologico
                }

              }).addTo(map) // Añadir al mapa
          });


          // Añadir evento Drop al basurero
          $("#basurero").droppable({
            drop: function (event, ui) {
              var id = (`${ui.draggable[0].parentElement.id}`).substring((`datos`).length);

              if (ui.draggable[0].id == `viento${id}`) {
                aInformacion[id].Viento = false; // Cambiar el registro para indicar que ya no tiene viento
                localStorage.Registro = JSON.stringify(aInformacion); // Guardar en el localStorage el cambio

                $("#" + ui.draggable[0].id).remove(); // Borrar opcion del panel meteorologico
              } else if (ui.draggable[0].id == `precipitacion${id}`) {
                aInformacion[id].Precipitacion = false; // Cambiar el registro para indicar que ya no tiene precipitacion
                localStorage.Registro = JSON.stringify(aInformacion); // Guardar en el localStorage el cambio

                $("#" + ui.draggable[0].id).remove(); // Borrar opcion del panel meteorologico
              } else if (ui.draggable[0].id == `direccion${id}`) {
                aInformacion[id].Direccion = false; // Cambiar el registro para indicar que ya no tiene direccion
                localStorage.Registro = JSON.stringify(aInformacion); // Guardar en el localStorage el cambio

                $("#" + ui.draggable[0].id).remove(); // Borrar opcion del panel meteorologico
              }
            }
          });

          setTimeout(LeerDatos, 300000); // Lanza la lectura de datos, despues de 1 minuto
        });
      },
      error: function (response, status) {
        console.log("error");
        console.log(response);
        GetToken();
        LeerDatos();
      },
      complete: function (response, status) {
        bEjecutandoDatos = false;
      }
    });
  }
}

// Obtenemos el token para la autentificacion
function GetToken() {
  if (!bEjecutandoToken) { // Evitar doble peticion de Ajax
    $.ajax({
      type: "POST",
      dataType: "html",
      url: `http://10.10.17.196:8080/api/Users/authenticate/username/yaiza/password/1234`,
      async: false,
      headers: {
        "accept": "application/json",
      },
      beforeSend: function (response) {
        bEjecutandoToken = true;
      },
      success: function (response) {
        var aUser = JSON.parse(response);
        localStorage.Token = JSON.stringify(aUser.token); // Guardar los cambios en el localStorage
      },
      error: function (response, status) {
        console.log("error");
        console.log(response);
      },
      complete: function (response, status) {
        bEjecutandoToken = false;
      }
    });
  }
}

