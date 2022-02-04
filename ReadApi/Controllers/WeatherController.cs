using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReadApi.Models;

namespace ReadApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WeatherController : ControllerBase
    {
        private readonly MeteorologyContext _context;

        public WeatherController(MeteorologyContext context)
        {
            _context = context;
        }

        // GET: api/Weather
        // Obtener todo la informacion
        [Autohorrize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Weather>>> GetWeather()
        {
            return await _context.Weather.ToListAsync();
        }

        // GET: api/Weather/5
        // Obtener la informacion de un id en especifico
        [Autohorrize]
        [HttpGet("{id}")]
        public async Task<ActionResult<Weather>> GetWeather(int id)
        {
            var weather = await _context.Weather.FindAsync(id);

            if (weather == null)
            {
                return NotFound();
            }

            return weather;
        }

        // GET: api/Weather/Location
        // Obtener todo la informacion local
        [Autohorrize]
        [HttpGet("Location")]
        public ActionResult GetLocationWeather()
        {
            var weather = _context.Weather.Select(o => new
            {
                Id = o.Id,
                Location = o.Location,
                Latitude = o.Latitude,
                Length = o.Length
            });

            if (weather == null)
            {
                return NotFound();
            }

            return Ok(weather);
        }

        // GET: api/Weather/Location/5 
        // Obtener todo la informacion local de un id en especifico
        [Autohorrize]
        [HttpGet("Location/{id}")]
        public ActionResult GetLocationWeather(int id)
        {
            var weather = _context.Weather.Where(i => i.Id == id).Select(o => new
            {
                Id = o.Id,
                Location = o.Location,
                Latitude = o.Latitude,
                Length = o.Length
            });

            if (weather == null)
            {
                return NotFound();
            }

            return Ok(weather);
        }

        // GET: api/Weather/Statistics
        // Obtener todo la informacion meteorologica
        [Autohorrize]
        [HttpGet("Statistics")]
        public ActionResult GetStatisticsWeather()
        {
            var weather =  _context.Weather.Select(o => new
            {
                Id = o.Id,
                Temperature = o.Temperature,
                Humidity = o.Humidity,
                Precipitation = o.Precipitation,
                Winddirection = o.Winddirection,
                Windspeed = o.Windspeed,
                Description = o.Description
            });

            if (weather == null)
            {
                return NotFound();
            }

            return Ok(weather);
        }

        // GET: api/Weather/Statistics/5
        // Obtener todo la informacion meteorologica de un id en especifico
        [Autohorrize]
        [HttpGet("Statistics/{id}")]
        public ActionResult GetStatisticsWeather(int id)
        {
            var weather = _context.Weather.Where(i => i.Id == id).Select(o => new
            {
                Id = o.Id,
                Temperature = o.Temperature,
                Humidity = o.Humidity,
                Precipitation = o.Precipitation,
                Winddirection = o.Winddirection,
                Windspeed = o.Windspeed,
                Description = o.Description
            });

            if (weather == null)
            {
                return NotFound();
            }

            return Ok(weather);
        }
    }
}
