using System;
using System.Net.Http;
using System.Net.Http.Headers;
using NW = Newtonsoft.Json;
using System.Collections.Generic;
using Background;
using System.Linq;
using static System.Console;
using System.Threading.Tasks;

namespace DotNet.Docker
{
    class Program
    {
        static HttpClient client = new HttpClient();
        static List<List<Object>> IdLocations = new List<List<Object>>();
        static List<List<object>> Weather = new List<List<object>>();

        static async Task Main(string[] args)
        {
            try
            {
                // Setting api
                var key = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJtZXQwMS5hcGlrZXkiLCJpc3MiOiJJRVMgUExBSUFVTkRJIEJISSBJUlVOIiwiZXhwIjoyMjM4MTMxMDAyLCJ2ZXJzaW9uIjoiMS4wLjAiLCJpYXQiOjE2Mzk5OTAyNTMsImVtYWlsIjoiaWtiZHhAcGxhaWF1bmRpLm5ldCJ9.KH77Wtl2MU_4bwT-PpDW8Uurqet-fzsLSmpx22FGcx38lS-JH7E6xPRUZSFzSoKuVHp2BTJhjd4AeOHBHZsopMoAD848jnBYlznDCBf8p4H-F4YNwC5520Jconq96jvJRvLz4fyqYMCpOUfvDuCZT790C_6wNPlH2Wpkv4HWfJiiVWbiCxGW_aJY2EAR9r5S-U8mqdv4L1I7fv53jbErusb0lCttGNNodduELv1bl-BzFEZAk6VtJoUUYMAmfFDB_rKsn9ZBzdeNpR6DFiRRHAecgCSgpXyIu4SiCDRV_FDh-y92ld5A9uRfgcxx6g3nD76jVVKfBzTFo90bpFwKVw";

                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {key}");

                // Program
                var counter = 0;
                var max = args.Length != 0 ? Convert.ToInt32(args[0]) : -1;

                while (max == -1 || counter < max)
                {
                    // Initialize
                    IdLocations = new List<List<Object>>();
                    Weather = new List<List<object>>();

                    await Run();

                    counter++;
                    await Task.Delay(40000);
                }
            }
            catch (Exception e)
            {
                WriteLine($"Main: {e.Message}");
            }
        }

        // Run
        static async Task Run()
        {
            try
            {
                WriteLine("Start");

                // Run - Get stations
                WriteLine("Reading the stations");

                HttpResponseMessage responseStations = await client.GetAsync("https://api.euskadi.eus/euskalmet/geo/regions/basque_country/zones");
                responseStations.EnsureSuccessStatusCode();
                var respStations = await responseStations.Content.ReadAsStringAsync();

                dynamic jsonStations = NW.JsonConvert.DeserializeObject(respStations);

                var IdZones = new List<Object>();
                var ZonesSet = new HashSet<Object>();

                foreach (var item in jsonStations)
                {
                    if (!IdZones.Contains(item.regionZoneId))
                        IdZones.Add(item.regionZoneId);
                    ZonesSet.Add(item.regionZoneId);
                }

                // Run - Get locations
                WriteLine("Reading the location");

                foreach (var item in IdZones)
                {
                    await GetLocations($"{item}");
                }

                // Run - Get weather
                WriteLine("Reading the weather");

                for (int i = 0; i < IdLocations.Count(); i++)
                {
                    for (int j = 0; j < IdLocations[i].Count(); j++)
                    {
                        await GetWeather($"{IdZones[i]}", $"{IdLocations[i][j]}");
                    }
                }

                // Run - Send data to the table
                var Key = 1;

                if (EmptyTable())
                {
                    WriteLine("Creating the locations table");

                    for (int i = 0; i < Weather.Count(); i++)
                    {
                        var Geolocations = await GetOpenWeather($"{Weather[i][0]}");
                        var ArrayGeolocations = Geolocations.Split('/');

                        if (float.Parse($"{ArrayGeolocations[0]}") < 44 && float.Parse($"{ArrayGeolocations[0]}") >= 42 && float.Parse($"{ArrayGeolocations[1]}") > -5 && float.Parse($"{ArrayGeolocations[1]}") <= -1)
                        {
                            CreateTable(
                                Key++,
                                $"{Weather[i][0]}",
                                float.Parse($"{ArrayGeolocations[0]}"),
                                float.Parse($"{ArrayGeolocations[1]}"),
                                float.Parse($"{Weather[i][1]}"),
                                float.Parse($"{Weather[i][2]}"),
                                float.Parse($"{Weather[i][3]}"),
                                float.Parse($"{Weather[i][4]}"),
                                float.Parse($"{Weather[i][5]}"),
                                $"{Weather[i][6]}"
                            );
                        }
                    }
                }
                else
                {
                    WriteLine("Updating the weather table");

                    for (int j = 0; j < Weather.Count(); j++)
                    {
                        var (Latitude, Length) = GetGeolocationsDB($"{Weather[j][0]}");

                        if (float.Parse(Latitude) != 0 && float.Parse(Length) != 0)
                        {
                            UpdateTable(
                                Key++,
                                float.Parse($"{Weather[j][1]}"),
                                float.Parse($"{Weather[j][2]}"),
                                float.Parse($"{Weather[j][3]}"),
                                float.Parse($"{Weather[j][4]}"),
                                float.Parse($"{Weather[j][5]}"),
                                $"{Weather[j][6]}"
                            );
                        }
                    }
                }
            }
            catch (Exception e)
            {
                WriteLine($"Run: {e.Message}");
            }

            WriteLine("End");
        }

