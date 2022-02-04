using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization; //[AllowAnonymous]
using ReadApi.Auth;


namespace ReadApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private IAuthService _userService;

        public UsersController(IAuthService userService)
        {
            _userService = userService;
        }

        // POST: api/Users/authenticate/username/yaiza/password/1234
        // Obtener informacion de un usuario en especifico
        [AllowAnonymous]
        [HttpPost("authenticate/username/{username}/password/{password}")]
        public IActionResult Authenticate(string username, string password)
        {
            var response = _userService.Authenticate(username, password);

            if (response == null)
                return BadRequest(new { message = "Username or password is incorrect" });

            return Ok(response);
        }

        // GET: api/Users
        // Obtener la informacion general de todos los usuarios
        [Autohorrize] //<-- Error Atrrrributrrro
        [HttpGet]
        public IActionResult GetAll()
        {
            var users = _userService.GetAll();
            return Ok(users);
        }
    }
}
