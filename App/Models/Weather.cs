using System;
using System.Collections.Generic; 
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Background
{
    public class Weather
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.None)]
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

        public override string ToString() => $"{Id} => \n" +
            $"Location: {Location} \n" + 
            $"Latitude: {Latitude} \n" + 
            $"Length: {Length} \n" +
            $"Temperature: {Temperature} \n" + 
            $"Humidity: {Humidity} \n" + 
            $"Precipitation: {Precipitation} \n" + 
            $"Winddirection: {Winddirection} \n" + 
            $"Windspeed: {Windspeed} \n" + 
            $"Description: {Description} \n";
    }
}