        // Get locations
        static async Task GetLocations(string IdZone)
        {
            try
            {
                var url = $"https://api.euskadi.eus/euskalmet/geo/regions/basque_country/zones/{IdZone}/locations";

                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                var resp = await response.Content.ReadAsStringAsync();

                dynamic json = NW.JsonConvert.DeserializeObject(resp);

                var Locations = new List<Object>();

                foreach (var item in json)
                {
                    if (!Locations.Contains(item.regionZoneLocationId)) Locations.Add(item.regionZoneLocationId);
                }

                IdLocations.Add(Locations);
            }
            catch (Exception e)
            {
                WriteLine($"GetLocations ${IdZone}: {e.Message}");
            }
        }

        // Get weather
        static async Task<string> GetWeather(string ZoneId, string LocationId)
        {
            try
            {
                var TimeNow = DateTime.Now;
                var Hour = $"{TimeNow.Hour + 1}";
                var Year = $"{TimeNow.Year}";
                var Day = $"{TimeNow.Day}";
                var Month = $"{TimeNow.Month}";

                if (Hour.Length == 1) Hour = $"0{TimeNow.Hour}";
                if (Hour.Equals("00") || Hour.Equals("24")) Hour = $"0{TimeNow.Hour}:59";
                if (Day.Length == 1) Day = $"0{TimeNow.Day}";
                if (Month.Length == 1) Month = $"0{TimeNow.Month}";

                var url = $"https://api.euskadi.eus/euskalmet/weather/regions/basque_country/zones/{ZoneId}/locations/{LocationId}/forecast/trends/measures/at/{Year}/{Month}/{Day}/for/{Year}{Month}{Day}";
                
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                var resp = await response.Content.ReadAsStringAsync();

                dynamic json = NW.JsonConvert.DeserializeObject(resp);

                var WeatherInfo = new List<object>();

                foreach (var item in json.trends.set)
                {
                    string LocalTime = $"{item.range}";

                    if (LocalTime.Contains(Hour))
                    {
                        string Humidity = await GetHumidity(ZoneId, LocationId);

                        WeatherInfo.Add($"{json.regionZoneLocation.regionZoneLocationId}");
                        WeatherInfo.Add(float.Parse($"{item.temperature.value}"));
                        WeatherInfo.Add(float.Parse($"{Humidity}"));
                        WeatherInfo.Add(float.Parse($"{item.precipitation.value}"));
                        WeatherInfo.Add(float.Parse($"{item.winddirection.value}"));
                        WeatherInfo.Add(float.Parse($"{item.windspeed.value}"));
                        WeatherInfo.Add($"{item.shortDescription.SPANISH}");

                        Weather.Add(WeatherInfo);
                    }
                }
            }
            catch (System.Exception e)
            {
                WriteLine($"GetWeather {ZoneId} {LocationId}: {e.Message}");
            }

            return null;
        }

