using System;
using System.Collections.Generic; 
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
namespace  ReadApi.Models
{
    public class Weather
    {
        public int Id { get; set; }
        public string Location { get; set; }
        public float Latitude { get; set; }
        public float Length { get; set; }
        public float Temperature { get; set; }
        public float Humidity { get; set; }
        public float Precipitation { get; set; }
        public float Winddirection { get; set; }
        public float Windspeed { get; set; }
        public string Description { get; set; }
    }
}