using System;
using System.Collections.Generic; 
using Microsoft.EntityFrameworkCore;

namespace Background
{
    public class MeteorologyContext : DbContext
    {
        public DbSet<Weather> Weather { get; set; }

        public string connString { get; private set; }

        public MeteorologyContext()
        {
            string BDAlumno = "DB04Yaiza";
            connString = $"Server=185.60.40.210\\SQLEXPRESS,58015;Database={BDAlumno};User Id=sa;Password=Pa88word;MultipleActiveResultSets=true;";
        }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
            => options.UseSqlServer(connString);
    }
}