        // Get humidity
        static async Task<string> GetHumidity(string ZoneId, string LocationId)
        {
            try
            {
                var TimeNow = DateTime.Now;
                var Year = $"{TimeNow.Year}";
                var Day = $"{TimeNow.Day}";
                var Month = $"{TimeNow.Month}";

                if (Day.Length == 1) Day = $"0{TimeNow.Day}";
                if (Month.Length == 1) Month = $"0{TimeNow.Month}";

                var url = $"https://api.euskadi.eus/euskalmet/weather/regions/basque_country/zones/{ZoneId}/locations/{LocationId}/reports/for/{Year}/{Month}/{Day}/last";

                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                var resp = await response.Content.ReadAsStringAsync();

                dynamic json = NW.JsonConvert.DeserializeObject(resp);
                return $"{json.report.humidity.value}";
            }
            catch (System.Exception e)
            {
                WriteLine($"GetHumidity {ZoneId} {LocationId}: {e.Message}");
            }

            return null;
        }

        // Get OpenWeather
        static async Task<string> GetOpenWeather(string IdLocation)
        {
            try
            {
                var url = $"https://api.openweathermap.org/data/2.5/weather?q={IdLocation},ES&appid=4d8fb5b93d4af21d66a2948710284366";

                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                var resp = await response.Content.ReadAsStringAsync();

                dynamic json = NW.JsonConvert.DeserializeObject<object>(resp);

                return $"{json.coord.lat}/{json.coord.lon}";
            }
            catch (System.Exception e)
            {
                WriteLine($"GetOpenWeather {IdLocation}: {e.Message}");
            }

            return "0/0";
        }

        // Send data to the weather table
        static void CreateTable(int _id, string _location, float _latitude, float _length, float _temperature, float _humidity, float _precipitation, float _winddirection, float _windspeed, string _description)
        {
            try
            {
                using (var db = new MeteorologyContext())
                {
                    db.Weather.Add(new Weather {
                        Id = _id,
                        Location = _location,
                        Latitude = _latitude,
                        Length = _length,
                        Temperature = _temperature,
                        Humidity = _humidity,
                        Precipitation = _precipitation,
                        Winddirection = _winddirection,
                        Windspeed = _windspeed,
                        Description = _description
                    });

                    db.SaveChanges();
                }
            }
            catch (System.Exception e)
            {
                WriteLine($"CreateTable {_id}: {e.Message}");
            }
        }

        // Update the weather table
        static void UpdateTable(int _id, float _temperature, float _humidity, float _precipitation, float _winddirection, float _windspeed, string _description)
        {
            try
            {
                using (var db = new MeteorologyContext())
                {
                    var query = db.Weather.Single(c => c.Id == _id);

                    query.Temperature = _temperature;
                    query.Humidity = _humidity;
                    query.Precipitation = _precipitation;
                    query.Winddirection = _winddirection;
                    query.Windspeed = _windspeed;
                    query.Description = _description;

                    db.SaveChanges();
                }
            }
            catch (System.Exception e)
            {
                WriteLine($"UpdateTable {_id}: {e.Message}");
            }
        }

        // Check if the table has data inside
        static bool EmptyTable()
        {
            try
            {
                using (var db = new MeteorologyContext())
                {
                    return db.Weather.Count() == 0;
                }
            }
            catch (System.Exception e)
            {
                WriteLine($"EmptyTable: {e.Message}");
                return true;
            }
        }

        // Get geolocation of the locations table
        static (string, string) GetGeolocationsDB(string IdLocation)
        {
            try
            {
                using (var db = new MeteorologyContext())
                {
                    var Latitude = db.Weather.Where(a => a.Location == IdLocation).Select(mt => mt.Latitude).Single().ToString();
                    var Length = db.Weather.Where(a => a.Location == IdLocation).Select(mt => mt.Length).Single().ToString();

                    return (Latitude, Length);
                }
            }
            catch (Exception e)
            {
                WriteLine($"GetGeolocationsDB {IdLocation}: {e.Message}");
                return ("0", "0");
            }
        }
    }
}
