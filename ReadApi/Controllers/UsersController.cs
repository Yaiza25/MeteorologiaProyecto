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

        [AllowAnonymous]
        [HttpPost("authenticate/username/{username}/password/{password}")]
        public IActionResult Authenticate(string username, string password)
        {
            var response = _userService.Authenticate(username, password);

            if (response == null)
                return BadRequest(new { message = "Username or password is incorrect" });

            return Ok(response);
        }

        [Autohorrize] //<-- Error Atrrrributrrro
        [HttpGet]
        public IActionResult GetAll()
        {
            var users = _userService.GetAll();
            return Ok(users);
        }
    }
}
